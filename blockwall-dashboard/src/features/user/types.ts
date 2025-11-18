export interface UserProfile {
  screen_name: string;
  name: string;
  followers: number | null;
  following: number | null;
  location: string | null;
  profile_image_url: string | null;
  statuses: number | null;
  url: string | null;
}

export interface UserTweet {
  id: number;
  text: string;
  created_at: string; // ISO
  favorites: number | null;
  hashtags: string[];
}

export interface UserDetailResponse {
  user: UserProfile | null;
  tweets: UserTweet[];
}
