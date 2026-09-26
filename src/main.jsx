import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/icons/fontawesome/css/all.min.css";
import "./css/style.css";
import "./css/admin.css";
import ReactDOM from "react-dom/client";
import ThemeContextProvider from "./context/ThemeContext.jsx";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  </Provider>
);
