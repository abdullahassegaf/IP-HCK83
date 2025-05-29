const authorization = (req, res, next) => {
   console.log("<<<,mAsukk ut");

   if (!req.user) {
      return res
         .status(401)
         .json({ message: "You must be logged in to perform this action." });
   }
   next();
};

module.exports = authorization;
