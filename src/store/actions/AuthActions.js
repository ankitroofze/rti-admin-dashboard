export const loadingToggleAction = (status) => ({
  type: "LOADING_TOGGLE",
  payload: status,
});

export const loginAction = (email, password, navigate) => (dispatch) => {
  const loginEmail = "demo@example.com";
  const currentPassword = localStorage.getItem("rti-demo-password") || "123456";

  if (email === loginEmail && password === currentPassword) {
    localStorage.setItem("authToken", "demo-admin-token");
    localStorage.setItem("userData", JSON.stringify({ email }));
    localStorage.setItem("lastActivityAt", String(Date.now()));
    dispatch({ type: "LOGIN_SUCCESS" });
    navigate("/admin/dashboard", { replace: true });
    return;
  }

  dispatch({
    type: "LOGIN_ERROR",
    payload: `Please use ${loginEmail} and the current password`,
  });
};
