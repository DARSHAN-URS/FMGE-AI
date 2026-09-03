import { authenticatedFetch } from "@/lib/api";

export interface ActivePlan {
  plan_id: string;
  name: string;
  mode: string;
  target_exam_date: string;
  days_remaining: number;
  completion_pct: number;
  daily_hours_target: number;
  study_streak_days: number;
}

export interface PlannerTask {
  id: string;
  subject: string;
  title: string;
  type: string;
  estimated_mins: number;
  due_time: string;
  completed: boolean;
  priority: string;
}

export interface PlannerOverview {
  success: boolean;
  active_plan: ActivePlan;
  ai_mentor_coaching: {
    title: string;
    message: string;
    action_label: string;
    action_url: string;
  };
  daily_tasks: PlannerTask[];
  spaced_repetition_queue: Array<{
    id: string;
    topic: string;
    cycle: string;
    items_count: number;
    due: string;
  }>;
}

export async function fetchPlannerOverview(): Promise<PlannerOverview> {
  const res = await authenticatedFetch("/api/fmge/study-planner/overview");
  if (!res.ok) throw new Error("Failed to load planner overview");
  return res.json();
}

export async function togglePlannerTask(userId: string, taskId: string, completed: boolean): Promise<boolean> {
  const res = await authenticatedFetch("/api/fmge/study-planner/complete-task", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, task_id: taskId, completed }),
  });
  return res.ok;
}
