import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const ThemeContextProvider = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [background, setBackground] = useState({
    value: "light",
    label: "Light",
  });
  const [menuToggle, setMenuToggle] = useState(false);

  const changeBackground = (name) => {
    document.body.setAttribute("data-theme-version", name.value);
    setBackground(name);
  };

  const toggleBackground = () => {
    changeBackground(
      background.value === "dark"
        ? { value: "light", label: "Light" }
        : { value: "dark", label: "Dark" }
    );
  };

  useEffect(() => {
    const resizeWindow = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    document.body.setAttribute("data-typography", "poppins");
    document.body.setAttribute("data-theme-version", "light");
    document.body.setAttribute("data-layout", "vertical");
    document.body.setAttribute("direction", "ltr");
    resizeWindow();
    window.addEventListener("resize", resizeWindow);

    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        windowWidth,
        windowHeight,
        background,
        changeBackground,
        toggleBackground,
        menuToggle,
        setMenuToggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
