import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { DIFFICULTIES, type Difficulty } from "@/lib/admin";
import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Chip, SegmentedControl } from "@/ui/Choice";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { colors, radius, spacing, typography } from "@/ui/theme";

// Admin only: ask Gemini to write new questions. They're saved as
// "pending" - nothing reaches players until approved on the Question
// Review screen.
//
// Generating takes 30-120 seconds, so POST /admin/generate only starts a
// background job; this screen then checks GET /admin/generate/{id} every
// few seconds. Leaving the screen is fine - the job keeps running.

const COUNTS = [5, 10, 15] as const;
const POLL_INTERVAL_MS = 3000;

type Job = {
  status: "running" | "done" | "failed";
  created: number;
  skipped: string[];
  error: string | null;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AdminGenerateScreen() {
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(5);
  const [guidance, setGuidance] = useState("");
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<Job | null>(null);

  // Stop checking on the job once the user leaves this screen
  const onScreen = useRef(true);
  useEffect(() => {
    onScreen.current = true;
    return () => {
      onScreen.current = false;
    };
  }, []);

  // Existing topics to pick from (typing a new name creates a new topic)
  useEffect(() => {
    apiRequest("/admin/questions?status=active", { auth: true })
      .then((data: { topics: string[] }) => setTopics(data.topics))
      .catch(() => {
        // Not essential - the topic can still be typed in
      });
  }, []);

  const trimmedTopic = topic.trim();

  const generate = async () => {
    if (trimmedTopic.length < 2) {
      showAlert("Missing topic", "Pick a topic or type a new one.");
      return;
    }

    setGenerating(true);
    setElapsed(0);
    setResult(null);

    try {
      const { job_id: jobId } = await apiRequest("/admin/generate", {
        method: "POST",
        auth: true,
        body: {
          topic: trimmedTopic,
          difficulty,
          count,
          guidance: guidance.trim(),
        },
      });

      const startedAt = Date.now();
      let job: Job;
      do {
        await wait(POLL_INTERVAL_MS);
        if (!onScreen.current) {
          return; // the job carries on; its questions will appear in Pending
        }
        setElapsed(Math.round((Date.now() - startedAt) / 1000));
        job = await apiRequest(`/admin/generate/${jobId}`, { auth: true });
      } while (job.status === "running");

      if (job.status === "failed") {
        showAlert("Generation failed", job.error ?? undefined);
      } else {
        setResult(job);
      }
    } catch (error) {
      showAlert(
        "Generation failed",
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Screen
      header={<Header title="Generate with AI" />}
      scroll
      keyboard
      footer={
        result ? (
          <>
            <Button
              title="Review them"
              onPress={() => goBack("/admin")}
            />
            <Button
              title="Generate more"
              variant="ghost"
              onPress={() => setResult(null)}
            />
          </>
        ) : (
          <Button
            title={
              generating
                ? `Writing questions… ${elapsed}s`
                : `Generate ${count} questions`
            }
            disabled={generating || trimmedTopic.length < 2}
            onPress={generate}
          />
        )
      }
    >
      {result ? (
        <ResultSummary result={result} />
      ) : (
        <View style={styles.form}>
          <AppText variant="label" tone="secondary">
            Topic
          </AppText>
          {topics.length > 0 && (
            <View style={styles.chips}>
              {topics.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  selected={name === trimmedTopic}
                  onPress={() => setTopic(name === trimmedTopic ? "" : name)}
                />
              ))}
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder="…or type a new topic, e.g. Virtualization"
            placeholderTextColor={colors.textMuted}
            value={topic}
            onChangeText={setTopic}
            maxLength={60}
            editable={!generating}
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
            How many
          </AppText>
          <SegmentedControl options={COUNTS} value={count} onChange={setCount} />

          <AppText variant="label" tone="secondary" style={styles.label}>
            Extra instructions (optional)
          </AppText>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="e.g. Focus on Round Robin calculations"
            placeholderTextColor={colors.textMuted}
            value={guidance}
            onChangeText={setGuidance}
            maxLength={300}
            multiline
            editable={!generating}
          />

          <AppText variant="small" tone="muted" style={styles.note}>
            Gemini writes the questions, then a second check answers them
            without the answer key. Any disagreement is flagged for you. New
            questions stay pending until you approve them. This usually takes
            30-120 seconds - you can leave this screen and they will still
            appear under Pending.
          </AppText>
        </View>
      )}
    </Screen>
  );
}

function ResultSummary({ result }: { result: Job }) {
  const created = result.created;

  return (
    <View style={styles.form}>
      <Card style={styles.summary}>
        <Ionicons
          name={created > 0 ? "checkmark-circle" : "alert-circle"}
          size={40}
          color={created > 0 ? colors.success : colors.warning}
        />
        <AppText variant="heading" center>
          {created > 0
            ? `${created} new question${created === 1 ? "" : "s"} ready to review`
            : "No new questions were added"}
        </AppText>
      </Card>

      {result.skipped.length > 0 && (
        <>
          <AppText variant="label" tone="secondary" style={styles.label}>
            Skipped ({result.skipped.length})
          </AppText>
          {result.skipped.map((reason, index) => (
            <AppText key={index} variant="small" tone="muted">
              • {reason}
            </AppText>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  label: {
    marginTop: spacing.lg,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
  note: {
    marginTop: spacing.lg,
  },
  summary: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
});
