import api from './api';

export const createSkinPickup = (formData) =>
  api
    .post('/qurbani-skin-pickup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const getMySkinPickups = () =>
  api.get('/qurbani-skin-pickup/me').then((r) => r.data);

export const adminListSkinPickups = () =>
  api.get('/admin/qurbani-skin-pickups').then((r) => r.data);

export const adminUpdateSkinPickupStatus = (id, status) =>
  api.patch(`/admin/qurbani-skin-pickups/${id}/status`, { status }).then((r) => r.data);
