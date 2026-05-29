import React, { useEffect, useReducer } from "react";
import { createPortal } from "react-dom";
import { Collapse } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

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
    iconStyle: <i className="fa fa-money-bill-wave" />,
  },
  {
    title: "News",
    to: "/admin/news",
    iconStyle: <i className="fa fa-newspaper" />,
  },
  {
    title: "E-Commerce",
    iconStyle: <i className="fa fa-cart-shopping" />,
    content: [
      {
        title: "Subscription Module",
        to: "/admin/ecommerce-subscription",
      },
      {
        title: "Buy",
        to: "/admin/ecom-buy",
      },
      {
        title: "Sell",
        to: "/admin/ecom-sell",
      },
      {
        title: "Product Enquiry",
        to: "/admin/product-enquiry",
      },
    ],
  },
  {
    title: "E-Paper",
    to: "/admin/e-paper",
    iconStyle: <i className="fa fa-file-pdf" />,
  },
  {
    title: "Ads",
    iconStyle: <i className="fa fa-rectangle-ad" />,
    content: [
      {
        title: "Ads Subscription",
        to: "/admin/ads-subscription",
      },
      {
        title: "Ads Management",
        to: "/admin/ads-management",
      },
      {
        title: "Ads View Tracking",
        to: "/admin/ads-view-tracking",
      },
    ],
  },
  {
    title: "Reports List",
    iconStyle: <i className="fa fa-chart-column" />,
    content: [
      {
        title: "Product Enquiry Reports",
        to: "/admin/reports-product-enquiry",
      },
      {
        title: "User Wise Reports",
        to: "/admin/reports-user-wise",
      },
      {
        title: "Subscription Reports",
        to: "/admin/reports-subscription",
      },
      {
        title: "Ads View Reports",
        to: "/admin/reports-ads-view",
      },
    ],
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

const isRouteActive = (to, pathname) => to && to !== "#" && (pathname === to || pathname.startsWith(`${to}/`));

const hasActiveRoute = (item, pathname) => (
  isRouteActive(item.to, pathname) || item.content?.some((child) => hasActiveRoute(child, pathname))
);

const SideBar = ({ onMobileNavigate = () => {} }) => {
  const d = new Date();
  const location = useLocation();
  const [state, setState] = useReducer(reducer, initialState);
  const [tooltip, setTooltip] = React.useState(null);

  const handleMenuActive = (status) => {
    setState({ active: state.active === status ? "" : status });
  };

  const handleSubmenuActive = (status) => {
    setState({ activeSubmenu: state.activeSubmenu === status ? "" : status });
  };

  const showCollapsedTooltip = (event, title) => {
    const wrapper = document.getElementById("main-wrapper");
    const isCollapsed = wrapper?.classList.contains("menu-toggle");
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    if (!isCollapsed || isMobile) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      title,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const hideCollapsedTooltip = () => setTooltip(null);

  const activeModule = MenuList.find((item) => hasActiveRoute(item, location.pathname));
  const activeSubmenu = activeModule?.content?.find((item) => item.content?.some((ele) => isRouteActive(ele.to, location.pathname)));
  const activeLeaf = [
    ...(activeModule?.content || []),
    ...(activeSubmenu?.content || []),
  ].find((item) => isRouteActive(item.to, location.pathname));
  const path = activeLeaf?.to?.split("/").pop() || activeModule?.to?.split("/").pop() || "";

  useEffect(() => {
    MenuList.forEach((data) => {
      if (isRouteActive(data.to, location.pathname)) {
        setState({ active: data.title });
      }
      data.content?.forEach((item) => {
        if (isRouteActive(item.to, location.pathname)) {
          setState({ active: data.title });
        }
        item.content?.forEach((ele) => {
          if (isRouteActive(ele.to, location.pathname)) {
            setState({ activeSubmenu: item.title, active: data.title });
          }
        });
      });
    });
  }, [location.pathname]);

  return (
    <div className="deznav">
      <div className="deznav-scroll">
        <ul className="metismenu" id="menu">
          {MenuList.map((data, index) => {
            const menuClass = data.classsChange;
            const isActive =
              state.active === data.title || isRouteActive(data.to, location.pathname) || hasActiveRoute(data, location.pathname);

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
                      title={data.title}
                      onClick={() => handleMenuActive(data.title)}
                      onMouseEnter={(event) => showCollapsedTooltip(event, data.title)}
                      onMouseLeave={hideCollapsedTooltip}
                      onFocus={(event) => showCollapsedTooltip(event, data.title)}
                      onBlur={hideCollapsedTooltip}
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
                                  data-title={item.title}
                                  title={item.title}
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
                                          data-title={subItem.title}
                                          title={subItem.title}
                                          onClick={onMobileNavigate}
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
                                data-title={item.title}
                                title={item.title}
                                onClick={onMobileNavigate}
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
                    title={data.title}
                    onClick={onMobileNavigate}
                    onMouseEnter={(event) => showCollapsedTooltip(event, data.title)}
                    onMouseLeave={hideCollapsedTooltip}
                    onFocus={(event) => showCollapsedTooltip(event, data.title)}
                    onBlur={hideCollapsedTooltip}
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
      {tooltip && createPortal(
        <div
          className="rti-sidebar-tooltip"
          style={{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }}
        >
          {tooltip.title}
        </div>,
        document.body
      )}
    </div>
  );
};

export default SideBar;
