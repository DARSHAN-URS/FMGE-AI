import { authenticatedFetch } from "@/lib/api";

export interface SubjectTaxonomy {
  id: string;
  name: string;
  category: string;
  total_qs: number;
  high_yield_topics: string[];
  completion?: number;
}

export interface QuestionOption {
  id: number;
  label?: string;
  text: string;
}

export interface Question {
  id: number;
  subject: string;
  topic: string;
  difficulty: string;
  estimated_time_seconds: number;
  marks: number;
  is_ibq?: boolean;
  image_url?: string;
  question_stem: string;
  options: QuestionOption[];
  correct_option: number;
  explanation: {
    correct_rationale: string;
    distractor_analysis: Record<string, string>;
    high_yield_pearl: string;
    textbook_reference: string;
  };
}

export interface AttemptResult {
  is_correct: boolean;
  correct_option: number;
  selected_option: number;
  explanation: any;
  user_accuracy_percentage?: number;
}

export async function fetchSubjectTaxonomy(): Promise<SubjectTaxonomy[]> {
  const res = await authenticatedFetch("/api/fmge/questions/taxonomy");
  if (!res.ok) throw new Error("Failed to load subject taxonomy");
  const data = await res.json();
  return data.taxonomy || [];
}

export async function fetchQuestionList(
  subject: string = "general-medicine",
  difficulty: string = "ai-adaptive",
  questionType: string = "all"
): Promise<Question[]> {
  const params = new URLSearchParams({
    subject,
    difficulty,
    question_type: questionType,
  });
  const res = await authenticatedFetch(`/api/fmge/questions/list?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  const data = await res.json();
  return data.questions || [];
}

export async function submitQuestionAttempt(payload: {
  user_id: string;
  question_id: number;
  selected_option: number;
  time_taken_seconds: number;
  confidence_level?: string;
}): Promise<AttemptResult> {
  const res = await authenticatedFetch("/api/fmge/questions/attempt", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit question attempt");
  return res.json();
}

export async function toggleQuestionBookmark(userId: string, questionId: number): Promise<{ is_bookmarked: boolean }> {
  const res = await authenticatedFetch("/api/fmge/questions/bookmark", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, question_id: questionId }),
  });
  if (!res.ok) throw new Error("Failed to bookmark question");
  return res.json();
}
