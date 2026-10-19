import axiosInstance from "../utils/axiosInstance";

const API = "/api/admin/email-outreach";

export const listOutreachCampaigns = async (params = {}) => {
  const response = await axiosInstance.get(`${API}/campaigns`, { params });
  return response.data;
};

export const getOutreachCampaign = async (id) => {
  const response = await axiosInstance.get(`${API}/campaigns/${id}`);
  return response.data;
};

export const getOutreachAudienceCount = async (filters) => {
  const response = await axiosInstance.post(`${API}/campaigns/audience-count`, filters);
  return response.data;
};

export const launchOutreachCampaign = async (payload) => {
  const response = await axiosInstance.post(`${API}/campaigns/launch`, payload);
  return response.data;
};

export const deleteOutreachCampaign = async (id) => {
  const response = await axiosInstance.delete(`${API}/campaigns/${id}`);
  return response.data;
};

export const sendOutreachTestEmail = async (payload) => {
  const response = await axiosInstance.post(`${API}/campaigns/test`, payload);
  return response.data;
};

export const listOutreachTemplates = async () => {
  const response = await axiosInstance.get(`${API}/templates`);
  return response.data;
};

export const createOutreachTemplate = async (payload) => {
  const response = await axiosInstance.post(`${API}/templates`, payload);
  return response.data;
};

export const updateOutreachTemplate = async (id, payload) => {
  const response = await axiosInstance.put(`${API}/templates/${id}`, payload);
  return response.data;
};

export const deleteOutreachTemplate = async (id) => {
  const response = await axiosInstance.delete(`${API}/templates/${id}`);
  return response.data;
};
