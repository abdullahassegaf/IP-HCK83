require("dotenv").config();
const express = require("express");
const app = express();
const Controller = require("./controllers/controller");
const AuthController = require("./controllers/authController");
const authentication = require("./middlewares/authentication");
const authorization = require("./middlewares/authorization");
const errorHandler = require("./middlewares/errorHandler");
var cors = require("cors");
const {
   createTransaction,
   handleNotification,
} = require("./controllers/midTransController");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.post("/register", AuthController.register);
app.post("/login", AuthController.login);
app.post("/google-signin", AuthController.googleLogin);
// Authentication middleware
app.post("/midtrans-notification", handleNotification);
app.use(authentication);
app.get("/", Controller.home);
app.get("/profile", Controller.getProfile);
app.get("/book/favorites", Controller.getFavoriteBooks);
app.get("/category", Controller.getCategoryBooks);
app.post("/buy-token", createTransaction);

app.get("/book/recommend", Controller.getRecommendedBooks);
app.put("/profile", Controller.updateProfile);
app.get("/book/:id", Controller.detailBook);
app.post("/favorites/:bookId", Controller.addFavoriteBook);
app.delete("/favorites/:id", Controller.removeFavoriteBook);
app.get("/categories", Controller.categories);

// Error handler
app.use(errorHandler);

// Start the server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//    console.log(`Server is running on http://localhost:${port}`);
// });

module.exports = app;
