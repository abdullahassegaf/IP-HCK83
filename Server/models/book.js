"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
   class Book extends Model {
      static associate(models) {
         Book.hasMany(models.FavoriteBook, {
            foreignKey: "bookId",
         });
      }
   }
   Book.init(
      {
         title: DataTypes.STRING,
         imageUrl: DataTypes.STRING,
         category: DataTypes.STRING,
         author: DataTypes.STRING,
         summary: DataTypes.TEXT,
         price: DataTypes.INTEGER,
         publishDate: DataTypes.STRING,
      },
      {
         sequelize,
         modelName: "Book",
      }
   );
   return Book;
};
