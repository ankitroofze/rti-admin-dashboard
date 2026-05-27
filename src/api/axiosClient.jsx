import axios from "axios";
import { clearAuthSession, getAuthToken } from "../services/authSession";

// Proxy ko bypass karke development me bhi direct live URL ka use karein
const API_BASE_URL = "https://rtiapi.roofze.in/api/rti-admin";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 419].includes(error.response?.status)) {
      clearAuthSession();
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }
    if (error.response?.status === 409 && !error.response.data?.message) {
      error.response.data = {
        ...error.response.data,
        message: "This record already exists or conflicts with existing data.",
      };
    }
    return Promise.reject(error);
  }
);

export default axiosClient;