import axios from "axios";
import { clearAuthSession, getAuthToken } from "./authSession";

const getAppLoginPath = () => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  if (base && base !== "") return `${base}/`;
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/RTI-Admin")) {
    return "/RTI-Admin/";
  }
  return "/";
};

const ADMIN_ROUTE_BASE_URL = import.meta.env.DEV
  ? "/rti-admin"
  : "https://189.72.144.238/api/rti-admin";

const adminRouteClient = axios.create({
  baseURL: ADMIN_ROUTE_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: "application/json",
  },
});

adminRouteClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    console.log("ADMIN_ROUTE_FORMDATA_REQUEST", {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      payload: Object.fromEntries(config.data.entries()),
    });
  } else if (config.data && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

adminRouteClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 419].includes(error.response?.status)) {
      clearAuthSession();
      const loginPath = getAppLoginPath();
      if (window.location.pathname !== loginPath && window.location.pathname !== loginPath.replace(/\/$/, "")) {
        window.location.replace(loginPath);
      }
    }
    return Promise.reject(error);
  }
);

export default adminRouteClient;
