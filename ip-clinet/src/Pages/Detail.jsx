import { useParams } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { showSuccess, showError, showInfo } from "../Components/SweetAlert";

// Tambahkan Bootstrap Icons CDN ke head jika belum ada
if (!document.getElementById("bootstrap-icons-cdn")) {
   const link = document.createElement("link");
   link.id = "bootstrap-icons-cdn";
   link.rel = "stylesheet";
   link.href =
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
   document.head.appendChild(link);
}

export default function Detail() {
   const { id } = useParams();
   const [book, setBook] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [favLoading, setFavLoading] = useState(false);
   const [isFavorite, setIsFavorite] = useState(false);
   const [favoriteId, setFavoriteId] = useState(null);
   useEffect(() => {
      async function fetchBook() {
         setLoading(true);
         setError(null);
         try {
            const token = localStorage.getItem("access_token");
            const { data } = await axios.get(
               `${import.meta.env.VITE_SERVER_URL}/book/${id}`,
               { headers: { Authorization: `Bearer ${token}` } }
            );
            setBook(data.data);

            // Check if book is already in favorites
            await checkIfFavorite();
         } catch (err) {
            setError(err.response?.data?.message || err.message);
         } finally {
            setLoading(false);
         }
      }

      async function checkIfFavorite() {
         try {
            const token = localStorage.getItem("access_token");
            const { data } = await axios.get(
               `${import.meta.env.VITE_SERVER_URL}/book/favorites`,
               { headers: { Authorization: `Bearer ${token}` } }
            );

            const favorite = data.data.find((fav) => fav.bookId == id);
            if (favorite) {
               setIsFavorite(true);
               setFavoriteId(favorite.id);
            }
         } catch (err) {
            // If error getting favorites, just continue
            console.log("Error checking favorites:", err);
         }
      }

      fetchBook();
   }, [id]);
   async function handleFavorite() {
      setFavLoading(true);

      try {
         const token = localStorage.getItem("access_token");

         if (isFavorite) {
            // Remove from favorites
            await axios.delete(
               `${import.meta.env.VITE_SERVER_URL}/favorites/${favoriteId}`,
               { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFavorite(false);
            setFavoriteId(null);
            showInfo("Removed from favorites!");
         } else {
            // Add to favorites
            const response = await axios.post(
               `${import.meta.env.VITE_SERVER_URL}/favorites/${id}`,
               {},
               { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFavorite(true);
            showSuccess("Added to favorites!");

            // Get the favoriteId from the response or re-fetch favorites
            const { data } = await axios.get(
               `${import.meta.env.VITE_SERVER_URL}/book/favorites`,
               { headers: { Authorization: `Bearer ${token}` } }
            );
            const favorite = data.data.find((fav) => fav.bookId == id);
            if (favorite) {
               setFavoriteId(favorite.id);
            }
         }
      } catch (err) {
         showError(err.response?.data?.message || err.message);
      } finally {
         setFavLoading(false);
      }
   }

   if (loading)
      return (
         <div className="container py-5 text-center">
            <div className="spinner-border" role="status"></div>
         </div>
      );
   if (error)
      return (
         <div className="container py-5 text-center text-danger">{error}</div>
      );
   if (!book) return null;

   return (
      <div className="container py-4">
         <div className="row justify-content-center">
            <div className="col-md-8">
               <div className="card shadow-lg p-4 d-flex flex-md-row align-items-center">
                  <img
                     src={book.imageUrl}
                     alt={book.title}
                     className="img-fluid rounded mb-3 mb-md-0"
                     style={{
                        maxWidth: 240,
                        maxHeight: 340,
                        objectFit: "cover",
                     }}
                  />
                  <div className="ms-md-4 flex-grow-1">
                     {" "}
                     <div className="d-flex align-items-center justify-content-between mb-3">
                        <h2 className="mb-0">{book.title}</h2>
                        <button
                           className={`btn ${
                              isFavorite ? "btn-warning" : "btn-outline-warning"
                           } d-flex align-items-center gap-2`}
                           title={
                              isFavorite
                                 ? "Remove from Favorites"
                                 : "Add to Favorites"
                           }
                           onClick={handleFavorite}
                           disabled={favLoading}
                           style={{
                              transition: "all 0.3s ease",
                           }}
                        >
                           {favLoading ? (
                              <>
                                 <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                 ></div>
                              </>
                           ) : (
                              <>
                                 <i
                                    className={
                                       isFavorite
                                          ? "bi bi-star-fill"
                                          : "bi bi-star"
                                    }
                                    style={{ fontSize: "1.1rem" }}
                                 ></i>
                              </>
                           )}
                        </button>
                     </div>
                     <h5 className="text-secondary mb-3">by {book.author}</h5>
                     <p className="mb-2">
                        <strong>Category:</strong> {book.category}
                     </p>
                     <p className="mb-2">
                        <strong>Published:</strong> {book.publishDate}
                     </p>
                     <p className="mb-2">
                        <strong>Price:</strong> Rp
                        {book.price?.toLocaleString() || 0}
                     </p>
                     <hr />
                     <h5>Summary</h5>{" "}
                     <p
                        className="text-secondary"
                        style={{ fontSize: "1.1rem" }}
                     >
                        {book.summary}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
