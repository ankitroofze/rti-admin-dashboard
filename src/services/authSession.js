export const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;

export const getAuthToken = () => localStorage.getItem("authToken") || "";

export const setAuthSession = ({ token = "", user = null } = {}) => {
  if (token) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("isAuthenticated", "true");
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  localStorage.setItem("lastActivityAt", String(Date.now()));
};

export const clearAuthSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("lastActivityAt");
  localStorage.removeItem("user");
  localStorage.removeItem("userData");
};

export const hasAuthSession = () => Boolean(getAuthToken());
