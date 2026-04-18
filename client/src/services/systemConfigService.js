import api from './api';

export async function getQurbaniModuleFlag() {
  const response = await api.get('/config/qurbani-module');
  return response.data;
}

export async function updateQurbaniModuleFlag(enabled) {
  const response = await api.patch('/config/qurbani-module', { enabled });
  return response.data;
}

export async function getBankDetails() {
  const response = await api.get('/config/bank-details');
  return response.data;
}

export async function updateBankDetails(bankDetails) {
  const response = await api.patch('/config/bank-details', { bankDetails });
  return response.data;
}

export default {
  getQurbaniModuleFlag,
  updateQurbaniModuleFlag,
  getBankDetails,
  updateBankDetails,
};
