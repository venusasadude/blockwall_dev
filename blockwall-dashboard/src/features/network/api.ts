import { apiGet } from '../../core/api/httpClient';
import { NetworkRequestParams, NetworkResponse } from './types';

/**
 * Fetches a network slice around a user or hashtag.
 * Mirrors backend /api/network endpoint.
 */
export async function fetchNetwork(params: NetworkRequestParams): Promise<NetworkResponse> {
  console.log('Fetching network with params:', params);
  const searchParams = new URLSearchParams();

  if (params.user) searchParams.set('user', params.user);
  if (params.hashtag) searchParams.set('hashtag', params.hashtag);
  if (typeof params.minFollowers === 'number') {
    searchParams.set('minFollowers', String(params.minFollowers));
  }
  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }
  if (typeof params.minHashtagUsage === 'number') {
    searchParams.set('minHashtagUsage', String(params.minHashtagUsage));
  }

  const query = searchParams.toString();
  const path = `/network${query ? `?${query}` : ''}`;

  return apiGet<NetworkResponse>(path);
}
