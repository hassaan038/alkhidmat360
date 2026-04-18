import api from './api';

// Accepts either a plain object payload OR a FormData (when a payment
// screenshot is attached). Always sent as multipart for consistency.
export const createFitrana = (payloadOrFormData) => {
  let body = payloadOrFormData;
  if (!(payloadOrFormData instanceof FormData)) {
    body = new FormData();
    Object.entries(payloadOrFormData || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) body.append(k, String(v));
    });
  }
  return api
    .post('/fitrana', body, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
};

export const getMyFitranas = () =>
  api.get('/fitrana/me').then((r) => r.data);

export const adminListFitranas = () =>
  api.get('/admin/fitrana').then((r) => r.data);

export const adminUpdateFitranaStatus = (id, status) =>
  api.patch(`/admin/fitrana/${id}/status`, { status }).then((r) => r.data);
