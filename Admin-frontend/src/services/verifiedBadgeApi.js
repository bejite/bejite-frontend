import axiosInstance from '../utils/axiosInstance';

const API = '/api/verified-badge';

export const getBadgePlans = async () => {
  const response = await axiosInstance.get(`${API}/plans`);
  return response.data;
};

export const getBadgeStatus = async () => {
  const response = await axiosInstance.get(`${API}/status`);
  return response.data;
};

export const getPublicBadgeStatus = async (userId) => {
  const response = await axiosInstance.get(`${API}/status/${userId}`);
  return response.data;
};

export const initializeBadgeSubscription = async (currency = 'USD') => {
  const response = await axiosInstance.post(`${API}/subscribe/init`, { currency });
  return response.data;
};

export const verifyBadgeSubscription = async (reference) => {
  const response = await axiosInstance.post(`${API}/subscribe/verify`, { reference });
  return response.data;
};

export const getPartnerEvents = async () => {
  const response = await axiosInstance.get(`${API}/events`);
  return response.data;
};

export const registerForPartnerEvent = async (eventId) => {
  const response = await axiosInstance.post(`${API}/events/${eventId}/register`);
  return response.data;
};

export const getMonthlyReports = async () => {
  const response = await axiosInstance.get(`${API}/reports`);
  return response.data;
};

export const openMonthlyReport = async (reportId) => {
  const response = await axiosInstance.get(`${API}/reports/${reportId}`);
  return response.data;
};
