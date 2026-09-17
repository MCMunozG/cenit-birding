export interface FeedPost {
  id: string;
  author_id: string;
  body?: string | null;
  reference_type: string;
  reference_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  body: string;
  read_at?: string | null;
  created_at: string;
}
