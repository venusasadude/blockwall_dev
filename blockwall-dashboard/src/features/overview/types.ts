export interface Totals {
  users: number;
  tweets: number;
  hashtags: number;
}

export interface TopUserByTweets {
  screen_name: string;
  name: string;
  tweetCount: number;
  followers: number | null;
}

export interface TopHashtag {
  name: string;
  usageCount: number;
}

export interface OverviewResponse {
  totals: Totals;
  topUsersByTweets: TopUserByTweets[];
  topHashtags: TopHashtag[];
}
