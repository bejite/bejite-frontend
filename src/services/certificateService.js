import { useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { apiErrorMessage } from "../utils/uploadLimits";

export const useCreateCertificate = () => {
  const handleError = (error) => {
    throw new Error(apiErrorMessage(error));
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
