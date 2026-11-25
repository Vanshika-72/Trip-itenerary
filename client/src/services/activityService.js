import api from './api';

export const activityService = {
  async getTripActivities(tripId, day) {
    const params = day ? { day } : {};
    const response = await api.get(`/trips/${tripId}/activities`, { params });
    return response.data.activities;
  },

  async createActivity(tripId, data) {
    const response = await api.post(`/trips/${tripId}/activities`, data);
    return response.data.activity;
  },

  async updateActivity(activityId, data) {
    const response = await api.put(`/activities/${activityId}`, data);
    return response.data.activity;
  },

  async deleteActivity(activityId) {
    const response = await api.delete(`/activities/${activityId}`);
    return response.data;
  },

  async reorderActivities(tripId, reorderData) {
    const response = await api.patch(`/trips/${tripId}/activities/reorder`, reorderData);
    return response.data.activities;
  },
};
