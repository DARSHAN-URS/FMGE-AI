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

  const data = await res.json();
  return {
    success: data.success ?? true,
    reply: data.response_markdown || data.reply || "",
    citations: data.citations || [],
    follow_ups: data.follow_up_suggestions || data.follow_ups || [],
    teaching_mode: data.mode,
  };
}

export async function generateTutorFlashcards(payload: {
  user_id: string;
  topic: string;
  count?: number;
}): Promise<Flashcard[]> {
  const res = await authenticatedFetch("/api/fmge/ai-tutor/generate-flashcards", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.flashcards || []).map((c: any, idx: number) => ({
    id: `fc-${idx}`,
    front: c.q || c.front,
    back: c.a || c.back,
    high_yield: true,
    subject: payload.topic,
  }));
}

export async function generateTutorQuiz(payload: {
  user_id: string;
  topic: string;
  count?: number;
}): Promise<any[]> {
  const res = await authenticatedFetch("/api/fmge/ai-tutor/generate-quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.questions || [];
}
