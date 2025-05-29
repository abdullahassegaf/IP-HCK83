import { useState } from "react";
import { Link, useNavigate } from "react-router";
import GoogleLoginButton from "../Components/GoogleLoginButton";
import { showSuccess, showError } from "../Components/SweetAlert";

export default function Login() {
   const [formData, setFormData] = useState({
      email: "",
      password: "",
   });
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         const response = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/login`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(formData),
            }
         );

         const data = await response.json();

         if (response.ok) {
            // Store the access token in localStorage
            localStorage.setItem("access_token", data.access_token);
            showSuccess("Login berhasil!");
            navigate("/");
         } else {
            showError(data.message || "Login failed");
         }
      } catch (error) {
         console.error("Login error:", error);
         showError("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
         setLoading(false);
      }
   };
   return (
      <div
         className="card shadow-sm"
         style={{ maxWidth: "400px", margin: "0 auto" }}
      >
         <div className="card-body p-4">
            <h4 className="card-title text-center mb-4">Login</h4>
            <form onSubmit={handleSubmit}>
               <div className="mb-3">
                  <label htmlFor="email" className="form-label small">
                     Email
                  </label>
                  <input
                     type="email"
                     id="email"
                     name="email"
                     className="form-control form-control-sm"
                     value={formData.email}
                     onChange={handleInputChange}
                     required
                     disabled={loading}
                     placeholder="Enter your email"
                  />
               </div>
               <div className="mb-3">
                  <label htmlFor="password" className="form-label small">
                     Password
                  </label>
                  <input
                     type="password"
                     id="password"
                     name="password"
                     className="form-control form-control-sm"
                     value={formData.password}
                     onChange={handleInputChange}
                     required
                     disabled={loading}
                     placeholder="Enter your password"
                  />
               </div>
               <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
               >
                  {loading ? "Loading..." : "Login"}
               </button>
               <GoogleLoginButton />
            </form>
            <div className="text-center mt-3">
               <small className="text-muted">
                  Don't have an account?{" "}
                  <Link to={"/register"} className="text-decoration-none">
                     Register here
                  </Link>
               </small>
            </div>
         </div>
      </div>
   );
}
