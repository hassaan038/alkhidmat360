import api from './api';

export const createFitrana = (payload) =>
  api.post('/fitrana', payload).then((r) => r.data);

export const getMyFitranas = () =>
  api.get('/fitrana/me').then((r) => r.data);

export const adminListFitranas = () =>
  api.get('/admin/fitrana').then((r) => r.data);

export const adminUpdateFitranaStatus = (id, status) =>
  api.patch(`/admin/fitrana/${id}/status`, { status }).then((r) => r.data);
