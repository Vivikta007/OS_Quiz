import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import {
  type AdminQuestion,
  DIFFICULTIES,
  type Difficulty,
  type QuestionStatus,
} from "@/lib/admin";
import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { SegmentedControl } from "@/ui/Choice";
import { selectHaptic } from "@/ui/haptics";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { colors, radius, spacing, typography } from "@/ui/theme";

// Admin only: edit one question (PATCH /admin/questions/:id).
// The Question Review screen passes the question in as a JSON param.

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export default function AdminQuestionScreen() {
  const params = useLocalSearchParams<{ question?: string }>();
  const original = parseQuestion(params.question);

  const [text, setText] = useState(original?.question ?? "");
  const [options, setOptions] = useState<string[]>(original?.options ?? []);
  const [correctIndex, setCorrectIndex] = useState(original?.correct_index ?? 0);
  const [topic, setTopic] = useState(original?.topic ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    original?.difficulty ?? "Medium",
  );
  const [explanation, setExplanation] = useState(original?.explanation ?? "");
  const [saving, setSaving] = useState<"save" | "approve" | null>(null);

  if (!original) {
    return (
      <Screen header={<Header title="Edit question" />}>
        <View style={styles.state}>
          <AppText variant="small" tone="secondary" center>
            This question could not be opened.
          </AppText>
          <Button
            title="Back to review"
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

  const save = async (approve: boolean) => {
    const cleanOptions = options.map((option) => option.trim());

    if (text.trim().length < 5) {
      showAlert("Question too short", "Write the full question.");
      return;
    }
    if (cleanOptions.some((option) => !option)) {
      showAlert("Empty option", "Fill in every option or remove it.");
      return;
    }
    if (
      new Set(cleanOptions.map((option) => option.toLowerCase())).size !==
      cleanOptions.length
    ) {
      showAlert("Duplicate options", "Every option must be different.");
      return;
    }
    if (topic.trim().length < 2) {
      showAlert("Missing topic", "Enter the question's topic.");
      return;
    }

    const body: Record<string, unknown> = {
      question: text.trim(),
      options: cleanOptions,
      correct_index: correctIndex,
      topic: topic.trim(),
      difficulty,
      explanation: explanation.trim(),
    };
    if (approve) {
      body.status = "active" satisfies QuestionStatus;
    }

    setSaving(approve ? "approve" : "save");

    try {
      await apiRequest(`/admin/questions/${original.id}`, {
        method: "PATCH",
        auth: true,
        body,
      });
      // The review list reloads itself when it comes back into view
      goBack("/admin");
    } catch (error) {
      showAlert(
        "Could not save",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <Screen
      header={<Header title="Edit question" />}
      scroll
      keyboard
      footer={
        <>
          {original.status !== "active" && (
            <Button
              title="Save and approve"
              loading={saving === "approve"}
              disabled={saving !== null}
              onPress={() => save(true)}
            />
          )}
          <Button
            title="Save changes"
            variant={original.status === "active" ? "primary" : "secondary"}
            loading={saving === "save"}
            disabled={saving !== null}
            onPress={() => save(false)}
          />
        </>
      }
    >
      <View style={styles.form}>
        {original.review_note && (
          <View style={styles.warning}>
            <Ionicons name="warning" size={16} color={colors.warning} />
            <AppText variant="small" style={styles.warningText}>
              {original.review_note}
            </AppText>
          </View>
        )}

        <AppText variant="label" tone="secondary">
          Question
        </AppText>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          placeholderTextColor={colors.textMuted}
        />

        <AppText variant="label" tone="secondary" style={styles.label}>
          Options · tap the circle to mark the correct one
        </AppText>
        {options.map((option, index) => {
          const correct = index === correctIndex;

          return (
            <View key={index} style={styles.optionRow}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: correct }}
                accessibilityLabel={`Mark option ${index + 1} as correct`}
                hitSlop={8}
                onPress={() => {
                  selectHaptic();
                  setCorrectIndex(index);
                }}
              >
                <Ionicons
                  name={correct ? "checkmark-circle" : "ellipse-outline"}
                  size={26}
                  color={correct ? colors.success : colors.textMuted}
                />
              </Pressable>
              <TextInput
                style={[styles.input, styles.optionInput, correct && styles.correctInput]}
                value={option}
                onChangeText={(value) => updateOption(index, value)}
                maxLength={300}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor={colors.textMuted}
              />
              {options.length > MIN_OPTIONS && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove option ${index + 1}`}
                  hitSlop={8}
                  onPress={() => removeOption(index)}
                >
                  <Ionicons name="close" size={22} color={colors.textMuted} />
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
          />
        )}

        <AppText variant="label" tone="secondary" style={styles.label}>
          Topic
        </AppText>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          maxLength={60}
          placeholderTextColor={colors.textMuted}
        />

        <AppText variant="label" tone="secondary" style={styles.label}>
          Difficulty
        </AppText>
        <SegmentedControl
          options={DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
        />

        <AppText variant="label" tone="secondary" style={styles.label}>
          Explanation (shown after answering)
        </AppText>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={explanation}
          onChangeText={setExplanation}
          multiline
          maxLength={1000}
          placeholder="Why the correct answer is right"
          placeholderTextColor={colors.textMuted}
        />
      </View>
    </Screen>
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

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  form: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  label: {
    marginTop: spacing.lg,
  },
  input: {
    ...typography.body,
    minHeight: 50,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  optionInput: {
    flex: 1,
  },
  correctInput: {
    borderColor: colors.success,
  },
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.warningSoft,
  },
  warningText: {
    flex: 1,
    color: colors.warning,
  },
});
