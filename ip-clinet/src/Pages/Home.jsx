import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks } from "../store";
import Card from "../Components/Card";
import axios from "axios";
import { showError } from "../Components/SweetAlert";

export default function Home() {
   const dispatch = useDispatch();
   const { books, loading, error, totalPages } = useSelector(
      (state) => state.books
   ); // State untuk search AI
   const [aiQuery, setAiQuery] = useState("");
   const [aiLoading, setAiLoading] = useState(false);
   const [aiResult, setAiResult] = useState([]);

   // Sidebar state
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const [limit, setLimit] = useState(9); // 9 books per page
   const [sortOrder, setSortOrder] = useState("asc");
   const [searchTerm, setSearchTerm] = useState("");
   const [categories, setCategories] = useState([]);
   const [selectedCategories, setSelectedCategories] = useState([]);

   // Helper for pagination range
   function getPageNumbers() {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + 4);
      if (end - start < 4) {
         start = Math.max(1, end - 4);
         end = Math.min(totalPages, start + 4);
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
         pages.push(i);
      }
      return pages;
   }

   // Ambil daftar kategori dari endpoint /category
   useEffect(() => {
      async function fetchCategoryList() {
         try {
            const token = localStorage.getItem("access_token");
            const { data } = await axios.get(
               `${import.meta.env.VITE_SERVER_URL}/category`,
               { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(data.categories || []);
         } catch (err) {
            setCategories([]);
         }
      }
      fetchCategoryList();
   }, []);

   useEffect(() => {
      dispatch(
         fetchBooks({
            page: currentPage,
            limit,
            order: sortOrder,
            search: searchTerm,
            category: selectedCategories.join(","),
         })
      );
      // eslint-disable-next-line
   }, [
      currentPage,
      limit,
      sortOrder,
      searchTerm,
      selectedCategories,
      dispatch,
   ]);

   useEffect(() => {
      function handleSearchEvent(e) {
         setSearchTerm(e.detail);
         setCurrentPage(1);
      }
      window.addEventListener("searchTerm", handleSearchEvent);
      return () => window.removeEventListener("searchTerm", handleSearchEvent);
   }, []);
   async function handleAiSearch(e) {
      e.preventDefault();
      setAiLoading(true);
      setAiResult([]);
      try {
         const token = localStorage.getItem("access_token");
         const { data } = await axios.get(
            `${
               import.meta.env.VITE_SERVER_URL
            }/book/recommend?category=${encodeURIComponent(aiQuery)}`,
            { headers: { Authorization: `Bearer ${token}` } }
         );
         setAiResult(data.Books || []);
      } catch (err) {
         showError(err.response?.data?.message || err.message);
      } finally {
         setAiLoading(false);
      }
   }

   // Handler untuk checklist kategori
   function handleCategoryCheck(cat) {
      setCurrentPage(1);
      setSelectedCategories((prev) =>
         prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      );
   }

   return (
      <div className="container">
         {/* Sidebar Toggle Button Row - only for small screens */}
         <div className="row d-md-none mb-3">
            <div className="col-12">
               <button
                  className="btn btn-primary w-100"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  aria-label="Show Filters"
               >
                  <i className="bi bi-tools"></i>
               </button>
            </div>
         </div>

         {/* Main Row for Sidebar and Content */}
         <div className="row mb-3">
            {/* Sidebar Column */}
            <div
               className={`col-md-3 ${
                  isSidebarOpen ? "d-block" : "d-none"
               } d-md-block`}
            >
               <div
                  className="card p-3 position-sticky"
                  style={{ top: 20, zIndex: 1020 }}
               >
                  {/* Sort and Limit moved here */}
                  <div className="mb-3">
                     <h6 className="mb-2">Sort & Display</h6>
                     <div className="mb-2">
                        <select
                           className="form-select form-select-sm"
                           value={sortOrder}
                           onChange={(e) => {
                              setSortOrder(e.target.value);
                              setCurrentPage(1);
                           }}
                        >
                           <option value="asc">
                              Sort by Price: Low to High
                           </option>
                           <option value="desc">
                              Sort by Price: High to Low
                           </option>
                        </select>
                     </div>
                     <div>
                        <select
                           className="form-select form-select-sm"
                           value={limit}
                           onChange={(e) => {
                              setLimit(Number(e.target.value));
                              setCurrentPage(1);
                           }}
                        >
                           {[3, 6, 9, 12, 15, 20, 30, 50].map((num) => (
                              <option key={num} value={num}>
                                 {num} per page
                              </option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <h6 className="mb-2">Filter by Category</h6>
                  <div
                     style={{
                        maxHeight: 350,
                        overflowY: "auto",
                        paddingRight: 8,
                     }}
                  >
                     {categories.length === 0 && (
                        <div className="text-muted">No categories</div>
                     )}
                     <div className="d-flex flex-column">
                        {categories.map((cat) => (
                           <div className="form-check" key={cat}>
                              <input
                                 className="form-check-input"
                                 type="checkbox"
                                 id={`cat-${cat}`}
                                 checked={selectedCategories.includes(cat)}
                                 onChange={() => handleCategoryCheck(cat)}
                              />
                              <label
                                 className="form-check-label"
                                 htmlFor={`cat-${cat}`}
                                 style={{ cursor: "pointer", fontWeight: 500 }}
                              >
                                 {cat}
                              </label>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Main Content Column */}
            <div className="col-12 col-md-9">
               {/* Search AI */}
               <form
                  className="mb-4"
                  onSubmit={handleAiSearch}
                  style={{ maxWidth: 500, margin: "0 auto" }}
               >
                  <div className="input-group">
                     <input
                        type="text"
                        className="form-control"
                        placeholder="Cari rekomendasi buku dengan AI (misal: Fiction, Horror, Programming)"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        disabled={aiLoading}
                     />
                     <button
                        className="btn btn-success"
                        type="submit"
                        disabled={aiLoading || !aiQuery}
                     >
                        {aiLoading ? (
                           <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                           <i className="bi bi-stars"></i>
                        )}
                        Cari AI{" "}
                     </button>
                  </div>
               </form>
               {/* Hasil AI */}
               {aiResult.length > 0 && (
                  <div className="mb-4">
                     <h5>Rekomendasi AI:</h5>
                     <div className="row">
                        {aiResult.map((book) => {
                           // Cari data lengkap dari books redux state
                           const fullBook = books.find(
                              (b) => b.title === book.title
                           );
                           return (
                              <div
                                 className="col-md-4 mb-3"
                                 key={fullBook?.id || book.title}
                              >
                                 <Card
                                    title={book.title}
                                    summary={book.summary}
                                    imageUrl={fullBook?.imageUrl || "/vite.svg"}
                                    id={fullBook?.id}
                                 />
                              </div>
                           );
                        })}
                     </div>
                  </div>
               )}
               <h2 className="mb-4">Available Books</h2>
               <p>Explore our collection of books and find your next read!</p>
               {loading && <p>Loading...</p>}
               {error && <p className="text-danger">{error}</p>}
               <div className="row">
                  {books.map((book) => (
                     <div className="col-md-4 mb-3" key={book.id}>
                        <Card
                           title={book.title}
                           summary={book.summary}
                           imageUrl={book.imageUrl}
                           id={book.id}
                        />
                     </div>
                  ))}
               </div>
               {/* Pagination Bootstrap */}
               <nav aria-label="Page navigation example">
                  <ul className="pagination justify-content-center mt-4">
                     <li
                        className={`page-item${
                           currentPage === 1 ? " disabled" : ""
                        }`}
                     >
                        <button
                           className="page-link"
                           onClick={() => setCurrentPage(1)}
                           disabled={currentPage === 1}
                        >
                           First
                        </button>
                     </li>
                     {getPageNumbers().map((page) => (
                        <li
                           key={page}
                           className={`page-item${
                              currentPage === page ? " active" : ""
                           }`}
                        >
                           <button
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                           >
                              {page}
                           </button>
                        </li>
                     ))}
                     <li
                        className={`page-item${
                           currentPage === totalPages ? " disabled" : ""
                        }`}
                     >
                        <button
                           className="page-link"
                           onClick={() => setCurrentPage(totalPages)}
                           disabled={currentPage === totalPages}
                        >
                           Last
                        </button>
                     </li>
                  </ul>
               </nav>
            </div>
         </div>
      </div>
   );
}
