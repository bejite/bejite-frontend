import axiosInstance from "../utils/axiosInstance";

const API = "/api/admin/partner-events";

export const listPartnerEvents = async (params = {}) => {
  const response = await axiosInstance.get(API, { params });
  return response.data;
};

export const getPartnerEvent = async (id) => {
  const response = await axiosInstance.get(`${API}/${id}`);
  return response.data;
};

export const createPartnerEvent = async (payload) => {
  const response = await axiosInstance.post(API, payload);
  return response.data;
};

export const updatePartnerEvent = async (id, payload) => {
  const response = await axiosInstance.put(`${API}/${id}`, payload);
  return response.data;
};

export const deletePartnerEvent = async (id, { hard = true } = {}) => {
  const response = await axiosInstance.delete(`${API}/${id}`, {
    params: { hard },
  });
  return response.data;
};

export const notifyPartnerEvent = async (id, payload = {}) => {
  const response = await axiosInstance.post(`${API}/${id}/notify`, payload);
  return response.data;
};
