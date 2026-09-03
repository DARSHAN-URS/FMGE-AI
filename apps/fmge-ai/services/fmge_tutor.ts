import { authenticatedFetch } from "@/lib/api";

export interface Citation {
  source: string;
  chapter: string;
}

export interface TutorResponse {
  success: boolean;
  reply: string;
  citations: Citation[];
  follow_ups: string[];
  teaching_mode?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  high_yield: boolean;
  subject: string;
}

export async function sendTutorMessage(payload: {
  user_id: string;
  message: string;
  mode?: string;
  subject?: string;
  conversation_id?: string;
}): Promise<TutorResponse> {
  const res = await authenticatedFetch("/api/fmge/ai-tutor/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to receive response from AI Medical Tutor");
  }

  return res.json();
}

export async function generateTutorFlashcards(payload: {
  user_id: string;
  topic: string;
  count?: number;
}): Promise<Flashcard[]> {
  const res = await authenticatedFetch("/api/fmge/ai-tutor/flashcards", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.flashcards || [];
}

export async function generateTutorQuiz(payload: {
  user_id: string;
  topic: string;
  count?: number;
}): Promise<any[]> {
  const res = await authenticatedFetch("/api/fmge/ai-tutor/quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.questions || [];
}
