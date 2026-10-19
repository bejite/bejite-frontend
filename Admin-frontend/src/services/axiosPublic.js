import axios from "axios";
import { API_URL } from "../config";

const axiosPublic = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosPublic;
