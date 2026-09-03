import { authenticatedFetch } from "@/lib/api";

export interface AnalyticsOverview {
  readiness: {
    overall_readiness_pct: number;
    subject_mastery_pct: number;
    clinical_reasoning_pct: number;
    image_interpretation_pct: number;
    revision_completion_pct: number;
    time_management_pct: number;
    estimated_marks: string;
    pass_cutoff: number;
    pass_status: string;
  };
  pass_prediction: {
    probability_pct: number;
    confidence_interval: string;
    expected_score_range: string;
    target_exam_date: string;
    readiness_status: string;
  };
  productivity: {
    weekly_focus_hours: number;
    task_completion_pct: number;
    learning_velocity_qs_per_hr: number;
    study_streak_days: number;
  };
}

export interface SubjectAnalyticsItem {
  subject: string;
  category: string;
  completion: number;
  accuracy: number;
  speed: string;
  status: string;
}

export interface AnalyticsRecommendation {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  reason: string;
  expectedGain: string;
  estimatedMins: number;
  url: string;
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await authenticatedFetch("/api/fmge/analytics/overview");
  if (!res.ok) throw new Error("Failed to load analytics overview");
  const data = await res.json();
  return data;
}

export async function fetchSubjectMatrix(): Promise<SubjectAnalyticsItem[]> {
  const res = await authenticatedFetch("/api/fmge/analytics/subject-breakdown");
  if (!res.ok) {
    throw new Error("Failed to load subject breakdown");
  }
  const data = await res.json();
  const rawList = data.matrix || [];
  return rawList.map((item: any) => ({
    subject: item.subject,
    category: item.category,
    completion: item.completion_pct || item.completion,
    accuracy: item.accuracy_pct || item.accuracy,
    speed: item.avg_speed_sec ? `${item.avg_speed_sec}s` : item.speed || "45s",
    status: item.status,
  }));
}

export async function fetchAnalyticsRecommendations(): Promise<AnalyticsRecommendation[]> {
  const res = await authenticatedFetch("/api/fmge/analytics/recommendations");
  if (!res.ok) return [];
  const data = await res.json();
  const rawRecs = data.recommendations || [];
  return rawRecs.map((r: any) => ({
    id: r.id,
    priority: r.priority,
    title: r.title,
    reason: r.reason,
    expectedGain: r.expected_gain || r.expectedGain,
    estimatedMins: r.estimated_mins || r.estimatedMins,
    url: r.action_url || r.url,
  }));
}

export async function simulatePassBoost(payload: {
  user_id: string;
  extra_weeks_study?: number;
  extra_mocks_count?: number;
  improve_pharmacology?: boolean;
}): Promise<{ simulated_marks: number; simulated_probability: number }> {
  const res = await authenticatedFetch("/api/fmge/analytics/predict-pass", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Simulation calculation failed");
  }
  const data = await res.json();
  return {
    simulated_marks: data.simulated_score || data.simulated_marks,
    simulated_probability: data.simulated_pass_probability || data.simulated_probability,
  };
}

export interface CountryGapAnalysis {
  country: string;
  curriculum_style: string;
  historical_pass_rate_benchmark: string;
  top_curriculum_gaps: Array<{
    subject: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
    reason: string;
    high_yield_recommendation: string;
  }>;
  strengths: string[];
  suggested_action: string;
}

export async function fetchCountryGapAnalysis(country: string = "Georgia"): Promise<CountryGapAnalysis | null> {
  const res = await authenticatedFetch(`/api/fmge/analytics/country-gap-analysis?country=${encodeURIComponent(country)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.country_gap_analysis || null;
}
