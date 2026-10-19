import { useState } from 'react';
import axiosInstance from '../services/axios';
import axios from 'axios';

const useSignup = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const signup = async (url, payload) => {
        setLoading(true);
        setData(null);
        setError(null);

        try {
            const response = await axiosInstance.post(url, payload);
            const result = response.data;
            setData(result);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response.data.error);
                return;
            } else if (err instanceof Error) {
                setError(err.message);
                return;
            } else {
                setError(String(err));
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    return { loading, data, error, signup };
};

export default useSignup;
