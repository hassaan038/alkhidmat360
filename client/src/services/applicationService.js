import api from './api';

// ============================================
// LOAN APPLICATION
// ============================================

export async function createLoanApplication(applicationData) {
  const response = await api.post('/applications/loan', applicationData);
  return response.data;
}

export async function getLoanApplications() {
  const response = await api.get('/applications/loan');
  return response.data;
}

// ============================================
// RAMADAN RATION APPLICATION
// ============================================

export async function createRamadanRationApplication(applicationData) {
  const response = await api.post('/applications/ramadan-ration', applicationData);
  return response.data;
}

export async function getRamadanRationApplications() {
  const response = await api.get('/applications/ramadan-ration');
  return response.data;
}

// ============================================
// ORPHAN REGISTRATION
// ============================================

export async function createOrphanRegistration(registrationData) {
  const response = await api.post('/applications/orphan', registrationData);
  return response.data;
}

export async function getOrphanRegistrations() {
  const response = await api.get('/applications/orphan');
  return response.data;
}

export default {
  createLoanApplication,
  getLoanApplications,
  createRamadanRationApplication,
  getRamadanRationApplications,
  createOrphanRegistration,
  getOrphanRegistrations,
};
