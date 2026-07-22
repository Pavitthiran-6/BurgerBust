import { apiRequest } from './apiClient';

export const restaurantService = {
  getRestaurant: () => apiRequest('/restaurant'),
};
