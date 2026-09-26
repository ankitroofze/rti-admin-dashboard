import axios from "axios";
import { clearAuthSession, getAuthToken } from "./authSession";

// NOTE: rti-admin wale clients (axiosClient/apiClient/adminRouteClient) hamesha
// baseURL ke end me "/rti-admin" force karte hain. Naye Admin RTI APIs
// (user-follows, user-blocks, pending-profiles, approve/reject-profile) backend
// par "/admin-rti" prefix ke neeche hain — isliye alag client chahiye.
const normalizeAdminRtiUrl = (url) => {
  const cleanUrl = String(url || "https://rtiapi.roofze.in/api").replace(/\/(rti-admin|admin-rti)\/?$/, "").replace(/\/+$/, "");
  return `${cleanUrl}/admin-rti`;
};

const ADMIN_RTI_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_ADMIN_RTI_DEV_BASE_URL || "/api/admin-rti")
  : normalizeAdminRtiUrl(import.meta.env.VITE_API_BASE_URL);
const adminRtiClient = axios.create({
  baseURL: ADMIN_RTI_BASE_URL,
  withCredentials: false,
  timeout: 12000,
  headers: {
    Accept: "application/json",
  },
});

adminRtiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    if (!config.headers["Content-Type"]) {
      delete config.headers["Content-Type"];
    }
  } else if (config.data && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

adminRtiClient.interceptors.response.use(
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

export default adminRtiClient;