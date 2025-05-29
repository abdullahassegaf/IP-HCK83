const { Book, FavoriteBook, User } = require("../models/index");
const { generateContent } = require("../helpers/lib");
const { Op } = require("sequelize");

module.exports = class Controller {
   static async updateProfile(req, res, next) {
      try {
         const { username } = req.body;
         const userId = req.user.id;
         await User.update(
            { username },
            {
               where: { id: userId },
               returning: true,
            }
         );

         res.status(200).json({
            message: "Profile updated successfully",
         });
      } catch (error) {
         console.log(error);
         next(error);
      }
   }
   static async home(req, res, next) {
      try {
         const { search, order, page = 1, limit = 10, category } = req.query;
         const offset = (page - 1) * limit;
         const where = {};
         if (search) {
            where.title = {
               [Op.iLike]: `%${search}%`,
            };
         }
         if (category) {
            // category bisa array (beberapa checklist), handle OR
            let categories = category;
            if (typeof categories === "string") {
               categories = categories
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean);
            }
            console.log(categories, "categories in home controller");
            if (Array.isArray(categories) && categories.length > 0) {
               where.category = { [Op.or]: categories };
            }
         }
         const sortOrder = order === "desc" ? "DESC" : "ASC";
         if (isNaN(+limit)) {
            throw { name: "BadRequest", message: "Limit must be a number" };
         }
         if ((page || limit) && (+page < 1 || +limit < 1)) {
            throw {
               name: "BadRequest",
               message: "Page and limit must be greater than 0",
            };
         }
         const { count, rows } = await Book.findAndCountAll({
            where,
            order: [["price", sortOrder]],
            limit: +limit,
            offset: +offset,
         });

         res.status(200).json({
            currentPage: +page,
            totalPages: Math.ceil(count / limit),
            totalData: count,
            data: rows,
         });
      } catch (error) {
         next(error);
      }
   }
   static async detailBook(req, res, next) {
      try {
         const { id } = req.params;

         // Validate ID format and range
         const bookId = Number(id);
         if (!id || isNaN(bookId) || bookId <= 0) {
            throw { name: "BadRequest", message: "Invalid book ID format" };
         }

         let data = await Book.findByPk(id);
         if (!data) {
            throw { name: "NotFound", message: "Book not found" };
         }
         res.status(200).json({
            data,
         });
      } catch (error) {
         console.log(error);
         next(error);
      }
   }
   static async addFavoriteBook(req, res, next) {
      try {
         const { bookId } = req.params;
         const userId = req.user.id;

         // Validate bookId format
         const numericBookId = Number(bookId);
         if (
            !bookId ||
            isNaN(numericBookId) ||
            numericBookId <= 0 ||
            numericBookId > 2147483647
         ) {
            throw { name: "BadRequest", message: "Invalid book ID format" };
         }

         let book = await Book.findByPk(bookId);
         if (!book) {
            throw { name: "NotFound", message: "Book not found" };
         }
         let favoriteBook = await FavoriteBook.findOne({
            where: { userId, bookId },
         });
         if (favoriteBook) {
            throw {
               name: "BadRequest",
               message: "This book is already in your favorites",
            };
         }
         await FavoriteBook.create({ userId: userId, bookId: bookId });
         res.status(201).json({
            message: "Book added to favorites successfully",
            book,
         });
      } catch (error) {
         next(error);
      }
   }
   static async getFavoriteBooks(req, res, next) {
      try {
         const userId = req.user.id;
         const favoriteBooks = await FavoriteBook.findAll({
            where: { userId },
            include: [Book],
         });

         if (!favoriteBooks || favoriteBooks.length === 0) {
            return res.status(404).json({ message: "No favorite books found" });
         }

         res.status(200).json({ data: favoriteBooks });
      } catch (error) {
         next(error);
      }
   }
   static async removeFavoriteBook(req, res, next) {
      try {
         const { id } = req.params;

         // Validate ID format and range
         const favoriteId = Number(id);
         if (
            !id ||
            isNaN(favoriteId) ||
            favoriteId <= 0 ||
            favoriteId > 2147483647
         ) {
            throw { name: "BadRequest", message: "Invalid favorite ID format" };
         }

         const favoriteBook = await FavoriteBook.findByPk(id);

         if (!favoriteBook) {
            throw { name: "NotFound", message: "Favorite book not found" };
         }
         if (favoriteBook.userId !== req.user.id) {
            throw {
               name: "Forbidden",
               message: "You are not authorized to remove this favorite book",
            };
         }
         await favoriteBook.destroy();

         res.status(200).json({
            message: "Favorite book removed successfully",
         });
      } catch (error) {
         next(error);
      }
   }
   static async getRecommendedBooks(req, res, next) {
      try {
         const theme = req.query.category;
         if (!req.user.token) {
            throw {
               name: "PaymentError",
               message: "You need to buy token first",
            };
         }
         let data = await Book.findAll();
         data = data.map((el) => {
            return {
               id: el.id,
               title: el.title,
            };
         });
         const prompt = `i wanna recommend 3 books
            form the list below:
            ${data.map((el) => `-${el.title} (ID: ${el.id})`).join("\n")}
            based on the following criteria: ${theme} if the criteria is not met, return an empty array.
            the criteria is are either is a title or summary or you think the books topic is ${theme}
            `;
         const generation = await generateContent(prompt);
         const parsedOutput = JSON.parse(generation);
         const resArr = [];
         for (const el of parsedOutput) {
            const book = await Book.findOne({
               where: { id: el },
            });

            if (book) {
               resArr.push({
                  title: book.title,
                  summary: book.summary,
               });
            }
         }

         res.json({
            message: "Hello from Gemini API",
            generation: parsedOutput,
            Books: resArr,
         });
      } catch (error) {
         console.error(error, "error in getRecommendedBooks");
         next(error);
      }
   }
   static async categories(req, res, next) {
      try {
         const categories = await Book.findAll({
            attributes: [
               [
                  Book.sequelize.fn("DISTINCT", Book.sequelize.col("category")),
                  "category",
               ],
            ],
            raw: true,
         });
         res.json({
            categories: categories.map((c) => c.category).filter(Boolean),
         });
      } catch (error) {
         next(error);
      }
   }
   static async getCategoryBooks(req, res, next) {
      try {
         // SELECT DISTINCT category FROM Books
         const categories = await Book.findAll({
            attributes: [
               [
                  Book.sequelize.fn("DISTINCT", Book.sequelize.col("category")),
                  "category",
               ],
            ],
            raw: true,
         });
         res.status(200).json({
            categories: categories.map((c) => c.category).filter(Boolean),
         });
      } catch (error) {
         next(error);
      }
   }
   static async getProfile(req, res, next) {
      try {
         const userId = req.user.id;
         const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
         });
         if (!user) {
            throw { name: "NotFound", message: "User not found" };
         }
         res.status(200).json({
            data: user,
         });
      } catch (error) {
         next(error);
      }
   }
};
