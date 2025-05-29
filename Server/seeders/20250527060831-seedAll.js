"use strict";
const axios = require("axios");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      try {
         const allBooks = [];

         for (let page = 1; page <= 5; page++) {
            const response = await axios.get(
               `https://bukuacak-9bdcb4ef2605.herokuapp.com/api/v1/book?page=${page}`
            );
            const books = response.data.books || [];
            allBooks.push(...books);
         }

         const bookData = allBooks.map((book) => ({
            title: book.title || "Unknown Title",
            imageUrl: book.cover_image || null,
            category: book.category?.name || "Uncategorized",
            author: book.author?.name || "Unknown Author",
            summary: book.summary || "No summary available",
            price: book.details?.price
               ? parseInt(book.details.price.replace(/[^0-9]/g, ""), 10)
               : 0,
            publishDate: book.details?.published_date || null,
            createdAt: new Date(),
            updatedAt: new Date(),
         }));

         if (bookData.length > 0) {
            await queryInterface.bulkInsert("Books", bookData, {});
         }
      } catch (error) {
         console.error("Error seeding data:", error.message);
      }
   },

   async down(queryInterface, Sequelize) {
      await queryInterface.bulkDelete("Books", null, {});
   },
};
