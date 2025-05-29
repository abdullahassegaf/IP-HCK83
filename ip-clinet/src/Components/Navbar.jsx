import { useState } from "react";
import { useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
   const [search, setSearch] = useState("");
   const navigate = useNavigate();
   const { isDark } = useTheme();
   function handleSearch(e) {
      e.preventDefault();
      // Kirim event global agar Home.jsx bisa listen
      window.dispatchEvent(new CustomEvent("searchTerm", { detail: search }));
   }
   function handleLogout() {
      localStorage.removeItem("access_token");
      navigate("/login");
   }
   return (
      <nav
         className={`navbar navbar-expand-lg ${
            isDark ? "navbar-dark bg-dark" : "navbar-light bg-light"
         } mb-3`}
      >
         <div className="container">
            <a href="/" className="navbar-brand">
               MyApp
            </a>
            <button
               className="navbar-toggler"
               type="button"
               data-bs-toggle="collapse"
               data-bs-target="#navbarNav"
               aria-controls="navbarNav"
               aria-expanded="false"
               aria-label="Toggle navigation"
            >
               <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
               <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                     <a href="/" className="nav-link">
                        Home
                     </a>
                  </li>
                  <li className="nav-item">
                     <a href="/profile" className="nav-link">
                        Profile
                     </a>
                  </li>
                  <li className="nav-item">
                     <a href="/favorites" className="nav-link">
                        Favorites
                     </a>
                  </li>
               </ul>
               <form
                  className="d-flex ms-auto"
                  role="search"
                  onSubmit={handleSearch}
               >
                  <input
                     className="form-control me-2"
                     type="search"
                     placeholder="Search books..."
                     aria-label="Search"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     style={{ minWidth: 180 }}
                  />{" "}
                  <button className="btn btn-outline-success" type="submit">
                     Search
                  </button>
                  <ThemeToggle />
               </form>
               <button
                  className="btn btn-outline-danger ms-2"
                  onClick={handleLogout}
               >
                  Logout
               </button>
            </div>
         </div>
      </nav>
   );
}
