import { setAuthSession } from "../../services/authSession";

export const loadingToggleAction = (status) => ({
  type: "LOADING_TOGGLE",
  payload: status,
});

export const loginAction = (email, password, navigate) => (dispatch) => {
  const loginEmail = "demo@example.com";
  const currentPassword = localStorage.getItem("rti-demo-password") || "123456";

  if (email === loginEmail && password === currentPassword) {
    setAuthSession({ token: "demo-admin-token", user: { email } });
    dispatch({ type: "LOGIN_SUCCESS" });
    navigate("/admin/dashboard", { replace: true });
    return;
  }

  dispatch({
    type: "LOGIN_ERROR",
    payload: `Please use ${loginEmail} and the current password`,
  });
};
