import api from './api';

const toFormData = (payloadOrFormData) => {
  if (payloadOrFormData instanceof FormData) return payloadOrFormData;
  const fd = new FormData();
  Object.entries(payloadOrFormData || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  return fd;
};

// ============================================
// DONOR — payments
// ============================================

export const createZakatPayment = (payload) =>
  api
    .post('/zakat/payments', toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const getMyZakatPayments = () =>
  api.get('/zakat/payments/me').then((r) => r.data);

// ============================================
// BENEFICIARY — applications
// ============================================

export const createZakatApplication = (payload) =>
  api
    .post('/zakat/applications', toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const getMyZakatApplications = () =>
  api.get('/zakat/applications/me').then((r) => r.data);

// ============================================
// ADMIN
// ============================================

export const adminListZakatPayments = () =>
  api.get('/admin/zakat/payments').then((r) => r.data);

export const adminUpdateZakatPaymentStatus = (id, status) =>
  api.patch(`/admin/zakat/payments/${id}/status`, { status }).then((r) => r.data);

export const adminListZakatApplications = () =>
  api.get('/admin/zakat/applications').then((r) => r.data);

export const adminUpdateZakatApplicationStatus = (id, status) =>
  api
    .patch(`/admin/zakat/applications/${id}/status`, { status })
    .then((r) => r.data);
