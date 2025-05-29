import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import ThemeToggle from "../Components/ThemeToggle";

export default function AuthLayout({ children }) {
   const navigate = useNavigate();
   useEffect(() => {
      // Check if access token exists in localStorage
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
         console.log(accessToken, "AuthLayout");
         navigate("/");
      }
   }, [navigate]);
   return (
      <div className="container-fluid vh-100">
         <div className="position-absolute top-0 end-0 p-3">
            <ThemeToggle />
         </div>
         <div className="row h-100 align-items-center justify-content-center">
            <div className="col-sm-8 col-md-6 col-lg-5 col-xl-4">
               <div className="auth-content">
                  <Outlet />
               </div>
            </div>
         </div>
      </div>
   );
}
