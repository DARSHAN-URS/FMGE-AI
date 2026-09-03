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
  const res = await authenticatedFetch(`/api/fmge/mock-tests/questions?test_id=${testId}`);
  if (!res.ok) {
    // Fallback standard NBE question list
    return [
      {
        id: 101,
        part: "Part A",
        subject: "General Medicine",
        topic: "Cardiology",
        stem: "A 45-year-old male presents with sudden onset retrosternal crushing pain radiating to left jaw. ECG shows ST elevation in II, III, aVF. What coronary artery is acutely occluded?",
        options: [
          { id: 0, text: "Left Anterior Descending Artery (LAD)" },
          { id: 1, text: "Right Coronary Artery (RCA)" },
          { id: 2, text: "Left Circumflex Artery (LCx)" },
          { id: 3, text: "Left Main Coronary Artery (LMCA)" }
        ]
      },
      {
        id: 102,
        part: "Part A",
        subject: "Pharmacology",
        topic: "Antimicrobials",
        stem: "Which of the following anti-hypertensive drugs is contraindicated in pregnant women due to risk of fetal renal dysgenesis?",
        options: [
          { id: 0, text: "Labetalol" },
          { id: 1, text: "Methyldopa" },
          { id: 2, text: "Enalapril (ACE Inhibitor)" },
          { id: 3, text: "Nifedipine" }
        ]
      },
      {
        id: 103,
        part: "Part B",
        subject: "Obstetrics & Gynecology",
        topic: "Pre-eclampsia",
        stem: "A 28-year-old primigravida at 34 weeks presents with BP 165/110 mmHg, 3+ proteinuria, and severe headache. What is the drug of choice for seizure prophylaxis?",
        options: [
          { id: 0, text: "Phenytoin" },
          { id: 1, text: "Magnesium Sulfate (MgSO4)" },
          { id: 2, text: "Diazepam" },
          { id: 3, text: "Sodium Nitroprusside" }
        ]
      }
    ];
  }
  const data = await res.json();
  return data.questions || [];
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
