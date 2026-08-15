/**
 * Task domain types shared by the API and the web client.
 *
 * These values are the single source of truth for the task contract. The API
 * validates against them and the UI renders against them, so the two cannot
 * drift apart without a TypeScript error.
 *
 * NOTE: the exact statuses and priorities must be reconciled with the Figma
 * design once it is available. Adjust here first, then let the compiler point
 * at every place that needs updating.
 */

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO 8601 string, or null when the task has no due date. */
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  page?: number;
  limit?: number;
}
