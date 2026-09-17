export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: SessionUser;
}

export interface UserProfile extends SessionUser {
  bio?: string | null;
  general_location?: string | null;
  privacy_settings?: {
    show_general_location?: boolean;
    share_activity?: boolean;
  } | null;
  preferences?: { weekly_digest?: boolean } | null;
}
