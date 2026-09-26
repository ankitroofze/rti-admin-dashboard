import axios from "axios";
import { clearAuthSession, getAuthToken } from "./authSession";

const ADMIN_ROUTE_BASE_URL = import.meta.env.DEV
  ? "/rti-admin"
  : "https://rtiapi.roofze.in/rti-admin";

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
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }
    return Promise.reject(error);
  }
);

export default adminRouteClient;
