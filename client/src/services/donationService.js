import api from './api';

// Helper: accept either a plain object payload or a FormData (when a
// payment screenshot is attached). Always sent as multipart for
// consistency on the 3 paid donor flows.
const toFormData = (payloadOrFormData) => {
  if (payloadOrFormData instanceof FormData) return payloadOrFormData;
  const fd = new FormData();
  Object.entries(payloadOrFormData || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
  });
  return fd;
};

const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

// ============================================
// QURBANI DONATION
// ============================================

export async function createQurbaniDonation(donationData) {
  const response = await api.post(
    '/donations/qurbani',
    toFormData(donationData),
    multipartConfig
  );
  return response.data;
}

export async function getQurbaniDonations() {
  const response = await api.get('/donations/qurbani');
  return response.data;
}

// ============================================
// RATION DONATION
// ============================================

export async function createRationDonation(donationData) {
  const response = await api.post(
    '/donations/ration',
    toFormData(donationData),
    multipartConfig
  );
  return response.data;
}

export async function getRationDonations() {
  const response = await api.get('/donations/ration');
  return response.data;
}

// ============================================
// SKIN COLLECTION — no payment, no multipart needed
// ============================================

export async function createSkinCollection(collectionData) {
  const response = await api.post('/donations/skin-collection', collectionData);
  return response.data;
}

export async function getSkinCollections() {
  const response = await api.get('/donations/skin-collection');
  return response.data;
}

// ============================================
// ORPHAN SPONSORSHIP
// ============================================

export async function createOrphanSponsorship(sponsorshipData) {
  const response = await api.post(
    '/donations/orphan-sponsorship',
    toFormData(sponsorshipData),
    multipartConfig
  );
  return response.data;
}

export async function getOrphanSponsorships() {
  const response = await api.get('/donations/orphan-sponsorship');
  return response.data;
}

export default {
  createQurbaniDonation,
  getQurbaniDonations,
  createRationDonation,
  getRationDonations,
  createSkinCollection,
  getSkinCollections,
  createOrphanSponsorship,
  getOrphanSponsorships,
};
