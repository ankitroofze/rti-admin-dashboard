import React from "react";
import AppRoutes from "./routes/approutes";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <AppRoutes />
        <ToastContainer />
    </>
  );
}

export default App;
