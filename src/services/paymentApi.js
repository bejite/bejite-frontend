import axiosInstance from '../utils/axiosInstance';
import { getUser } from '../utils/tokenManager';

const PAYSTACK_API_URL = '/api/paystack';

export const getSubscriptionPlans = async () => {
  try {
    const response = await axiosInstance.get(`${PAYSTACK_API_URL}/plans`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

export const checkASEEligibility = async () => {
  try {
    const employerId = getUser()?.id;
    const response = await axiosInstance.get(`${PAYSTACK_API_URL}/ase/eligibility`, {
      params: employerId ? { employer_id: employerId } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Error checking ASE eligibility:', error);
    throw error;
  }
};

export const activateFreeTrial = async () => {
  try {
    const response = await axiosInstance.post(`${PAYSTACK_API_URL}/ase/free-trial`);
    return response.data;
  } catch (error) {
    console.error('Error initializing free monthly ASE quota:', error);
    throw error;
  }
};

export const initializeOneTimePayment = async (data) => {
  try {
    const response = await axiosInstance.post(`${PAYSTACK_API_URL}/one-time/init`, data);
    return response.data;
  } catch (error) {
    console.error('Error initializing one-time payment:', error);
    throw error;
  }
};

export const verifyOneTimePayment = async (reference) => {
  try {
    const response = await axiosInstance.get(`${PAYSTACK_API_URL}/one-time/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying one-time payment:', error);
    throw error;
  }
};

export const initializeSubscriptionPayment = async (data) => {
  try {
    const response = await axiosInstance.post(`${PAYSTACK_API_URL}/subscription/init`, data);
    return response.data;
  } catch (error) {
    console.error('Error initializing subscription payment:', error);
    throw error;
  }
};

export const verifySubscriptionPayment = async (reference) => {
  try {
    const response = await axiosInstance.post(`${PAYSTACK_API_URL}/subscription/verify`, { reference });
    return response.data;
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    throw error;
  }
};

export const getTopUpProducts = async () => {
  try {
    const response = await axiosInstance.get(`${PAYSTACK_API_URL}/topups`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top-up products:', error);
    throw error;
  }
};

export const initializeTopUpPayment = async (data) => {
  try {
    const response = await axiosInstance.post(`${PAYSTACK_API_URL}/topup/init`, data);
    return response.data;
  } catch (error) {
    console.error('Error initializing top-up payment:', error);
    throw error;
  }
};

export const verifyTopUpPayment = async (reference) => {
  try {
    const response = await axiosInstance.post(`${PAYSTACK_API_URL}/topup/verify`, { reference });
    return response.data;
  } catch (error) {
    console.error('Error verifying top-up payment:', error);
    throw error;
  }
};

export const getSavedCards = async () => {
  try {
    const response = await axiosInstance.get(`${PAYSTACK_API_URL}/cards`);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved cards:', error);
    throw error;
  }
};

export const deleteSavedCard = async (cardId) => {
  try {
    const response = await axiosInstance.delete(`${PAYSTACK_API_URL}/cards/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting saved card:', error);
    throw error;
  }
};

export const chargeSavedCard = async (data) => {
  try {
    const response = await axiosInstance.post(`${PAYSTACK_API_URL}/charge-saved-card`, data);
    return response.data;
  } catch (error) {
    console.error('Error charging saved card:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const response = await axiosInstance.get(`${PAYSTACK_API_URL}/ase/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw error;
  }
};

export const getPaymentTransactions = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await axiosInstance.get(`${PAYSTACK_API_URL}/ase/transactions`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    throw error;
  }
};

export const recordASESearch = async (payload = {}) => {
  try {
    const response = await axiosInstance.post(
      `${PAYSTACK_API_URL}/ase/record-search`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error recording ASE search:', error);
    throw error;
  }
};

export const completeASESearch = async (payload = {}) => {
  try {
    const response = await axiosInstance.post(
      `${PAYSTACK_API_URL}/ase/complete-search`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error completing ASE search:', error);
    throw error;
  }
};

export default {
  getSubscriptionPlans,
  checkASEEligibility,
  activateFreeTrial,
  initializeOneTimePayment,
  verifyOneTimePayment,
  initializeSubscriptionPayment,
  verifySubscriptionPayment,
  getTopUpProducts,
  initializeTopUpPayment,
  verifyTopUpPayment,
  getSavedCards,
  deleteSavedCard,
  chargeSavedCard,
  getSubscriptionStatus,
  getPaymentTransactions,
  recordASESearch,
  completeASESearch,
};
