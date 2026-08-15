/**
 * Task domain types shared by the API and the web client.
 *
 * Values below are read from the Figma design (login, list view, board view,
 * task detail, settings). Anything marked UNCONFIRMED was only partially
 * visible in the walkthrough recording and must be checked against the file
 * before it is relied on.
 */

/**
 * Board columns seen in the design: To Do, Doing, Completed, On Hold.
 * "Backlog" additionally appears as a Status value in the task detail panel,
 * so the status set is wider than the board's visible columns.
 *
 * UNCONFIRMED: whether Backlog has its own board column further right.
 */
export const TASK_STATUSES = ['backlog', 'todo', 'doing', 'on_hold', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  doing: 'Doing',
  on_hold: 'On Hold',
  completed: 'Completed',
};

/**
 * Five values, from the priority dropdown in the task detail panel.
 * `none` renders as "No Priority" and is the default.
 */
export const TASK_PRIORITIES = ['none', 'urgent', 'high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: 'No Priority',
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export interface Label {
  id: string;
  name: string;
  /** Labels seen in the design: Research, Design, Development, Testing, Deployment. */
  color?: string;
}

export interface Subtask {
  id: string;
  title: string;
  priority: TaskPriority;
  memberIds: string[];
  dueAt: string | null;
  completed: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  /** Present when this comment is a reply to another. */
  parentId: string | null;
}

/** Entry in the task detail "Updates" feed, e.g. a priority change. */
export interface ActivityEntry {
  id: string;
  actorId: string;
  type: 'status_changed' | 'priority_changed' | 'comment_posted' | 'created' | 'assigned';
  from: string | null;
  to: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  projectId: string | null;
  memberIds: string[];
  reporterId: string | null;
  labelIds: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string | null;
  projectId?: string | null;
  memberIds?: string[];
  labelIds?: string[];
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** Projects have their own screen and table: name, priority, lead, due date. */
export interface Project {
  id: string;
  name: string;
  priority: TaskPriority;
  leadId: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  priority?: TaskPriority;
  leadId?: string | null;
  dueAt?: string | null;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

/** The list/board toggle in the Tasks header. */
export const TASK_VIEWS = ['list', 'board'] as const;
export type TaskView = (typeof TASK_VIEWS)[number];

/**
 * Columns the "Fields" menu can show or hide in list view.
 * UNCONFIRMED: the recording showed "Members" twice; one is probably Teams.
 */
export const TOGGLEABLE_FIELDS = [
  'priority',
  'members',
  'dueDate',
  'labels',
  'status',
  'reporter',
] as const;
export type ToggleableField = (typeof TOGGLEABLE_FIELDS)[number];
