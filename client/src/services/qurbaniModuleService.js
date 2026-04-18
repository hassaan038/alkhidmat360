import api from './api';

// ============================================
// USER-FACING
// ============================================

export async function listActiveListings() {
  const response = await api.get('/qurbani-module/listings');
  return response.data;
}

export async function getListing(id) {
  const response = await api.get(`/qurbani-module/listings/${id}`);
  return response.data;
}

// Accepts either a plain object payload (existing callers) or a FormData
// instance (when a payment screenshot is attached). Both routes are
// multipart on the server, so we always send as multipart.
export async function createBooking(payloadOrFormData) {
  let body = payloadOrFormData;
  if (!(payloadOrFormData instanceof FormData)) {
    body = new FormData();
    Object.entries(payloadOrFormData || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) body.append(k, String(v));
    });
  }
  const response = await api.post('/qurbani-module/bookings', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function markBookingPaid(id, screenshotFile = null) {
  const body = new FormData();
  if (screenshotFile) body.append('paymentScreenshot', screenshotFile);
  const response = await api.post(`/qurbani-module/bookings/${id}/mark-paid`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getMyBookings() {
  const response = await api.get('/qurbani-module/bookings/me');
  return response.data;
}

// ============================================
// ADMIN
// ============================================

export async function adminListListings() {
  const response = await api.get('/admin/qurbani-listings');
  return response.data;
}

export async function adminCreateListing(formData) {
  const response = await api.post('/admin/qurbani-listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function adminUpdateListing(id, formData) {
  const response = await api.patch(`/admin/qurbani-listings/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function adminDeleteListing(id) {
  const response = await api.delete(`/admin/qurbani-listings/${id}`);
  return response.data;
}

export async function adminUpdateListingStatus(id, status) {
  const response = await api.patch(`/admin/qurbani-listings/${id}/status`, { status });
  return response.data;
}

export async function adminListBookings() {
  const response = await api.get('/admin/qurbani-bookings');
  return response.data;
}

export async function adminUpdateBookingStatus(id, status) {
  const response = await api.patch(`/admin/qurbani-bookings/${id}/status`, { status });
  return response.data;
}

export default {
  listActiveListings,
  getListing,
  createBooking,
  markBookingPaid,
  getMyBookings,
  adminListListings,
  adminCreateListing,
  adminUpdateListing,
  adminDeleteListing,
  adminUpdateListingStatus,
  adminListBookings,
  adminUpdateBookingStatus,
};
