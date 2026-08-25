export type EntryType = "book" | "article";
export type ActionStatus = "todo" | "doing" | "done";

export type Entry = {
  id: string;
  user_id: string | null;
  title: string;
  type: EntryType;
  author: string | null;
  summary: string | null;
  created_at: string;
};

export type KeyPoint = {
  id: string;
  user_id: string | null;
  entry_id: string;
  content: string;
  created_at: string;
};

export type ActionStep = {
  id: string;
  user_id: string | null;
  key_point_id: string;
  action: string;
  achievable_result: string | null;
  status: ActionStatus;
  created_at: string;
};

export type KeyPointWithActions = KeyPoint & { action_steps: ActionStep[] };
export type EntryWithDetails = Entry & { key_points: KeyPointWithActions[] };

export type ActionStepWithContext = ActionStep & {
  key_point_content: string;
  entry_id: string;
  entry_title: string;
};
