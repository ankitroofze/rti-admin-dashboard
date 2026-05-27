import axios from "axios";
import { clearAuthSession, getAuthToken } from "./authSession";

// Yeh bilkul sahi hai, isme koi change nahi karna hai
const API_BASE_URL = import.meta.env.DEV
  ? "/api/rti-admin"
  : "https://rtiapi.roofze.in/api/rti-admin";

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