import { apiRequest, toQueryString } from './apiClient';

export const rewardService = {
  getRewards: () => apiRequest('/rewards'),
  getHistory: (page = 0, size = 50) => apiRequest(`/rewards/history${toQueryString({ page, size })}`),
};

