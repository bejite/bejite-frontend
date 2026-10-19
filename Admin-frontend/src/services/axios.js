import axios from "axios";
import { API_URL, API_KEY } from "../config";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
  },
});



export default axiosInstance;
