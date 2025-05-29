import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error("useTheme must be used within a ThemeProvider");
   }
   return context;
};

export const ThemeProvider = ({ children }) => {
   const [isDark, setIsDark] = useState(() => {
      // Check localStorage for saved theme preference
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
         return savedTheme === "dark";
      }
      // Default to dark theme (since it's already set in index.html)
      return true;
   });

   useEffect(() => {
      // Update HTML data-bs-theme attribute for Bootstrap
      document.documentElement.setAttribute(
         "data-bs-theme",
         isDark ? "dark" : "light"
      );

      // Save theme preference to localStorage
      localStorage.setItem("theme", isDark ? "dark" : "light");

      // Add custom theme class to body for additional styling
      document.body.className = isDark ? "theme-dark" : "theme-light";
   }, [isDark]);

   const toggleTheme = () => {
      setIsDark((prev) => !prev);
   };

   const value = {
      isDark,
      toggleTheme,
      theme: isDark ? "dark" : "light",
   };

   return (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
   );
};
