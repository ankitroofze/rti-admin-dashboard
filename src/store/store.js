import { configureStore } from "@reduxjs/toolkit";

const initialAuthState = {
  errorMessage: "",
  successMessage: "",
  showLoading: false,
};

const authReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case "LOADING_TOGGLE":
      return {
        ...state,
        showLoading: action.payload,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        showLoading: false,
        successMessage: "Login successful",
        errorMessage: "",
      };
    case "LOGIN_ERROR":
      return {
        ...state,
        showLoading: false,
        successMessage: "",
        errorMessage: action.payload,
      };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
