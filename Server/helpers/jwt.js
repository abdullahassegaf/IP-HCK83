const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
module.exports = {
   generateToken: (user) => {
      const payload = {
         id: user.id,
         email: user.email,
         role: user.role,
      };
      return jwt.sign(payload, process.env.JWT_SECRET);
   },

   verifyToken: (token) => {
      return jwt.verify(token, JWT_SECRET);
   },
};
