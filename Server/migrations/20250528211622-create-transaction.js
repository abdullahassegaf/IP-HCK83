"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable("Transactions", {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
         },
         token: {
            type: Sequelize.STRING,
         },
         paymentStatus: {
            type: Sequelize.STRING,
         },
         userId: {
            type: Sequelize.INTEGER,
            references: {
               model: "Users", // Assuming you have a Users table
               key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE", // or 'CASCADE' based on your requirement
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
      });
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable("Transactions");
   },
};
