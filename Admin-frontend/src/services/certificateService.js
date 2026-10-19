import { useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";

export const useCreateCertificate = () => {
  const handleError = (error) => {
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    throw new Error(errorMessage);
  };

  const postCertficateData = useCallback(async (data) => {
    try {
      const response = await axiosInstance.post(
        "/api/cv-builder/certificates",
        data,
      );
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }, []);

  const uploadCertificateFile = useCallback(async (userId, certificateId, file) => {
    const formData = new FormData();
    formData.append("certificateFile", file);

    try {
      const response = await axiosInstance.post(
        `/api/cv-builder/certificates/${userId}/${certificateId}/file`,
        formData,
      );
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }, []);

  return { postCertficateData, uploadCertificateFile };
};
