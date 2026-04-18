import api from './api';

// ============================================
// QURBANI DONATION
// ============================================

export async function createQurbaniDonation(donationData) {
  const response = await api.post('/donations/qurbani', donationData);
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
  const response = await api.post('/donations/ration', donationData);
  return response.data;
}

export async function getRationDonations() {
  const response = await api.get('/donations/ration');
  return response.data;
}

// ============================================
// SKIN COLLECTION
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
  const response = await api.post('/donations/orphan-sponsorship', sponsorshipData);
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
