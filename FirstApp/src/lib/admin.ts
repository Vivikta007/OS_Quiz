// Shared types for the admin screens (admin, admin-generate, admin-question).
// Only admins can call these endpoints - the backend checks every request.

export type QuestionStatus = "pending" | "active" | "rejected";
export type Difficulty = "Easy" | "Medium" | "Hard";

export const DIFFICULTIES: readonly Difficulty[] = ["Easy", "Medium", "Hard"];

// A question exactly as GET /admin/questions returns it (answer included)
export type AdminQuestion = {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  topic: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  source: "manual" | "ai";
  explanation: string | null;
  review_note: string | null; // e.g. the AI checker disagreed
  created_at: string;
  reviewed_at: string | null;
};
