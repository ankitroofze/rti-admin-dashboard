import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastMap = {
  success: toast.success,
  warning: toast.warn,
  danger: toast.error,
  error: toast.error,
  info: toast.info,
};

const AppToast = ({ show, variant = "success", message, onClose }) => {
  useEffect(() => {
    if (!show || !message) return;
    const notify = toastMap[variant] || toast.success;
    notify(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClose,
    });
  }, [message, onClose, show, variant]);

  return <ToastContainer limit={1} newestOnTop />;
};

export default AppToast;
