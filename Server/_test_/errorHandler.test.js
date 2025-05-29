const errorHandler = require("../middlewares/errorHandler");

// Mock response object
function mockRes() {
   const res = {};
   res.status = jest.fn().mockReturnValue(res);
   res.json = jest.fn().mockReturnValue(res);
   return res;
}

describe("errorHandler middleware", () => {
   it("should handle SequelizeValidationError", () => {
      const err = {
         name: "SequelizeValidationError",
         message: "Validation failed",
      };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Validation failed" });
   });

   it("should handle SequelizeUniqueConstraintError", () => {
      const err = {
         name: "SequelizeUniqueConstraintError",
         message: "Unique error",
      };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Unique error" });
   });

   it("should handle BadRequest", () => {
      const err = { name: "BadRequest", message: "Bad request" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
   });

   it("should handle badRequest (case-insensitive)", () => {
      const err = { name: "badRequest", message: "bad request lower" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "bad request lower" });
   });

   it("should handle Unauthorized", () => {
      const err = { name: "Unauthorized", message: "No access" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "No access" });
   });

   it("should handle JsonWebTokenError", () => {
      const err = { name: "JsonWebTokenError" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
   });

   it("should handle NotFound", () => {
      const err = { name: "NotFound", message: "Not found" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
   });

   it("should handle Forbidden", () => {
      const err = { name: "Forbidden", message: "Forbidden" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
   });

   it("should handle InternalServerError", () => {
      const err = { name: "InternalServerError", message: "Server error" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
   });

   it("should handle PaymentError", () => {
      const err = { name: "PaymentError", message: "Payment required" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith({ message: "Payment required" });
   });

   it("should handle unknown error", () => {
      const err = { name: "UnknownError", message: "Something went wrong" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
         message: "Internal Server Error",
      });
   });

   it("should handle missing message", () => {
      const err = { name: "NotFound" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Resource not found" });
   });

   it("should handle error with no name (default case)", () => {
      const err = { message: "No name error" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
         message: "Internal Server Error",
      });
   });

   it("should handle error with no message (fallback message)", () => {
      const err = { name: "Forbidden" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden access" });
   });

   it("should handle BadRequest with no message (fallback)", () => {
      const err = { name: "BadRequest" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
         message: "Unique constraint error",
      });
   });

   it("should handle badRequest with no message (fallback)", () => {
      const err = { name: "badRequest" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Bad Request" });
   });

   it("should handle InternalServerError with no message (fallback)", () => {
      const err = { name: "InternalServerError" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
         message: "Internal Server Error",
      });
   });

   it("should handle PaymentError with no message (fallback)", () => {
      const err = { name: "PaymentError" };
      const res = mockRes();
      errorHandler(err, null, res, null);
      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith({ message: "Payment required" });
   });
});
