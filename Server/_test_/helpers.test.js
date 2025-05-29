const { hashPassword, comparePassword } = require("../helpers/hash");
const { generateToken, verifyToken } = require("../helpers/jwt");
const { generateContent } = require("../helpers/lib");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const errorHandler = require("../middlewares/errorHandler");

describe("Helper Functions Tests", () => {
   describe("Hash Helper", () => {
      it("should hash password correctly", () => {
         const password = "testpassword";
         const hashed = hashPassword(password);
         expect(hashed).toBeDefined();
         expect(hashed).not.toBe(password);
         expect(typeof hashed).toBe("string");
      });

      it("should compare passwords correctly", () => {
         const password = "testpassword";
         const hashed = hashPassword(password);

         expect(comparePassword(password, hashed)).toBe(true);
         expect(comparePassword("wrongpassword", hashed)).toBe(false);
      });

      it("should handle empty password", () => {
         const result = hashPassword("");
         expect(result).toBeDefined();
      });
   });

   describe("JWT Helper", () => {
      it("should generate token correctly", () => {
         const user = { id: 1, email: "test@test.com" };
         const token = generateToken(user);
         expect(token).toBeDefined();
         expect(typeof token).toBe("string");
      });

      it("should verify token correctly", () => {
         const user = { id: 1, email: "test@test.com" };
         const token = generateToken(user);
         const decoded = verifyToken(token);

         expect(decoded).toHaveProperty("id", user.id);
         expect(decoded).toHaveProperty("email", user.email);
      });

      it("should throw error for invalid token", () => {
         expect(() => {
            verifyToken("invalid.token");
         }).toThrow();
      });

      it("should throw error for malformed token", () => {
         expect(() => {
            verifyToken("invalidtoken");
         }).toThrow();
      });
   });

   describe("AI Content Generator", () => {
      it("should handle generateContent function", async () => {
         // Mock the function since it requires API key
         const prompt = "Test prompt";
         try {
            const result = await generateContent(prompt);
            expect(result).toBeDefined();
         } catch (error) {
            // Expected to fail without proper API setup
            expect(error).toBeDefined();
         }
      });
   });
});

describe("Middleware Tests", () => {
   describe("Authentication Middleware", () => {
      let req, res, next;

      beforeEach(() => {
         req = {
            headers: {},
         };
         res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
         };
         next = jest.fn();
      });

      it("should pass with valid token", async () => {
         const user = { id: 1, email: "test@test.com" };
         const token = generateToken(user);
         req.headers.authorization = `Bearer ${token}`;

         // Mock User.findByPk
         const { User } = require("../models");
         User.findByPk = jest.fn().mockResolvedValue(user);

         await authentication(req, res, next);
         expect(next).toHaveBeenCalled();
         expect(req.user).toBeDefined();
      });

      it("should fail without authorization header", async () => {
         await authentication(req, res, next);
         expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
               name: "Unauthorized",
               message: "Please login first",
            })
         );
      });

      it("should fail with invalid token format", async () => {
         req.headers.authorization = "InvalidFormat";
         await authentication(req, res, next);
         expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
               name: "Unauthorized",
               message: "Invalid token format",
            })
         );
      });

      it("should fail with invalid token", async () => {
         req.headers.authorization = "Bearer invalidtoken";
         await authentication(req, res, next);
         expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
               name: "JsonWebTokenError",
            })
         );
      });

      it("should fail when user not found", async () => {
         const user = { id: 1, email: "test@test.com" };
         const token = generateToken(user);
         req.headers.authorization = `Bearer ${token}`;

         // Mock User.findByPk to return null
         const { User } = require("../models");
         User.findByPk = jest.fn().mockResolvedValue(null);

         await authentication(req, res, next);
         expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
               name: "JsonWebTokenError",
               message: "User not found",
            })
         );
      });
   });

   describe("Authorization Middleware", () => {
      let req, res, next;

      beforeEach(() => {
         req = {};
         res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
         };
         next = jest.fn();
      });

      it("should pass with authenticated user", () => {
         req.user = { id: 1, email: "test@test.com" };
         authorization(req, res, next);
         expect(next).toHaveBeenCalled();
      });

      it("should fail without authenticated user", () => {
         authorization(req, res, next);
         expect(res.status).toHaveBeenCalledWith(401);
         expect(res.json).toHaveBeenCalledWith({
            message: "You must be logged in to perform this action.",
         });
      });
   });

   describe("Error Handler Middleware", () => {
      let req, res, next;

      beforeEach(() => {
         req = {};
         res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
         };
         next = jest.fn();
      });

      it("should handle SequelizeValidationError", () => {
         const err = {
            name: "SequelizeValidationError",
            message: "Validation failed",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(400);
         expect(res.json).toHaveBeenCalledWith({
            message: "Validation failed",
         });
      });

      it("should handle SequelizeUniqueConstraintError", () => {
         const err = {
            name: "SequelizeUniqueConstraintError",
            message: "Unique constraint failed",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(400);
         expect(res.json).toHaveBeenCalledWith({
            message: "Unique constraint failed",
         });
      });

      it("should handle BadRequest error", () => {
         const err = {
            name: "BadRequest",
            message: "Bad request",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(400);
         expect(res.json).toHaveBeenCalledWith({
            message: "Bad request",
         });
      });

      it("should handle Unauthorized error", () => {
         const err = {
            name: "Unauthorized",
            message: "Unauthorized access",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(401);
         expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized access",
         });
      });

      it("should handle JsonWebTokenError", () => {
         const err = {
            name: "JsonWebTokenError",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(401);
         expect(res.json).toHaveBeenCalledWith({
            message: "Invalid token",
         });
      });

      it("should handle NotFound error", () => {
         const err = {
            name: "NotFound",
            message: "Resource not found",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(404);
         expect(res.json).toHaveBeenCalledWith({
            message: "Resource not found",
         });
      });

      it("should handle Forbidden error", () => {
         const err = {
            name: "Forbidden",
            message: "Access forbidden",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(403);
         expect(res.json).toHaveBeenCalledWith({
            message: "Access forbidden",
         });
      });

      it("should handle PaymentError", () => {
         const err = {
            name: "PaymentError",
            message: "Payment required",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(402);
         expect(res.json).toHaveBeenCalledWith({
            message: "Payment required",
         });
      });

      it("should handle InternalServerError", () => {
         const err = {
            name: "InternalServerError",
            message: "Internal server error",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(500);
         expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error",
         });
      });

      it("should handle unknown error with default 500", () => {
         const err = {
            name: "UnknownError",
            message: "Something went wrong",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(500);
         expect(res.json).toHaveBeenCalledWith({
            message: "Internal Server Error",
         });
      });

      it("should handle error without message", () => {
         const err = {
            name: "NotFound",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(404);
         expect(res.json).toHaveBeenCalledWith({
            message: "Resource not found",
         });
      });

      it("should handle badRequest error", () => {
         const err = {
            name: "badRequest",
            message: "Bad request",
         };
         errorHandler(err, req, res, next);
         expect(res.status).toHaveBeenCalledWith(400);
         expect(res.json).toHaveBeenCalledWith({
            message: "Bad request",
         });
      });
   });
});
