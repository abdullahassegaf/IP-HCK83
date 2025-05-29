import { useEffect } from "react";
import Navbar from "../Components/Navbar";
import { Outlet, useNavigate } from "react-router";

export default function Layout({ children }) {
   const navigate = useNavigate();
   useEffect(() => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
         console.log(accessToken, "AuthLayout");
         navigate("/login");
      }
   }, [navigate]);
   return (
      <div className="container py-4">
         <Navbar />

         <main>
            <Outlet />
         </main>
         <footer className="text-center mt-5">
            <p className="text-muted">&copy; 2023 My Application</p>
         </footer>
      </div>
   );
}
