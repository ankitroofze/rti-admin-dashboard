import React, { useEffect, useState } from "react";
import Header from "../components/common/header";
import Sidebar from "../components/common/sidebar";
import Footer from "../components/common/footer";
import { Outlet, useNavigate } from "react-router-dom";
import AppToast from "../components/common/AppToast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(sessionStorage.getItem("loginToast") || "");

  useEffect(() => {
    if (toast) sessionStorage.removeItem("loginToast");
  }, [toast]);

  useEffect(() => {
    const expireAfter = 5 * 60 * 1000;
    const touch = () => localStorage.setItem("lastActivityAt", String(Date.now()));
    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, touch));
    touch();

    const timer = window.setInterval(() => {
      const lastActivity = Number(localStorage.getItem("lastActivityAt") || 0);
      if (Date.now() - lastActivity >= expireAfter) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("lastActivityAt");
        navigate("/", { replace: true });
      }
    }, 1000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, touch));
      window.clearInterval(timer);
    };
  }, [navigate]);

  return (
    <div id="main-wrapper" className={`show ${sidebarCollapsed ? "menu-toggle" : ""}`}>
      <AppToast show={Boolean(toast)} message={toast} onClose={() => setToast("")} />
      <Sidebar
        onMobileNavigate={() => {
          if (window.matchMedia("(max-width: 700px)").matches) {
            setSidebarCollapsed(false);
          }
        }}
      />
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      />
      <div className="content-body">
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
