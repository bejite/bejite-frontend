import { useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import axiosInstance from '../utils/axiosInstance';
import { API_URL } from "../config";
import { apiErrorMessage } from '../utils/uploadLimits';

const BASE_URL = API_URL; 


const CreateBio = () => {
    const { id: userId } = useLocalStorage('user'); 

    const handleApiError = (error) => {
        throw apiErrorMessage(error);
    };

    // posting the main bio data (JSON)
    const postBioData = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/api/cv-builder/bio/`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    }, []);

    //posting of image
    const uploadProfileImage = useCallback(async (imageFile) => {
        const dynamicEndpoint = `${BASE_URL}/api/cv-builder/bio/${userId}/photo/`; 

        const formData = new FormData();
        formData.append('profilePhoto', imageFile); 

        try {
            const response = await axiosInstance.post(dynamicEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                },
            });
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    }, [userId]); 

    return { postBioData, uploadProfileImage };
};

export default CreateBio;
