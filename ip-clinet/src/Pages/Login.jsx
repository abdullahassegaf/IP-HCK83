import { Link } from "react-router";
import GoogleLoginButton from "../Components/GoogleLoginButton";

export default function Login() {
   return (
      <div
         className="container d-flex justify-content-center align-items-center"
         style={{ minHeight: "70vh" }}
      >
         <div className="card p-4" style={{ minWidth: "350px" }}>
            <h2 className="mb-3 text-center">Login</h2>
            <form>
               <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                     Email:
                  </label>
                  <input
                     type="email"
                     id="email"
                     name="email"
                     className="form-control"
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
                     required
                  />
               </div>
               <button type="submit" className="btn btn-primary w-100">
                  Login
               </button>
               <GoogleLoginButton />
            </form>
            <p className="mt-3 text-center">
               Don't have an account?{" "}
               <Link to={"/register"}>Register here</Link>
            </p>
         </div>
      </div>
   );
}
