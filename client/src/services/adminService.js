import api from './api';

// ============================================
// DASHBOARD STATISTICS
// ============================================

export async function getDashboardStats() {
  const response = await api.get('/admin/stats');
  return response.data;
}

// ============================================
// DONATION MANAGEMENT
// ============================================

export async function getQurbaniDonations() {
  const response = await api.get('/admin/donations/qurbani');
  return response.data;
}

export async function getRationDonations() {
  const response = await api.get('/admin/donations/ration');
  return response.data;
}

export async function getSkinCollections() {
  const response = await api.get('/admin/donations/skin-collection');
  return response.data;
}

export async function getOrphanSponsorships() {
  const response = await api.get('/admin/donations/orphan-sponsorship');
  return response.data;
}

export async function updateQurbaniDonationStatus(id, status) {
  const response = await api.patch(`/admin/donations/qurbani/${id}/status`, { status });
  return response.data;
}

export async function updateRationDonationStatus(id, status) {
  const response = await api.patch(`/admin/donations/ration/${id}/status`, { status });
  return response.data;
}

export async function updateSkinCollectionStatus(id, status) {
  const response = await api.patch(`/admin/donations/skin-collection/${id}/status`, { status });
  return response.data;
}

export async function updateOrphanSponsorshipStatus(id, status) {
  const response = await api.patch(`/admin/donations/orphan-sponsorship/${id}/status`, { status });
  return response.data;
}

// ============================================
// APPLICATION MANAGEMENT
// ============================================

export async function getLoanApplications() {
  const response = await api.get('/admin/applications/loan');
  return response.data;
}

export async function getRamadanRationApplications() {
  const response = await api.get('/admin/applications/ramadan-ration');
  return response.data;
}

export async function getOrphanRegistrations() {
  const response = await api.get('/admin/applications/orphan');
  return response.data;
}

export async function updateLoanApplicationStatus(id, status) {
  const response = await api.patch(`/admin/applications/loan/${id}/status`, { status });
  return response.data;
}

export async function updateRamadanRationApplicationStatus(id, status) {
  const response = await api.patch(`/admin/applications/ramadan-ration/${id}/status`, { status });
  return response.data;
}

export async function updateOrphanRegistrationStatus(id, status) {
  const response = await api.patch(`/admin/applications/orphan/${id}/status`, { status });
  return response.data;
}

// ============================================
// VOLUNTEER MANAGEMENT
// ============================================

export async function getVolunteerTasks() {
  const response = await api.get('/admin/volunteers/tasks');
  return response.data;
}

export async function getVolunteers() {
  const response = await api.get('/admin/volunteers');
  return response.data;
}

export async function updateVolunteerTaskStatus(id, status) {
  const response = await api.patch(`/admin/volunteers/tasks/${id}/status`, { status });
  return response.data;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getUsers() {
  const response = await api.get('/admin/users');
  return response.data;
}
