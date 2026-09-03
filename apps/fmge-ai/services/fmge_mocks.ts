import { authenticatedFetch } from "@/lib/api";

export interface MockTemplate {
  id: string;
  title: string;
  type: string;
  total_questions: number;
  duration_mins: number;
  parts: Array<{ name: string; questions: number; duration: number }>;
  difficulty: string;
  attempts_count: number;
  average_score: string;
  pass_cutoff: number;
}

export interface MockQuestion {
  id: number;
  part: string;
  subject: string;
  topic: string;
  stem: string;
  options: Array<{ id: number; text: string }>;
  correct_option?: number;
}

export interface MockSubmissionResult {
  test_id: string;
  total_score: number;
  max_marks: number;
  pass_cutoff: number;
  result: "PASS" | "FAIL";
  percentile: number;
  speed_per_question_seconds: number;
  subject_breakdown: Record<string, { correct: number; total: number; accuracy_pct: number }>;
  mistake_categorization: {
    knowledge_gap: number;
    concept_confusion: number;
    time_pressure: number;
    silly_error: number;
  };
}

export async function fetchMockTemplates(): Promise<MockTemplate[]> {
  const res = await authenticatedFetch("/api/fmge/mock-tests/list");
  if (!res.ok) throw new Error("Failed to load mock templates");
  const data = await res.json();
  return data.templates || [];
}

export async function fetchMockQuestions(testId: string = "gt-01"): Promise<MockQuestion[]> {
  const res = await authenticatedFetch(`/api/fmge/mock-tests/${testId}/questions`);
  if (!res.ok) {
    throw new Error(`Failed to load mock questions from backend: ${res.statusText}`);
  }
  const data = await res.json();
  const rawQuestions = data.questions || [];
  return rawQuestions.map((q: any) => ({
    id: q.id,
    part: q.part || "Part A",
    subject: q.subject || "Medical Sciences",
    topic: q.topic || "General",
    stem: q.question_stem || q.stem,
    options: q.options || [],
    correct_option: q.correct_option,
  }));
}

export async function autoSaveMockAnswers(payload: {
  user_id: string;
  test_id: string;
  answers: Record<string, number>;
  time_remaining_seconds: number;
}): Promise<boolean> {
  const res = await authenticatedFetch("/api/fmge/mock-tests/autosave", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export async function submitMockTest(payload: {
  user_id: string;
  test_id: string;
  answers: Record<string, number>;
  time_taken_seconds: number;
}): Promise<MockSubmissionResult> {
  const res = await authenticatedFetch("/api/fmge/mock-tests/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit mock test");
  return res.json();
}

export async function fetchLeaderboard(): Promise<any[]> {
  const res = await authenticatedFetch("/api/fmge/mock-tests/leaderboard");
  if (!res.ok) return [];
  const data = await res.json();
  return data.leaderboard || [];
}
