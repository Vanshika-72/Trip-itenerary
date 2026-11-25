import api from './api';

export const packingService = {
  async getTripPacking(tripId) {
    const response = await api.get(`/trips/${tripId}/packing`);
    return response.data;
  },

  async addPackingItem(tripId, itemData) {
    const response = await api.post(`/trips/${tripId}/packing`, itemData);
    return response.data.item;
  },

  async updatePackingItem(tripId, itemId, updates) {
    const response = await api.patch(`/trips/${tripId}/packing/${itemId}`, updates);
    return response.data.item;
  },

  async deletePackingItem(tripId, itemId) {
    const response = await api.delete(`/trips/${tripId}/packing/${itemId}`);
    return response.data;
  },
};
