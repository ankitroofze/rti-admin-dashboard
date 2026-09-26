import axios from "axios";
import { clearAuthSession, getAuthToken } from "./authSession";

const normalizeAdminApiUrl = (url) => {
  const cleanUrl = String(url || "https://rtiapi.roofze.in/api/rti-admin").replace(/\/+$/, "");
  if (cleanUrl.endsWith("/rti-admin")) return cleanUrl;
  return `${cleanUrl}/rti-admin`;
};

const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_DEV_BASE_URL || "/rti-admin")
  : normalizeAdminApiUrl(import.meta.env.VITE_API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: "application/json",
  },
});

// ... baaki ka aapka interceptors wala code same rahega, usme koi dikkat nahi hai.

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
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

export default apiClient;
