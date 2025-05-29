"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
   class FavoriteBook extends Model {
      static associate(models) {
         FavoriteBook.belongsTo(models.User, {
            foreignKey: "userId",
         });
         FavoriteBook.belongsTo(models.Book, {
            foreignKey: "bookId",
         });
      }
   }
   FavoriteBook.init(
      {
         userId: DataTypes.INTEGER,
         bookId: DataTypes.INTEGER,
      },
      {
         sequelize,
         modelName: "FavoriteBook",
      }
   );
   return FavoriteBook;
};
