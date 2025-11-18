import { Neo4jNumeric } from '../../shared/neo4j.types';

export interface UserSearchResult {
  screen_name: string;
  name: string;
  followers: number | null;
  following: number | null;
  location: string | null;
  profile_image_url: string | null;
  url: string | null;
}

export interface HashtagSearchResult {
  name: string;
  usageCount: number | null;
}

export interface SearchResponse {
  users: UserSearchResult[];
  hashtags: HashtagSearchResult[];
}
