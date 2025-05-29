import { useState } from "react";

export default function Navbar() {
   const [search, setSearch] = useState("");

   function handleSearch(e) {
      e.preventDefault();
      // Kirim event global agar Home.jsx bisa listen
      window.dispatchEvent(new CustomEvent("searchTerm", { detail: search }));
   }

   return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
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
                  />
                  <button className="btn btn-outline-success" type="submit">
                     Search
                  </button>
               </form>
            </div>
         </div>
      </nav>
   );
}
