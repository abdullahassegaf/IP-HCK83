import { useState } from "react";
import { Link, useNavigate } from "react-router";
import GoogleLoginButton from "../Components/GoogleLoginButton";
import { showSuccess, showError } from "../Components/SweetAlert";

export default function Register() {
   const [formData, setFormData] = useState({
      username: "",
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

   async function handleSubmit(event) {
      event.preventDefault();
      setLoading(true);

      try {
         const response = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/register`,
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
            showSuccess("User registered successfully!");
            navigate("/login");
         } else {
            showError(data.message || "Registration failed");
         }
      } catch (error) {
         console.error("Registration error:", error);
         showError("Registration failed. Please try again.");
      } finally {
         setLoading(false);
      }
   }
   return (
      <div
         className="card shadow-sm"
         style={{ maxWidth: "400px", margin: "0 auto" }}
      >
         <div className="card-body p-4">
            <h4 className="card-title text-center mb-4">Register</h4>
            <form onSubmit={handleSubmit}>
               <div className="mb-3">
                  <label htmlFor="username" className="form-label small">
                     Username
                  </label>
                  <input
                     type="text"
                     id="username"
                     name="username"
                     className="form-control form-control-sm"
                     value={formData.username}
                     onChange={handleInputChange}
                     disabled={loading}
                     placeholder="Enter your username"
                  />
               </div>
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
                     disabled={loading}
                     minLength={6}
                     placeholder="Enter your password (min 6 chars)"
                  />
               </div>
               <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
               >
                  {loading ? "Loading..." : "Register"}
               </button>
            </form>
            <GoogleLoginButton />
            <div className="text-center mt-3">
               <small className="text-muted">
                  Already have an account?{" "}
                  <Link to={"/login"} className="text-decoration-none">
                     Login here
                  </Link>
               </small>
            </div>
         </div>
      </div>
   );
}
