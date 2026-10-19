/**
 * Pitches API — 24h Pitch Hub
 */

import axiosInstance from "../utils/axiosInstance";
import { getUploadSizeError, apiErrorMessage } from "../utils/uploadLimits";

const PITCHES_API_URL = "/api/pitches";

export const uploadPitchMedia = async (file) => {
  const sizeError = getUploadSizeError(file);
  if (sizeError) {
    const err = new Error(sizeError);
    err.response = { data: { error: sizeError, message: sizeError } };
    throw err;
  }

  const formData = new FormData();
  formData.append("media", file);

  const response = await axiosInstance.post(
    `${PITCHES_API_URL}/upload-media`,
    formData
  );
  const data = response.data || {};
  const first = Array.isArray(data.media) ? data.media[0] : null;
  return {
    url: data.url || first?.url,
    kind: data.kind || first?.kind || "video",
    thumbnailUrl: data.thumbnailUrl ?? first?.thumbnailUrl ?? null,
  };
};

export const getPitchFeed = async (limit = 20, options = {}) => {
  const params = { limit };
  if (options.category) params.category = options.category;
  if (options.cursor) params.cursor = options.cursor;
  const response = await axiosInstance.get(`${PITCHES_API_URL}/feed`, { params });
  return {
    pitches: Array.isArray(response.data?.pitches) ? response.data.pitches : [],
    nextCursor: response.data?.nextCursor || null,
  };
};

export const getMyPitches = async (status = "all") => {
  const response = await axiosInstance.get(`${PITCHES_API_URL}/mine`, {
    params: { status },
  });
  return Array.isArray(response.data?.pitches) ? response.data.pitches : [];
};

export const getPitch = async (pitchId) => {
  const response = await axiosInstance.get(`${PITCHES_API_URL}/${pitchId}`);
  return response.data?.pitch || null;
};

export const createPitch = async (payload) => {
  const response = await axiosInstance.post(PITCHES_API_URL, payload);
  return response.data?.pitch || null;
};

export const updatePitch = async (pitchId, payload) => {
  const response = await axiosInstance.patch(
    `${PITCHES_API_URL}/${pitchId}`,
    payload
  );
  return response.data?.pitch || null;
};

export const deletePitch = async (pitchId) => {
  const response = await axiosInstance.delete(`${PITCHES_API_URL}/${pitchId}`);
  return response.data;
};

export const likePitch = async (pitchId) => {
  const response = await axiosInstance.post(`${PITCHES_API_URL}/${pitchId}/like`);
  return response.data;
};

export const unlikePitch = async (pitchId) => {
  const response = await axiosInstance.delete(
    `${PITCHES_API_URL}/${pitchId}/like`
  );
  return response.data;
};

export const sharePitch = async (pitchId) => {
  const response = await axiosInstance.post(
    `${PITCHES_API_URL}/${pitchId}/share`
  );
  return response.data;
};

export const viewPitch = async (pitchId) => {
  try {
    const response = await axiosInstance.post(
      `${PITCHES_API_URL}/${pitchId}/view`
    );
    return response.data;
  } catch (error) {
    console.warn("viewPitch failed:", apiErrorMessage(error));
    return null;
  }
};

export const recordPitchCta = async (pitchId) => {
  const response = await axiosInstance.post(`${PITCHES_API_URL}/${pitchId}/cta`);
  return response.data;
};

export { apiErrorMessage };
