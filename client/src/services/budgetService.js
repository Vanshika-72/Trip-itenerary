import api from './api';

export const budgetService = {
  async getTripBudget(tripId) {
    const response = await api.get(`/trips/${tripId}/budget`);
    return response.data.budget;
  },
};
