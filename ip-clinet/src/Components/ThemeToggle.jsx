import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
   const { isDark, toggleTheme } = useTheme();
   return (
      <button
         className={`btn theme-toggle-btn ${
            isDark ? "btn-outline-light" : "btn-outline-dark"
         } ms-2`}
         onClick={toggleTheme}
         title={`Switch to ${isDark ? "light" : "dark"} theme`}
         style={{
            background: "transparent",
            transition: "all 0.3s ease",
            fontSize: "1.2rem",
            padding: "0.375rem 0.75rem",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "45px",
            height: "45px",
         }}
      >
         {isDark ? (
            <i
               className="bi bi-sun-fill"
               style={{
                  color: "#ffc107",
                  transition: "all 0.3s ease",
               }}
            ></i>
         ) : (
            <i
               className="bi bi-moon-fill"
               style={{
                  color: "#495057",
                  transition: "all 0.3s ease",
               }}
            ></i>
         )}
      </button>
   );
}
