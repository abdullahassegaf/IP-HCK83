import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteBooks } from "../store"; // Adjust path as needed
import Card from "../Components/Card"; // Adjust path as needed
import { Link } from "react-router";

export default function Favorites() {
   const dispatch = useDispatch();
   const { favoriteBooks, favoriteLoading, favoriteError } = useSelector(
      (state) => state.books
   );

   useEffect(() => {
      dispatch(fetchFavoriteBooks());
   }, [dispatch]);

   if (favoriteLoading) {
      return (
         <div className="container mt-5 text-center">
            <p>Loading favorites...</p>
         </div>
      );
   }

   if (favoriteError) {
      return (
         <div className="container mt-5 text-center">
            <p className="text-danger">
               Error loading favorites: {favoriteError}
            </p>
         </div>
      );
   }

   return (
      <div className="container mt-4">
         <h2 className="mb-4 text-center">Your Favorites</h2>
         {favoriteBooks && favoriteBooks.length > 0 ? (
            <div className="row">
               {favoriteBooks.map((book) => (
                  <div className="col-md-4" key={book.id}>
                     <Card
                        id={book.Book.id} // Assuming the book details are nested under 'Book'
                        title={book.Book.title}
                        summary={book.Book.summary}
                        imageUrl={book.Book.imageUrl}
                     />
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center">
               <p>You haven't added any favorites yet.</p>
               <p>
                  Browse our <Link to="/">collection of books</Link> and add
                  your favorites!
               </p>
            </div>
         )}
      </div>
   );
}
