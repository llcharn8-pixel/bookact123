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

export type Source = "human" | "ai";

export type KeyPoint = {
  id: string;
  user_id: string | null;
  entry_id: string;
  content: string;
  source: Source;
  ai_confidence: number | null;
  created_at: string;
};

export type ActionStep = {
  id: string;
  user_id: string | null;
  key_point_id: string;
  action: string;
  achievable_result: string | null;
  status: ActionStatus;
  source: Source;
  ai_confidence: number | null;
  created_at: string;
};

export type DraftActionStep = {
  action: string;
  achievable_result: string | null;
  confidence: number;
};

export type DraftKeyPoint = {
  content: string;
  confidence: number;
  action_steps: DraftActionStep[];
};

export type DraftEntry = {
  title: string;
  author: string | null;
  type: EntryType;
  summary: string;
  grounded: boolean;
  key_points: DraftKeyPoint[];
};

export type KeyPointWithActions = KeyPoint & { action_steps: ActionStep[] };
export type EntryWithDetails = Entry & { key_points: KeyPointWithActions[] };

export type ActionStepWithContext = ActionStep & {
  key_point_content: string;
  entry_id: string;
  entry_title: string;
};
