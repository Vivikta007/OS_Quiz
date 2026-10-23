import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";

import { DIFFICULTIES, type Difficulty } from "@/lib/admin";
import { showAlert } from "@/lib/alert";
import { apiRequest } from "@/lib/api";
import { goBack } from "@/lib/navigation";
import { AppText } from "@/ui/AppText";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Chip, SegmentedControl } from "@/ui/Choice";
import { Bullet } from "@/ui/Brand";
import { Header } from "@/ui/Header";
import { Screen } from "@/ui/Screen";
import { fonts, layout, radius, spacing, typography } from "@/ui/theme";
import { createStyles, useTheme } from "@/ui/ThemeProvider";

// Admin only: ask Gemini to write new questions - about a topic, or from an
// uploaded document (lecture notes, a textbook chapter...). They're saved
// as "pending" - nothing reaches players until approved on the Question
// Review screen. From a document, the AI can also find topics the app
// doesn't have yet; they go live only when one of their questions is
// approved.
//
// Generating takes 30-120 seconds, so the POST only starts a background
// job; this screen then checks GET /admin/generate/{id} every few seconds.
// Leaving the screen is fine - the job keeps running.

const MODES = ["Topic", "Document"] as const;
type Mode = (typeof MODES)[number];

const COUNTS = [5, 10, 15] as const;
const POLL_INTERVAL_MS = 3000;
const UPLOAD_TIMEOUT_MS = 60000;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_TOPIC_CHIPS = 12;

const DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/*",
];

type Job = {
  status: "running" | "done" | "failed";
  created: number;
  skipped: string[];
  new_topics: string[];
  document: string | null;
  error: string | null;
};

type PickedFile = DocumentPicker.DocumentPickerAsset;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatSize(bytes: number | undefined) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminGenerateScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("Topic");
  const [topics, setTopics] = useState<string[]>([]);
  // null = no topic picked; for a document that means "let the AI find them"
  const [topic, setTopic] = useState<string | null>(null);
  const [file, setFile] = useState<PickedFile | null>(null);
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

  // Every topic (any status) to search and pick from
  useEffect(() => {
    apiRequest("/admin/questions?status=pending", { auth: true })
      .then((data: { topics: string[] }) => setTopics(data.topics))
      .catch(() => {
        // Not essential - a new topic can still be typed in
      });
  }, []);

  const canGenerate = mode === "Topic" ? topic !== null : file !== null;

  const pickFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: DOCUMENT_TYPES,
      copyToCacheDirectory: true,
    });
    if (picked.canceled) {
      return;
    }

    const asset = picked.assets[0];
    if (asset.size && asset.size > MAX_UPLOAD_BYTES) {
      showAlert("File too big", "Pick a file under 10 MB.");
      return;
    }
    setFile(asset);
  };

  // Start the job: a JSON request for a topic, a file upload for a document
  const startJob = async (): Promise<string> => {
    if (mode === "Topic" || !file) {
      const { job_id: jobId } = await apiRequest("/admin/generate", {
        method: "POST",
        auth: true,
        body: { topic, difficulty, count, guidance: guidance.trim() },
      });
      return jobId;
    }

    const form = new FormData();
    if (Platform.OS === "web" && file.file) {
      form.append("file", file.file, file.name);
    } else {
      // React Native uploads a local file from its uri (apiRequest sends
      // FormData with XMLHttpRequest, which reads the file natively)
      form.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? "application/octet-stream",
      } as unknown as Blob);
    }
    form.append("difficulty", difficulty);
    form.append("count", String(count));
    form.append("topic", topic ?? "");
    form.append("guidance", guidance.trim());

    const { job_id: jobId } = await apiRequest("/admin/generate-from-document", {
      method: "POST",
      auth: true,
      body: form,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
    return jobId;
  };

  const generate = async () => {
    if (!canGenerate) {
      return;
    }

    setGenerating(true);
    setElapsed(0);
    setResult(null);

    try {
      const jobId = await startJob();

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
            <Button title="Review them" onPress={() => goBack("/admin")} />
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
                ? `${mode === "Document" ? "Reading the document" : "Writing questions"}… ${elapsed}s`
                : `Generate ${count} questions`
            }
            disabled={generating || !canGenerate}
            onPress={generate}
          />
        )
      }
    >
      {result ? (
        <ResultSummary result={result} />
      ) : (
        <View style={styles.form}>
          <SegmentedControl
            options={MODES}
            value={mode}
            onChange={setMode}
            format={(value) =>
              value === "Topic" ? "From a topic" : "From a document"
            }
          />

          {mode === "Document" && (
            <>
              <AppText variant="label" tone="secondary" style={styles.label}>
                Document
              </AppText>
              {file ? (
                <Card style={styles.file}>
                  <Bullet />
                  <View style={styles.fileText}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                      {file.name}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {formatSize(file.size)}
                    </AppText>
                  </View>
                  {!generating && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove file"
                      hitSlop={layout.hitSlop}
                      onPress={() => setFile(null)}
                    >
                      <Ionicons name="close" size={22} color={colors.textMuted} />
                    </Pressable>
                  )}
                </Card>
              ) : (
                <Button title="Choose a file" variant="secondary" onPress={pickFile} />
              )}
              <AppText variant="caption" tone="muted">
                PDF, Word (.docx), .txt or .md, up to 10 MB.
              </AppText>
            </>
          )}

          <AppText variant="label" tone="secondary" style={styles.label}>
            Topic
          </AppText>
          <TopicSearch
            topics={topics}
            value={topic}
            onChange={setTopic}
            allowAuto={mode === "Document"}
            disabled={generating}
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
            placeholder={
              mode === "Document"
                ? "e.g. Only use chapter 3"
                : "e.g. Focus on Round Robin calculations"
            }
            placeholderTextColor={colors.textMuted}
            value={guidance}
            onChangeText={setGuidance}
            maxLength={300}
            multiline
            editable={!generating}
          />

          <AppText variant="small" tone="muted" style={styles.note}>
            {mode === "Document"
              ? "Gemini reads the document and writes questions only from what it says, then a second check answers them. New questions - and any new topics it finds - wait in Pending until you approve them."
              : "Gemini writes the questions, then a second check answers them without the answer key. Any disagreement is flagged for you. New questions stay pending until you approve them."}{" "}
            This usually takes 30-120 seconds - you can leave this screen and
            they will still appear under Pending.
          </AppText>
        </View>
      )}
    </Screen>
  );
}

// Search the existing topics, pick one, or type a new one. With allowAuto
// (documents), "Let AI find topics" (value null) is offered first.
function TopicSearch({
  topics,
  value,
  onChange,
  allowAuto,
  disabled,
}: {
  topics: string[];
  value: string | null;
  onChange: (topic: string | null) => void;
  allowAuto: boolean;
  disabled: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const typed = query.trim().replace(/\s+/g, " ");
  const lowered = typed.toLowerCase();

  const matches = topics.filter((name) => name.toLowerCase().includes(lowered));
  const shown = matches.slice(0, MAX_TOPIC_CHIPS);
  const exactMatch = topics.find((name) => name.toLowerCase() === lowered);
  // The picked topic stays visible even when the search hides it
  const pickedHidden = value !== null && !shown.includes(value) && value !== typed;

  // Tapping the picked topic again un-picks it
  const toggle = (name: string) => onChange(name === value ? null : name);

  return (
    <View style={styles.topicSearch}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search topics, or type a new one"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          maxLength={60}
          editable={!disabled}
          returnKeyType="done"
          onSubmitEditing={() => {
            // Enter picks the exact or only match, or the text as a new topic
            if (typed.length >= 2) {
              onChange(exactMatch ?? (matches.length === 1 ? matches[0] : typed));
            }
          }}
        />
        {query.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={layout.hitSlop}
            onPress={() => setQuery("")}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.chips}>
        {allowAuto && (
          <Chip
            label="Let AI find topics"
            selected={value === null}
            onPress={() => onChange(null)}
          />
        )}
        {pickedHidden && <Chip label={value} selected onPress={() => toggle(value)} />}
        {shown.map((name) => (
          <Chip
            key={name}
            label={name}
            selected={name === value}
            onPress={() => toggle(name)}
          />
        ))}
        {typed.length >= 2 && !exactMatch && (
          <Chip
            label={`New topic: ${typed}`}
            selected={value === typed}
            onPress={() => toggle(typed)}
          />
        )}
      </View>

      {matches.length > shown.length && (
        <AppText variant="caption" tone="muted">
          {matches.length - shown.length} more - keep typing to narrow down
        </AppText>
      )}
      {!allowAuto && value === null && (
        <AppText variant="caption" tone="muted">
          Pick a topic, or type a new one and tap it.
        </AppText>
      )}
      {allowAuto && value === null && (
        <AppText variant="caption" tone="muted">
          The AI tags each question with an existing topic, or a new one if
          the document covers something the app doesn&apos;t have yet.
        </AppText>
      )}
    </View>
  );
}

function ResultSummary({ result }: { result: Job }) {
  const styles = useStyles();
  const created = result.created;

  return (
    <View style={styles.form}>
      <Card style={styles.summary}>
        <AppText variant="heading" center>
          {created > 0
            ? `${created} new question${created === 1 ? "" : "s"} ready to review`
            : "No new questions were added"}
        </AppText>
        {result.document && (
          <AppText variant="small" tone="secondary" center>
            From {result.document}
          </AppText>
        )}
      </Card>

      {result.new_topics.length > 0 && (
        <>
          <AppText variant="label" tone="secondary" style={styles.label}>
            New topics found ({result.new_topics.length})
          </AppText>
          <View style={styles.chips}>
            {result.new_topics.map((name) => (
              <View key={name} style={styles.newTopic}>
                <AppText variant="small" style={styles.newTopicText}>
                  {name}
                </AppText>
              </View>
            ))}
          </View>
          <AppText variant="caption" tone="muted">
            These topics are pending too. They appear in quizzes once you
            approve at least one of their questions.
          </AppText>
        </>
      )}

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

const useStyles = createStyles((colors) => ({
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
  },
  topicSearch: {
    gap: spacing.sm,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.md,
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
  file: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  fileText: {
    flex: 1,
    gap: 2,
  },
  note: {
    marginTop: spacing.lg,
  },
  summary: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  newTopic: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
  },
  newTopicText: {
    color: colors.warning,
    fontFamily: fonts.bodySemiBold,
  },
}));
