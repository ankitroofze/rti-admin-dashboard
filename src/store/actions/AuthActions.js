export const loadingToggleAction = (status) => ({
  type: "LOADING_TOGGLE",
  payload: status,
});

export const loginAction = (email, password, navigate) => (dispatch) => {
  if (email && password) {
    localStorage.setItem("authToken", "demo-admin-token");
    localStorage.setItem("userData", JSON.stringify({ email }));
    localStorage.setItem("lastActivityAt", String(Date.now()));
    dispatch({ type: "LOGIN_SUCCESS" });
    navigate("/admin/dashboard", { replace: true });
    return;
  }

  dispatch({
    type: "LOGIN_ERROR",
    payload: "Email and password are required",
  });
};
