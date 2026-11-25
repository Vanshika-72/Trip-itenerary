import api from './api';

export const tripService = {
  async getTrips(type) {
    const params = type ? { type } : {};
    const response = await api.get('/trips', { params });
    return response.data.trips;
  },

  async getTripById(id) {
    const response = await api.get(`/trips/${id}`);
    return response.data.trip;
  },

  async createTrip(data) {
    // Check if data is FormData or plain JSON
    const isFormData = data instanceof FormData;
    const response = await api.post('/trips', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data.trip;
  },

  async updateTrip(id, data) {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/trips/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data.trip;
  },

  async deleteTrip(id) {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  async togglePublicShare(id, isPublic) {
    const response = await api.patch(`/trips/${id}/share`, { isPublic });
    return response.data;
  },

  async getPublicTrip(shareToken) {
    const response = await api.get(`/public/trips/${shareToken}`);
    return response.data.trip;
  },

  async downloadItineraryPdf(id, title = 'Itinerary') {
    const response = await api.get(`/trips/${id}/itinerary.pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Itinerary.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
