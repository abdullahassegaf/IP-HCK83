module.exports = function errorHandler(err, _req, res, _next) {
   console.error("ErrorHandler called with error:", err.name, err.message);
   let statusCode = 500;
   let message = "Internal Server Error";

   switch (err.name) {
      case "SequelizeValidationError":
         statusCode = 400;
         message = err.message || "Validation error";
         break;
      case "SequelizeUniqueConstraintError":
      case "BadRequest":
         statusCode = 400;
         message = err.message || "Unique constraint error";
         break;
      case "badRequest":
         statusCode = 400;
         message = err.message || "Bad Request";
         break;
      case "Unauthorized":
         statusCode = 401;
         message = err.message || "Unauthorized access";
         break;
      case "JsonWebTokenError":
         statusCode = 401;
         message = "Invalid token";
         break;
      case "NotFound":
         statusCode = 404;
         message = err.message || "Resource not found";
         break;
      case "Forbidden":
         statusCode = 403;
         message = err.message || "Forbidden access";
         break;
      case "InternalServerError":
         statusCode = 500;
         message = err.message || "Internal Server Error";
         break;
      case "PaymentError":
         statusCode = 402;
         message = err.message || "Payment required";
         break;
   }

   return res.status(statusCode).json({ message });
};
