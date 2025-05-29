import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

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
      <div className="container">
         <div className="auth-container">
            <div className="auth-header">
               <h1>Welcome to Our App</h1>
               <p>Please log in or register to continue</p>
            </div>
            <div className="auth-content">
               <Outlet />
            </div>
         </div>
      </div>
   );
}
