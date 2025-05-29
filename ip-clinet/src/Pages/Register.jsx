import { useState } from "react";
import { Link } from "react-router";
import GoogleLoginButton from "../Components/GoogleLoginButton";

export default function Register() {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   async function handleSubmit(event) {
      event.preventDefault();
      try {
         const response = await fetch("/api/register", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
         });
         if (!response.ok) {
            throw new Error("Registration failed");
         }
         const data = await response.json();
         alert(`User registered successfully: ${data.message}`);
      } catch (error) {
         console.error("Error:", error);
         alert("Registration failed. Please try again.");
      }
   }

   return (
      <div
         className="container d-flex justify-content-center align-items-center"
         style={{ minHeight: "70vh" }}
      >
         <div className="card p-4" style={{ minWidth: "350px" }}>
            <h2 className="mb-3 text-center">Register</h2>
            <form onSubmit={handleSubmit}>
               <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                     Username:
                  </label>
                  <input
                     type="text"
                     id="username"
                     name="username"
                     className="form-control"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     required
                  />
               </div>
               <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                     Email:
                  </label>
                  <input
                     type="email"
                     id="email"
                     name="email"
                     className="form-control"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </div>
               <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                     Password:
                  </label>
                  <input
                     type="password"
                     id="password"
                     name="password"
                     className="form-control"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </div>
               <button type="submit" className="btn btn-primary w-100">
                  Register
               </button>
            </form>
            <GoogleLoginButton />
            <p className="mt-3 text-center">
               Already have an account? <Link to={"/login"}>Login here</Link>
            </p>
         </div>
      </div>
   );
}
