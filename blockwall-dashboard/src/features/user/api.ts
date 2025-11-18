import { apiGet } from '../../core/api/httpClient';
import { UserDetailResponse } from './types';

/**
 * Fetch detailed information for a given user:
 * - Profile
 * - Recent tweets (+ hashtags)
 */
export async function fetchUserDetail(
  screenName: string,
  options?: { limit?: number },
): Promise<UserDetailResponse> {
  const params = new URLSearchParams();

  if (options?.limit) {
    params.set('limit', String(options.limit));
  }

  const query = params.toString();
  const path = `/user/${encodeURIComponent(screenName)}${query ? `?${query}` : ''}`;

  return apiGet<UserDetailResponse>(path);
}
