const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

module.exports = async function authentication(req, res, next) {
   try {
      const bearerToken = req.headers.authorization;
      if (!bearerToken) {
         throw { name: "Unauthorized", message: "Please login first" };
      }
      const [type, token] = bearerToken.split(" ");
      if (type !== "Bearer" || !token) {
         throw { name: "Unauthorized", message: "Invalid token format" };
      }
      const data = verifyToken(token);
      const user = await User.findByPk(data.id);
      if (!user) {
         throw { name: "JsonWebTokenError", message: "User not found" };
      }
      req.user = {
         id: user.id,
         email: user.email,
         token: user.token,
      };

      next();
   } catch (error) {
      next(error);
   }
};
