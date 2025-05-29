"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/hash");
module.exports = (sequelize, DataTypes) => {
   class User extends Model {
      static associate(models) {
         User.hasMany(models.FavoriteBook, {
            foreignKey: "userId",
         });
         User.hasMany(models.Transaction, {
            foreignKey: "userId",
            as: "transactions",
         });
      }
   }
   User.init(
      {
         username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               notEmpty: {
                  msg: "Username cannot be empty",
               },
               notNull: {
                  msg: "Username is required",
               },
            },
         },

         email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               isEmail: {
                  msg: "Must be a valid email format",
               },
               notEmpty: {
                  msg: "Email cannot be empty",
               },
               notNull: {
                  msg: "Email is required",
               },
            },
            unique: {
               msg: "Email address already in use",
            },
         },
         password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               notEmpty: {
                  msg: "Password cannot be empty",
               },
               notNull: {
                  msg: "Password is required",
               },
               len: {
                  args: 6,
                  msg: "Password must be at least 6 characters long",
               },
            },
         },
         token: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
         },
      },

      {
         sequelize,
         modelName: "User",
      }
   );

   User.beforeCreate((user, options) => {
      // Automatically hash the password before creating a new user
      user.password = hashPassword(user.password);
   });
   User.beforeUpdate((user, options) => {
      // Automatically hash the password before updating an existing user
      if (user.changed("password")) {
         user.password = hashPassword(user.password);
      }
   });

   return User;
};
