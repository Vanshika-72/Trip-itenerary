import api from './api';

export const inviteService = {
  async inviteCollaborator(tripId, { email, role }) {
    const response = await api.post(`/trips/${tripId}/invites`, { email, role });
    return response.data;
  },

  async getInviteInfo(token) {
    const response = await api.get(`/invites/${token}`);
    return response.data.invitation;
  },

  async acceptInvite(token) {
    const response = await api.post(`/invites/${token}/accept`);
    return response.data;
  },

  async removeCollaborator(tripId, userId) {
    const response = await api.delete(`/trips/${tripId}/collaborators/${userId}`);
    return response.data;
  },

  async updateCollaboratorRole(tripId, userId, role) {
    const response = await api.patch(`/trips/${tripId}/collaborators/${userId}`, { role });
    return response.data;
  },
};
