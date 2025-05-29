import { useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

export default function GoogleLoginButton() {
   const navigate = useNavigate();

   useEffect(() => {
      // Pastikan script Google Identity Services sudah ada
      if (!window.google) {
         const script = document.createElement("script");
         script.src = "https://accounts.google.com/gsi/client";
         script.async = true;
         script.defer = true;
         document.body.appendChild(script);
         script.onload = initializeGoogle;
      } else {
         initializeGoogle();
      }

      function initializeGoogle() {
         window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_CLIENT_ID, // pakai CLIENT_ID dari .env
            callback: handleCredentialResponse,
         });
         window.google.accounts.id.renderButton(
            document.getElementById("google-login-btn"),
            { theme: "outline", size: "large" }
         );
      }

      async function handleCredentialResponse(response) {
         try {
            // Kirim token ke backend
            const { data } = await axios.post(
               `${import.meta.env.VITE_SERVER_URL}/google-signin`,
               {
                  googleToken: response.credential,
               }
            );
            localStorage.setItem("access_token", data.access_token);
            alert("Login Google berhasil!");
            navigate("/");
         } catch (err) {
            alert(
               err?.response?.data?.message ||
                  "Google login failed. Please try again."
            );
         }
      }
   }, [navigate]);

   return (
      <div
         id="google-login-btn"
         className="d-flex justify-content-center my-2"
      ></div>
   );
}
