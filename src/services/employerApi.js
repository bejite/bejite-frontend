import axiosInstance from "../utils/axiosInstance";

export const getEmployerDashboard = async (params = {}) => {
  const response = await axiosInstance.get("/api/employer/dashboard", {
    params,
  });
  return response.data;
};

export const createEmployerJob = async (jobData) => {
  const response = await axiosInstance.post("/api/employer/jobs", jobData);
  return response.data;
};

export const deleteEmployerJob = async (jobId) => {
  const response = await axiosInstance.delete(`/api/employer/jobs/${jobId}`);
  return response.data;
};

export const getJobApplications = async (jobId, params = {}) => {
  const response = await axiosInstance.get(
    `/api/employer/jobs/${jobId}/applications`,
    { params },
  );
  return response.data;
};

export const updateJobApplicationStatus = async (
  jobId,
  applicationId,
  status,
) => {
  const response = await axiosInstance.patch(
    `/api/employer/jobs/${jobId}/applications/${applicationId}`,
    { status },
  );
  return response.data;
};

export const downloadJobApplicationResume = async (jobId, applicationId) => {
  const response = await axiosInstance.get(
    `/api/employer/jobs/${jobId}/applications/${applicationId}/resume`,
    { responseType: "blob" },
  );
  return response.data;
};

export const getJobExtendInfo = async (jobId) => {
  const response = await axiosInstance.get(`/api/employer/jobs/${jobId}/extend`);
  return response.data;
};

export const extendJobForSubscriber = async (jobId) => {
  const response = await axiosInstance.post(`/api/employer/jobs/${jobId}/extend`);
  return response.data;
};

export const initJobExtensionPayment = async (jobId, currency = "USD") => {
  const response = await axiosInstance.post(
    `/api/employer/jobs/${jobId}/extend/payment/init`,
    { currency },
  );
  return response.data;
};

export const verifyJobExtensionPayment = async (jobId, reference) => {
  const response = await axiosInstance.get(
    `/api/employer/jobs/${jobId}/extend/payment/verify/${reference}`,
  );
  return response.data;
};

export const getEmployerInterviewInvitations = async (params = {}) => {
  const response = await axiosInstance.get(
    "/api/interview-invitations/employer",
    { params },
  );
  return response.data;
};

export const getEmployerJob = async (jobId) => {
  const response = await axiosInstance.get(`/api/employer/jobs/${jobId}`);
  return response.data;
};

export const updateEmployerJob = async (jobId, jobData) => {
  const response = await axiosInstance.patch(
    `/api/employer/jobs/${jobId}`,
    jobData,
  );
  return response.data;
};

export const closeEmployerJob = async (jobId) => {
  const response = await axiosInstance.post(
    `/api/employer/jobs/${jobId}/close`,
  );
  return response.data;
};

export const getJobPipeline = async (jobId) => {
  const response = await axiosInstance.get(
    `/api/employer/jobs/${jobId}/pipeline`,
  );
  return response.data;
};

export const createPipelineStage = async (jobId, stageData) => {
  const response = await axiosInstance.post(
    `/api/employer/jobs/${jobId}/pipeline/stages`,
    stageData,
  );
  return response.data;
};

export const updatePipelineStage = async (jobId, stageId, stageData) => {
  const response = await axiosInstance.patch(
    `/api/employer/jobs/${jobId}/pipeline/stages/${stageId}`,
    stageData,
  );
  return response.data;
};

export const deletePipelineStage = async (jobId, stageId) => {
  const response = await axiosInstance.delete(
    `/api/employer/jobs/${jobId}/pipeline/stages/${stageId}`,
  );
  return response.data;
};

export const reorderPipelineStages = async (jobId, stageIds) => {
  const response = await axiosInstance.put(
    `/api/employer/jobs/${jobId}/pipeline/reorder`,
    { stageIds },
  );
  return response.data;
};

export const moveApplicationStage = async (jobId, applicationId, stageId) => {
  const response = await axiosInstance.patch(
    `/api/employer/jobs/${jobId}/applications/${applicationId}/stage`,
    { stageId },
  );
  return response.data;
};

export const getApplicationFeedback = async (jobId, applicationId) => {
  const response = await axiosInstance.get(
    `/api/employer/jobs/${jobId}/applications/${applicationId}/feedback`,
  );
  return response.data;
};

export const createApplicationFeedback = async (
  jobId,
  applicationId,
  payload,
) => {
  const response = await axiosInstance.post(
    `/api/employer/jobs/${jobId}/applications/${applicationId}/feedback`,
    payload,
  );
  return response.data;
};

export const getApplicationProfile = async (jobId, applicationId) => {
  const response = await axiosInstance.get(
    `/api/employer/jobs/${jobId}/applications/${applicationId}/profile`,
  );
  return response.data;
};

export const updateApplicationNotes = async (jobId, applicationId, notes) => {
  const response = await axiosInstance.patch(
    `/api/employer/jobs/${jobId}/applications/${applicationId}/notes`,
    { notes },
  );
  return response.data;
};

export const getJobAuditLogs = async (jobId, params = {}) => {
  const response = await axiosInstance.get(
    `/api/employer/jobs/${jobId}/audit-logs`,
    { params },
  );
  return response.data;
};

export default {
  getEmployerDashboard,
  createEmployerJob,
  getEmployerJob,
  updateEmployerJob,
  closeEmployerJob,
  deleteEmployerJob,
  getJobApplications,
  updateJobApplicationStatus,
  downloadJobApplicationResume,
  getApplicationProfile,
  updateApplicationNotes,
  getJobExtendInfo,
  extendJobForSubscriber,
  initJobExtensionPayment,
  verifyJobExtensionPayment,
  getEmployerInterviewInvitations,
  getJobPipeline,
  createPipelineStage,
  updatePipelineStage,
  deletePipelineStage,
  reorderPipelineStages,
  moveApplicationStage,
  getApplicationFeedback,
  createApplicationFeedback,
  getJobAuditLogs,
};
