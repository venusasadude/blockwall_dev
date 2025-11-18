import { apiGet } from '../../core/api/httpClient';
import { OverviewResponse } from './types';

export async function fetchOverview(): Promise<OverviewResponse> {
  return apiGet<OverviewResponse>('/overview');
}
