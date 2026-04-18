import api from './api';

const toFormData = (payloadOrFormData) => {
  if (payloadOrFormData instanceof FormData) return payloadOrFormData;
  const fd = new FormData();
  Object.entries(payloadOrFormData || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
  });
  return fd;
};

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

// ============================================
// SADQA
// ============================================

export const createSadqa = (payload) =>
  api.post('/sadqa', toFormData(payload), multipart).then((r) => r.data);

export const getMySadqas = () => api.get('/sadqa/me').then((r) => r.data);

export const adminListSadqas = () => api.get('/admin/sadqa').then((r) => r.data);

export const adminUpdateSadqaStatus = (id, status) =>
  api.patch(`/admin/sadqa/${id}/status`, { status }).then((r) => r.data);

// ============================================
// DISASTER DONATION
// ============================================

export const createDisasterDonation = (payload) =>
  api.post('/disaster-donations', toFormData(payload), multipart).then((r) => r.data);

export const getMyDisasterDonations = () =>
  api.get('/disaster-donations/me').then((r) => r.data);

export const adminListDisasterDonations = () =>
  api.get('/admin/disaster-donations').then((r) => r.data);

export const adminUpdateDisasterDonationStatus = (id, status) =>
  api.patch(`/admin/disaster-donations/${id}/status`, { status }).then((r) => r.data);
