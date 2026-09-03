import { authenticatedFetch } from "@/lib/api";

export interface StudentProfile {
  name: string;
  medical_college: string;
  country: string;
  target_exam: string;
  days_until_exam: number;
  study_streak_days: number;
  daily_motivation: string;
  subscription_plan: string;
}

export interface ReadinessScore {
  overall_pct: number;
  subject_mastery_pct: number;
  clinical_reasoning_pct: number;
  time_management_pct: number;
  estimated_marks: string;
  cutoff_met: boolean;
  trend: string;
}

export interface DailyTarget {
  id: string;
  title: string;
  subtitle: string;
  estimated_mins: number;
  completed: boolean;
}

export interface OverallProgress {
  questions_solved: number;
  total_qbank: number;
  mock_tests_completed: number;
  total_mocks?: number;
  subjects_completed: number;
  total_subjects?: number;
  course_completion_pct: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  meta: string;
  time: string;
  type: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  reason: string;
  action_url: string;
}

export interface OverviewData {
  success: boolean;
  student: StudentProfile;
  readiness_score: ReadinessScore;
  daily_targets: DailyTarget[];
  overall_progress: OverallProgress;
  recent_activities: RecentActivity[];
  ai_recommendations: AIRecommendation[];
}

export async function fetchDashboardOverview(): Promise<OverviewData> {
  const res = await authenticatedFetch("/api/fmge/dashboard/overview");
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard overview: ${res.statusText}`);
  }
  return res.json();
}

export async function toggleTaskComplete(taskId: string, completed: boolean): Promise<boolean> {
  const res = await authenticatedFetch("/api/fmge/dashboard/toggle-task", {
    method: "POST",
    body: JSON.stringify({ task_id: taskId, completed }),
  });
  return res.ok;
}

export async function fetchClinicalCases(): Promise<any[]> {
  const res = await authenticatedFetch("/api/fmge/dashboard/clinical-cases");
  if (!res.ok) return [];
  const data = await res.json();
  return data.cases || [];
}

export async function fetchStudentNotes(): Promise<any[]> {
  const res = await authenticatedFetch("/api/fmge/dashboard/notes");
  if (!res.ok) return [];
  const data = await res.json();
  return data.notes || [];
}

export async function fetchBookmarks(): Promise<any[]> {
  const res = await authenticatedFetch("/api/fmge/dashboard/bookmarks");
  if (!res.ok) return [];
  const data = await res.json();
  return data.bookmarks || [];
}
