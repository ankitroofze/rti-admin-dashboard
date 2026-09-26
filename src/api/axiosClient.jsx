import axios from "axios";
import { clearAuthSession, getAuthToken } from "../services/authSession";

const normalizeAdminApiUrl = (url) => {
  const cleanUrl = String(url || "https://rtiapi.roofze.in/api/rti-admin").replace(/\/+$/, "");
  if (cleanUrl.endsWith("/rti-admin")) return cleanUrl;
  return `${cleanUrl}/rti-admin`;
};

const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_DEV_BASE_URL || "/rti-admin")
  : normalizeAdminApiUrl(import.meta.env.VITE_API_BASE_URL);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    if (!config.headers["Content-Type"]) {
      delete config.headers["Content-Type"];
    }
    console.log("FORMDATA_REQUEST", {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      payload: Object.fromEntries(config.data.entries()),
    });
  } else if (config.data && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
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
