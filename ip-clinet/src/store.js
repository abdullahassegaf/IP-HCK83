import {
   configureStore,
   createSlice,
   createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
   books: [],
   loading: false,
   error: null,
   totalPages: 1,
   categories: [],
   favoriteBooks: [], // Added for favorites
   favoriteLoading: false, // Added for favorites
   favoriteError: null, // Added for favorites
};

export const fetchBooks = createAsyncThunk(
   "books/fetchBooks",
   async (
      { page = 1, limit = 9, order = "asc", search = "", category = "" },
      { rejectWithValue }
   ) => {
      try {
         const token = localStorage.getItem("access_token");
         let url = `${
            import.meta.env.VITE_SERVER_URL
         }/?page=${page}&limit=${limit}&order=${order}`;
         if (search) url += `&search=${encodeURIComponent(search)}`;
         if (category) url += `&category=${encodeURIComponent(category)}`;
         const { data } = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
         });
         return { books: data.data, totalPages: data.totalPages || 1 };
      } catch (err) {
         return rejectWithValue(err.response?.data?.message || err.message);
      }
   }
);

export const fetchCategories = createAsyncThunk(
   "books/fetchCategories",
   async (_, { rejectWithValue }) => {
      try {
         const token = localStorage.getItem("access_token");
         const { data } = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/categories`,
            {
               headers: { Authorization: `Bearer ${token}` },
            }
         );
         return data.categories;
      } catch (err) {
         return rejectWithValue(err.response?.data?.message || err.message);
      }
   }
);

// Thunk for fetching favorite books
export const fetchFavoriteBooks = createAsyncThunk(
   "books/fetchFavoriteBooks",
   async (_, { rejectWithValue }) => {
      try {
         const token = localStorage.getItem("access_token");
         const { data } = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/book/favorites`, // Assuming this is the endpoint for favorites
            {
               headers: { Authorization: `Bearer ${token}` },
            }
         );
         // Assuming the API returns an array of favorite books directly or nested under a key e.g. data.favorites
         // Adjust data.data if your API structure is different
         return data.data;
      } catch (err) {
         return rejectWithValue(err.response?.data?.message || err.message);
      }
   }
);

const booksSlice = createSlice({
   name: "books",
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(fetchBooks.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchBooks.fulfilled, (state, action) => {
            state.loading = false;
            state.books = action.payload.books;
            state.totalPages = action.payload.totalPages;
         })
         .addCase(fetchBooks.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })
         .addCase(fetchCategories.fulfilled, (state, action) => {
            state.categories = action.payload;
         })
         // Handlers for fetchFavoriteBooks
         .addCase(fetchFavoriteBooks.pending, (state) => {
            state.favoriteLoading = true;
            state.favoriteError = null;
         })
         .addCase(fetchFavoriteBooks.fulfilled, (state, action) => {
            state.favoriteLoading = false;
            state.favoriteBooks = action.payload;
         })
         .addCase(fetchFavoriteBooks.rejected, (state, action) => {
            state.favoriteLoading = false;
            state.favoriteError = action.payload;
         });
   },
});

const store = configureStore({
   reducer: {
      books: booksSlice.reducer,
   },
});

export default store;
