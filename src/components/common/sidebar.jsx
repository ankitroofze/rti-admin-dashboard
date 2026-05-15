import React, { useEffect, useReducer } from "react";
import { Collapse } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/rti.png";

const MenuList = [
  {
    title: "Dashboard",
    to: "/admin/dashboard",
    iconStyle: <i className="fa fa-gauge-high" />,
  },
  {
    title: "User Profile",
    to: "/admin/user-profile",
    iconStyle: <i className="fa fa-user-group" />,
  },
  {
    title: "Network",
    to: "/admin/network",
    iconStyle: <i className="fa fa-sitemap" />,
  },
  {
    title: "Wallets",
    to: "/admin/wallets",
    iconStyle: <i className="fa-solid fa-wallet" />,
  },
  {
    title: "Withdrawal",
    to: "/admin/withdrawal",
    iconStyle: <i className="fa-solid fa-money-bill-transfer" />,
  },
  {
    title: "News",
    to: "/admin/news",
    iconStyle: <i className="fa fa-newspaper" />,
  },
  {
    title: "Subscription Plan",
    to: "/admin/subscription-plan",
    iconStyle: <i className="fa fa-tags" />,
  },
  {
    title: "E-Paper",
    to: "/admin/e-paper",
    iconStyle: <i className="fa fa-file-pdf" />,
  },
  {
    title: "Advertisement",
    to: "/admin/advertisement",
    iconStyle: <i className="fa fa-rectangle-ad" />,
  },
  {
    title: "Quiz",
    to: "/admin/quiz",
    iconStyle: <i className="fa fa-circle-question" />,
  },
  {
    title: "Offices Addresses",
    to: "/admin/offices-addresses",
    iconStyle: <i className="fa fa-building" />,
  },
  {
    title: "News Notification",
    to: "/admin/news-notification",
    iconStyle: <i className="fa fa-paper-plane" />,
  },
  {
    title: "Contact Us",
    to: "/admin/contact-us",
    iconStyle: <i className="fa fa-phone" />,
  },
];

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active: "",
  activeSubmenu: "",
};

const SideBar = () => {
  const d = new Date();
  const location = useLocation();
  const [state, setState] = useReducer(reducer, initialState);

  const handleMenuActive = (status) => {
    setState({ active: state.active === status ? "" : status });
  };

  const handleSubmenuActive = (status) => {
    setState({ activeSubmenu: state.activeSubmenu === status ? "" : status });
  };

  const activeModule = MenuList.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
  const path = activeModule?.to.split("/").pop() || "";

  useEffect(() => {
    MenuList.forEach((data) => {
      if (data.to?.split("/").pop() === path) {
        setState({ active: data.title });
      }
      data.content?.forEach((item) => {
        if (item.to?.split("/").pop() === path) {
          setState({ active: data.title });
        }
        item.content?.forEach((ele) => {
          if (ele.to?.split("/").pop() === path) {
            setState({ activeSubmenu: item.title, active: data.title });
          }
        });
      });
    });
  }, [path]);

  return (
    <div className="deznav">
      <div className="deznav-scroll">
        <div className="rti-sidebar-logo">
          <img src={logo} alt="RTI" />
        </div>
        <ul className="metismenu" id="menu">
          {MenuList.map((data, index) => {
            const menuClass = data.classsChange;
            const isActive =
              state.active === data.title || location.pathname === data.to || location.pathname.startsWith(`${data.to}/`);

            if (menuClass === "menu-title") {
              return (
                <li className={menuClass} key={index}>
                  {data.title}
                </li>
              );
            }

            return (
              <li className={`has-menu ${isActive ? "mm-active" : ""}`} key={index}>
                {data.content && data.content.length > 0 ? (
                  <>
                    <Link
                      to="#"
                      className="has-arrow ai-icon"
                      data-title={data.title}
                      onClick={() => handleMenuActive(data.title)}
                    >
                      {data.iconStyle}{" "}
                      <span className="nav-text">
                        {data.title}
                        {data.update && (
                          <span className="badge badge-xs style-1 badge-danger ms-2">
                            {data.update}
                          </span>
                        )}
                      </span>
                    </Link>
                    <Collapse in={state.active === data.title}>
                      <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                        {data.content.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className={`${
                              state.activeSubmenu === item.title ? "mm-active" : ""
                            }${item.to?.split("/").pop() === path ? "mm-active" : ""}`}
                          >
                            {item.content && item.content.length > 0 ? (
                              <>
                                <Link
                                  to={item.to}
                                  className={item.hasMenu ? "has-arrow" : ""}
                                  onClick={() => handleSubmenuActive(item.title)}
                                >
                                  {item.title}
                                </Link>
                                <Collapse in={state.activeSubmenu === item.title}>
                                  <ul
                                    className={`${
                                      menuClass === "mm-collapse" ? "mm-show" : ""
                                    }`}
                                  >
                                    {item.content.map((subItem, subIndex) => (
                                      <li key={subIndex}>
                                        <Link
                                          className={`${
                                            subItem.to?.split("/").pop() === path
                                              ? "mm-active"
                                              : ""
                                          }`}
                                          to={subItem.to}
                                        >
                                          {subItem.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </Collapse>
                              </>
                            ) : (
                              <Link
                                to={item.to}
                                className={`${
                                  item.to?.split("/").pop() === path ? "mm-active" : ""
                                }`}
                              >
                                {item.title}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </Collapse>
                  </>
                ) : (
                  <Link
                    to={data.to}
                    className={`${data.to?.split("/").pop() === path ? "mm-active" : ""}`}
                    data-title={data.title}
                  >
                    {data.iconStyle}{" "}
                    <span className="nav-text">
                      {data.title}
                      {data.update && (
                        <span className="badge badge-xs style-1 badge-danger ms-2">
                          {data.update}
                        </span>
                      )}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="add-menu-sidebar d-none"></div>
        <div className="copyright">
          <p>
            <strong>RTI Admin Dashboard</strong> © {d.getFullYear()} All
            Rights Reserved
          </p>
          <p>Made by Roofze Digital Hub</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
