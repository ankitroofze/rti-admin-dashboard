import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import profile from "../../assets/images/profile/17.jpg";
import logo from "../../assets/images/rti.png";
import { ThemeContext } from "../../context/ThemeContext.jsx";

const Header = ({ sidebarCollapsed = false, onToggleSidebar = () => {} }) => {
  const navigate = useNavigate();
  const path = window.location.pathname.split("/");
  const name = path[path.length - 1].split("-");
  const filterName = name.length >= 3 ? name.filter((n, i) => i > 0) : name;
  const finalName = filterName.includes("app")
    ? filterName.filter((f) => f !== "app")
    : filterName.includes("ui")
    ? filterName.filter((f) => f !== "ui")
    : filterName.includes("uc")
    ? filterName.filter((f) => f !== "uc")
    : filterName.includes("basic")
    ? filterName.filter((f) => f !== "basic")
    : filterName.includes("table")
    ? filterName.filter((f) => f !== "table")
    : filterName.includes("page")
    ? filterName.filter((f) => f !== "page")
    : filterName.includes("email")
    ? filterName.filter((f) => f !== "email")
    : filterName;

  const { background, changeBackground } = useContext(ThemeContext);

  function ChangeMode() {
    if (background.value === "light") {
      changeBackground({ value: "dark", label: "Dark" });
    } else {
      changeBackground({ value: "light", label: "Light" });
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("lastActivityAt");
    navigate("/");
  };

  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <button type="button" className="rti-mobile-logo-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
                <img src={logo} alt="RTI" />
              </button>
              <div className={`nav-control ${sidebarCollapsed ? "is-active" : ""}`} onClick={onToggleSidebar}>
                <div className={`hamburger ${sidebarCollapsed ? "is-active" : ""}`}>
                  <span className="line"></span>
                  <span className="line"></span>
                  <span className="line"></span>
                </div>
              </div>
              <div className="dashboard_bar" style={{ textTransform: "capitalize" }}>
                {finalName.join(" ").length === 0 ? "Dashboard" : finalName.join(" ")}
              </div>
            </div>

            <ul className="navbar-nav header-right">
              <li className="nav-item">
                <form onSubmit={(event) => event.preventDefault()}>
                  <div className="input-group search-area d-lg-inline-flex d-none me-3 rti-header-search">
                    <div className="input-group-text" id="header-search">
                      <button className="bg-transparent border-0" type="button">
                        <i className="flaticon-381-search-2"></i>
                      </button>
                    </div>
                    <input className="form-control" type="text" placeholder="Search here..." />
                  </div>
                </form>
              </li>
              <li className="nav-item dropdown notification_dropdown" onClick={ChangeMode}>
                <Link
                  to="#"
                  className={`nav-link bell dz-theme-mode ${
                    background.value === "dark" ? "active" : ""
                  }`}
                >
                  <i id="icon-light" className="fas fa-sun"></i>
                  <i id="icon-dark" className="fas fa-moon"></i>
                </Link>
              </li>

              <Dropdown as="li" className="nav-item dropdown header-profile">
                <Dropdown.Toggle
                  variant=""
                  className="nav-link i-false"
                  href="#"
                  role="button"
                  data-toggle="dropdown"
                >
                  <img src={profile} width={20} alt="" />
                  <div className="header-info">
                    <span className="text-black">
                      <strong>Peter Parkur</strong>
                    </span>
                    <p className="fs-12 mb-0">Super Admin</p>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" className="mt-2">
                  <Link to="/forgot-password" className="dropdown-item ai-icon">
                    <i className="fa fa-key text-warning" />
                    <span className="ms-2">Forgot Password</span>
                  </Link>
                  <button type="button" className="dropdown-item ai-icon" onClick={handleLogout}>
                    <i className="fa fa-sign-out-alt text-danger" />
                    <span className="ms-2">Logout</span>
                  </button>
                </Dropdown.Menu>
              </Dropdown>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
