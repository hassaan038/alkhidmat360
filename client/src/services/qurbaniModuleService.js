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

export async function createBooking(payload) {
  const response = await api.post('/qurbani-module/bookings', payload);
  return response.data;
}

export async function markBookingPaid(id) {
  const response = await api.post(`/qurbani-module/bookings/${id}/mark-paid`);
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
