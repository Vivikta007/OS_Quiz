import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import {
  type AdminQuestion,
  DIFFICULTIES,
  type Difficulty,
  type QuestionStatus,
} from "@/lib/admin";
import { showAlert } from "@/lib/alert";
import { ApiError, apiRequest } from "@/lib/api";
import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Chip, SegmentedControl } from "@/ui/Choice";
import { selectHaptic, successHaptic } from "@/ui/haptics";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { fonts, radius, spacing, typography } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

// Admin only: write a question by hand (POST /admin/questions), or edit
// an existing one (PATCH /admin/questions/:id). The workspace passes the
// question to edit in as a JSON param; without it this is a blank form.

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const BLANK_OPTIONS = ["", "", "", ""];

export default function AdminQuestionScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ question?: string }>();
  const original = parseQuestion(params.question);
  const creating = !params.question;

  const [text, setText] = useState(original?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    original?.options ?? BLANK_OPTIONS,
  );
  const [correctIndex, setCorrectIndex] = useState(original?.correct_index ?? 0);
  const [topic, setTopic] = useState(original?.topic ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    original?.difficulty ?? "Medium",
  );
  const [explanation, setExplanation] = useState(original?.explanation ?? "");
  const [saving, setSaving] = useState<"save" | "approve" | null>(null);
  // Existing topics, offered as one-tap choices so spelling stays consistent
  const [knownTopics, setKnownTopics] = useState<string[]>([]);
  // After adding a question the form clears for the next one
  const [added, setAdded] = useState<{ topic: string; live: boolean } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    apiRequest("/admin/questions?status=active", { auth: true })
      .then((data: { topics: string[] }) => setKnownTopics(data.topics))
      .catch(() => {});
  }, []);

  if (!creating && !original) {
    return (
      <Screen header={<Header title="Edit question" />}>
        <View style={styles.state}>
          <AppText variant="small" tone="secondary" center>
            This question could not be opened.
          </AppText>
          <Button
            title="Back to workspace"
            variant="secondary"
            onPress={() => goBack("/admin")}
          />
        </View>
      </Screen>
    );
  }

  const updateOption = (index: number, value: string) => {
    setOptions((current) => current.map((o, i) => (i === index ? value : o)));
  };

  const removeOption = (index: number) => {
    setOptions((current) => current.filter((_, i) => i !== index));
    // Keep the same option marked correct after the list shifts
    if (index < correctIndex) {
      setCorrectIndex(correctIndex - 1);
    } else if (index === correctIndex) {
      setCorrectIndex(0);
    }
  };

  // Checks the form; returns the cleaned options, or null after an alert
  const validate = () => {
    const cleanOptions = options.map((option) => option.trim());

    if (text.trim().length < 5) {
      showAlert("Question too short", "Write the full question.");
      return null;
    }
    if (cleanOptions.some((option) => !option)) {
      showAlert("Empty option", "Fill in every option or remove it.");
      return null;
    }
    if (
      new Set(cleanOptions.map((option) => option.toLowerCase())).size !==
      cleanOptions.length
    ) {
      showAlert("Duplicate options", "Every option must be different.");
      return null;
    }
    if (topic.trim().length < 2) {
      showAlert("Missing topic", "Enter the question's topic.");
      return null;
    }
    return cleanOptions;
  };

  // approve: publish straight away (new) / save and approve (existing)
  const save = async (approve: boolean) => {
    const cleanOptions = validate();
    if (!cleanOptions) return;

    const body: Record<string, unknown> = {
      question: text.trim(),
      options: cleanOptions,
      correct_index: correctIndex,
      topic: topic.trim(),
      difficulty,
      explanation: explanation.trim(),
    };

    setSaving(approve ? "approve" : "save");

    try {
      if (creating) {
        body.status = (approve ? "active" : "pending") satisfies QuestionStatus;
        await apiRequest("/admin/questions", { method: "POST", auth: true, body });
        successHaptic();
        // Ready for the next one: same topic and difficulty, blank question
        setAdded({ topic: topic.trim(), live: approve });
        if (!knownTopics.includes(topic.trim())) {
          setKnownTopics((current) => [...current, topic.trim()].sort());
        }
        setText("");
        setOptions(BLANK_OPTIONS);
        setCorrectIndex(0);
        setExplanation("");
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        if (approve) {
          body.status = "active" satisfies QuestionStatus;
        }
        await apiRequest(`/admin/questions/${original!.id}`, {
          method: "PATCH",
          auth: true,
          // The version this screen opened - refused if another admin has
          // saved since (409), instead of overwriting their change
          body: { ...body, expected_version: original!.version },
        });
        // The workspace reloads itself when it comes back into view
        goBack("/admin");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && !creating) {
        // Another admin saved first. Go back to the list, which reloads
        // with their version; this screen's edits would overwrite it.
        showAlert("Changed by another admin", error.message, [
          { text: "Reload", onPress: () => goBack("/admin") },
        ]);
      } else {
        showAlert(
          "Could not save",
          error instanceof Error ? error.message : undefined,
        );
      }
    } finally {
      setSaving(null);
    }
  };

  const filledOptions = options.filter((option) => option.trim()).length;
  const typedTopic = topic.trim().toLowerCase();
  const topicChoices = knownTopics.filter(
    (name) => !typedTopic || name.toLowerCase().includes(typedTopic),
  );

  const footer = creating ? (
    <>
      <Button
        title="Publish question"
        loading={saving === "approve"}
        disabled={saving !== null}
        onPress={() => save(true)}
      />
      <Button
        title="Save as pending"
        variant="secondary"
        loading={saving === "save"}
        disabled={saving !== null}
        onPress={() => save(false)}
      />
    </>
  ) : (
    <>
      {original!.status !== "active" && (
        <Button
          title="Save and approve"
          loading={saving === "approve"}
          disabled={saving !== null}
          onPress={() => save(true)}
        />
      )}
      <Button
        title="Save changes"
        variant={original!.status === "active" ? "primary" : "secondary"}
        loading={saving === "save"}
        disabled={saving !== null}
        onPress={() => save(false)}
      />
    </>
  );

  return (
    <Screen
      header={<Header title={creating ? "New question" : "Edit question"} />}
      scroll
      keyboard
      scrollRef={scrollRef}
      footer={footer}
    >
      <View style={styles.form}>
        {creating && !added && (
          <AppText variant="small" tone="secondary">
            Write a multiple-choice question. Published questions show up in
            quizzes straight away.
          </AppText>
        )}

        {added && (
          <View style={styles.success}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <AppText variant="small" style={styles.successText}>
              Added to {added.topic}
              {added.live ? " and live in quizzes" : " as pending"}. Write the
              next one, or go back when you are done.
            </AppText>
          </View>
        )}

        {original?.review_note && (
          <View style={styles.warning}>
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <AppText variant="small" style={styles.warningText}>
              {original.review_note}
            </AppText>
          </View>
        )}

        {/* QUESTION */}
        <Card style={styles.section}>
          <SectionLabel step="1" title="Question" />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={text}
            onChangeText={(value) => {
              setText(value);
              setAdded(null);
            }}
            multiline
            maxLength={500}
            placeholder="e.g. Which scheduling algorithm can cause starvation?"
            placeholderTextColor={colors.textMuted}
          />
          <AppText variant="caption" tone="muted" style={styles.counter}>
            {text.length}/500
          </AppText>
        </Card>

        {/* OPTIONS */}
        <Card style={styles.section}>
          <SectionLabel
            step="2"
            title="Answer options"
            hint={`${filledOptions}/${options.length} filled`}
          />
          <AppText variant="caption" tone="muted">
            Tap a letter to mark the correct answer.
          </AppText>
          {options.map((option, index) => {
            const correct = index === correctIndex;
            const letter = String.fromCharCode(65 + index);

            return (
              <View key={index} style={styles.optionRow}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: correct }}
                  accessibilityLabel={`Mark option ${letter} as correct`}
                  hitSlop={8}
                  onPress={() => {
                    selectHaptic();
                    setCorrectIndex(index);
                  }}
                  style={[styles.letter, correct && styles.letterCorrect]}
                >
                  {correct ? (
                    <Ionicons name="checkmark" size={16} color={colors.onAccent} />
                  ) : (
                    <AppText variant="caption" style={styles.letterText}>
                      {letter}
                    </AppText>
                  )}
                </Pressable>
                <TextInput
                  style={[styles.input, styles.optionInput, correct && styles.correctInput]}
                  value={option}
                  onChangeText={(value) => updateOption(index, value)}
                  maxLength={300}
                  placeholder={`Option ${letter}`}
                  placeholderTextColor={colors.textMuted}
                />
                {options.length > MIN_OPTIONS && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove option ${letter}`}
                    hitSlop={8}
                    onPress={() => removeOption(index)}
                  >
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            );
          })}
          {options.length < MAX_OPTIONS && (
            <Button
              title="Add option"
              size="sm"
              variant="ghost"
              onPress={() => setOptions((current) => [...current, ""])}
              style={styles.addOption}
            />
          )}
        </Card>

        {/* DETAILS */}
        <Card style={styles.section}>
          <SectionLabel step="3" title="Topic and difficulty" />
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            maxLength={60}
            placeholder="e.g. CPU Scheduling"
            placeholderTextColor={colors.textMuted}
          />
          {topicChoices.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              keyboardShouldPersistTaps="handled"
            >
              {topicChoices.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  selected={name === topic.trim()}
                  onPress={() => setTopic(name)}
                />
              ))}
            </ScrollView>
          )}
          <SegmentedControl
            options={DIFFICULTIES}
            value={difficulty}
            onChange={setDifficulty}
          />
        </Card>

        {/* EXPLANATION */}
        <Card style={styles.section}>
          <SectionLabel step="4" title="Explanation" hint="Optional" />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={explanation}
            onChangeText={setExplanation}
            multiline
            maxLength={1000}
            placeholder="Why the correct answer is right. Shown after answering."
            placeholderTextColor={colors.textMuted}
          />
        </Card>
      </View>
    </Screen>
  );
}

function SectionLabel({
  step,
  title,
  hint,
}: {
  step: string;
  title: string;
  hint?: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.sectionLabel}>
      <View style={styles.step}>
        <AppText variant="caption" tone="accent" style={styles.stepText}>
          {step}
        </AppText>
      </View>
      <AppText variant="bodyStrong" style={styles.sectionTitle}>
        {title}
      </AppText>
      {hint && (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      )}
    </View>
  );
}

function parseQuestion(raw: string | undefined): AdminQuestion | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AdminQuestion;
  } catch {
    return null;
  }
}

const useStyles = createStyles((colors) => ({
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  section: {
    gap: spacing.sm + 2,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  step: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontFamily: fonts.bodySemiBold,
  },
  sectionTitle: {
    flex: 1,
  },
  input: {
    ...typography.body,
    minHeight: 46,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: radius.sm + 1,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  letterCorrect: {
    backgroundColor: colors.accent,
  },
  letterText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
  },
  optionInput: {
    flex: 1,
  },
  correctInput: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  addOption: {
    alignSelf: "flex-start",
  },
  chips: {
    gap: spacing.sm,
  },
  success: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  successText: {
    flex: 1,
    color: colors.success,
  },
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },
  warningText: {
    flex: 1,
    color: colors.warning,
  },
}));
