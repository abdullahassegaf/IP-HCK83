import axios from "axios";
import { useState, useEffect } from "react";

export default function Profile() {
   const [editMode, setEditMode] = useState(false);
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [token, setToken] = useState(0);
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);

   // Fetch user profile on mount
   useEffect(() => {
      async function fetchProfile() {
         try {
            const accessToken = localStorage.getItem("access_token");
            const res = await axios.get(
               `${import.meta.env.VITE_SERVER_URL}/profile`,
               {
                  headers: { Authorization: `Bearer ${accessToken}` },
               }
            );
            // if (!res.ok) throw new Error("Failed to fetch profile");
            console.log(res);
            const data = res.data;
            console.log(data);

            // Assume user data is in data.data[0] (see backend Controller.home)
            // if (data.data && data.data.length > 0 && data.data[0].User) {
            //    setUsername(data.data[0].User.username);
            //    setEmail(data.data[0].User.email);
            //    setToken(data.data[0].User.token);
            // } else if (data.data && data.data.User) {
            setUsername(data.data.username);
            setEmail(data.data.email);
            setToken(data.data.token);
            // }
         } catch (err) {
            console.log(err);

            alert("Gagal mengambil data profile");
         }
      }
      fetchProfile();
   }, []);

   function handleEdit(e) {
      e.preventDefault();
      setEditMode(true);
   }

   function handleCancel() {
      setEditMode(false);
   }

   async function handleSave(e) {
      e.preventDefault();
      setSaving(true);
      try {
         const accessToken = localStorage.getItem("access_token");
         const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/profile`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ username }),
         });
         if (!res.ok) throw new Error("Failed to update profile");
         setEditMode(false);
         alert("Username updated!");
      } catch (err) {
         alert("Gagal update username");
      } finally {
         setSaving(false);
      }
   }

   async function handleBuyToken() {
      setLoading(true);
      try {
         const accessToken = localStorage.getItem("access_token");
         const res = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/buy-token`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
               },
               body: JSON.stringify({ amount: 100000 }), // 100.000 untuk 5 token
            }
         );
         const data = await res.json();
         if (data.redirect_url) {
            window.open(data.redirect_url, "_blank");
            // After payment, user should refresh to see updated token
            alert(
               "Setelah pembayaran berhasil, silakan refresh halaman untuk update token."
            );
         } else {
            alert("Gagal mendapatkan link pembayaran");
         }
      } catch (err) {
         alert("Terjadi kesalahan saat membeli token");
      } finally {
         setLoading(false);
      }
   }

   return (
      <div className="container py-5">
         <div className="row justify-content-center">
            <div className="col-md-6">
               <div className="card shadow">
                  <div className="card-body">
                     <h2 className="card-title mb-4 text-center">
                        User Profile
                     </h2>
                     <form
                        onSubmit={
                           editMode ? handleSave : (e) => e.preventDefault()
                        }
                     >
                        <div className="mb-3">
                           <label htmlFor="username" className="form-label">
                              Username
                           </label>
                           <input
                              type="text"
                              className="form-control"
                              id="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              disabled={!editMode || saving}
                              required
                           />
                        </div>
                        <div className="mb-3">
                           <label htmlFor="email" className="form-label">
                              Email
                           </label>
                           <input
                              type="email"
                              className="form-control"
                              id="email"
                              value={email}
                              disabled
                              required
                           />
                        </div>
                        <div className="mb-3">
                           <label className="form-label">Token</label>
                           <input
                              type="text"
                              className="form-control"
                              value={token}
                              disabled
                           />
                        </div>
                        <div className="d-flex justify-content-between">
                           {editMode ? (
                              <>
                                 <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={saving}
                                 >
                                    {saving ? "Saving..." : "Save"}
                                 </button>
                                 <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={saving}
                                 >
                                    Cancel
                                 </button>
                              </>
                           ) : (
                              <button
                                 type="button"
                                 className="btn btn-primary"
                                 onClick={handleEdit}
                              >
                                 Edit Profile
                              </button>
                           )}
                           <button
                              type="button"
                              className="btn btn-warning ms-2"
                              onClick={handleBuyToken}
                              disabled={loading}
                           >
                              {loading
                                 ? "Processing..."
                                 : "Buy Token (Rp100.000/5 token)"}
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
