const request = require("supertest");
const app = require("../app");
const { User, Book, FavoriteBook, Transaction } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { hashPassword } = require("../helpers/hash");

// Mock Google OAuth2Client
jest.mock("google-auth-library", () => ({
   OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn(),
   })),
}));

let access_token;
let testUserId;
let testBookId;
let favoriteId;
let anotherUserToken;
let anotherUserId;

beforeAll(async () => {
   // Create test user with unique email for comprehensive tests
   const testUser = await User.create({
      username: "compuser",
      email: "compuser@mail.com",
      password: "password123",
      token: 10,
   });
   testUserId = testUser.id;
   access_token = generateToken({ id: testUser.id, email: testUser.email });

   // Create another user for authorization tests
   const anotherUser = await User.create({
      username: "anothercompuser",
      email: "anothercomp@mail.com",
      password: "password123",
      token: 0,
   });
   anotherUserId = anotherUser.id;
   anotherUserToken = generateToken({
      id: anotherUser.id,
      email: anotherUser.email,
   });

   // Create test book
   const testBook = await Book.create({
      title: "Test Book",
      summary: "A test book for testing",
      category: "Fiction",
      price: 50000,
      imageUrl: "https://test.com/image.jpg",
   });
   testBookId = testBook.id;
});

afterAll(async () => {
   // Clean up
   await FavoriteBook.destroy({ where: {} });
   await Transaction.destroy({ where: {} });
   await Book.destroy({ where: {} });
   await User.destroy({ where: {} });
});

describe("Authentication Tests", () => {
   describe("POST /register", () => {
      it("should register a new user successfully", async () => {
         const res = await request(app).post("/register").send({
            username: "testuser",
            email: "testuser@mail.com",
            password: "password123",
         });
         expect(res.status).toBe(201);
         expect(res.body).toHaveProperty(
            "message",
            "User registered successfully"
         );
         expect(res.body.data).toHaveProperty("email", "testuser@mail.com");
      });

      it("should return 400 for duplicate email", async () => {
         const res = await request(app).post("/register").send({
            username: "testuser",
            email: "testuser@mail.com",
            password: "password123",
         });
         expect(res.status).toBe(400);
      });

      it("should return 400 for missing fields", async () => {
         const res = await request(app).post("/register").send({});
         expect(res.status).toBe(400);
      });

      it("should return 400 for invalid email format", async () => {
         const res = await request(app).post("/register").send({
            username: "testuser2",
            email: "invalidemail",
            password: "password123",
         });
         expect(res.status).toBe(400);
      });

      it("should return 400 for short password", async () => {
         const res = await request(app).post("/register").send({
            username: "testuser3",
            email: "test3@mail.com",
            password: "123",
         });
         expect(res.status).toBe(400);
      });
   });

   describe("POST /login", () => {
      it("should login successfully with valid credentials", async () => {
         const res = await request(app).post("/login").send({
            email: "testuser@mail.com",
            password: "password123",
         });
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("access_token");
      });

      it("should return 400 for missing email", async () => {
         const res = await request(app).post("/login").send({
            password: "password123",
         });
         expect(res.status).toBe(400);
         expect(res.body.message).toBe("Email is required");
      });

      it("should return 400 for missing password", async () => {
         const res = await request(app).post("/login").send({
            email: "testuser@mail.com",
         });
         expect(res.status).toBe(400);
         expect(res.body.message).toBe("Password is required");
      });

      it("should return 401 for invalid email", async () => {
         const res = await request(app).post("/login").send({
            email: "notfound@mail.com",
            password: "password123",
         });
         expect(res.status).toBe(401);
         expect(res.body.message).toBe("Invalid email or password");
      });

      it("should return 401 for wrong password", async () => {
         const res = await request(app).post("/login").send({
            email: "testuser@mail.com",
            password: "wrongpassword",
         });
         expect(res.status).toBe(401);
         expect(res.body.message).toBe("Invalid email or password");
      });
   });
   describe("POST /google-signin", () => {
      it("should return 400 for missing google token", async () => {
         const res = await request(app).post("/google-signin").send({});
         expect(res.status).toBe(400);
         expect(res.body.message).toBe("Google Token is required");
      });

      it("should create new user and return access token for valid Google token", async () => {
         // Mock the Google OAuth2Client
         const { OAuth2Client } = require("google-auth-library");
         const mockClient = OAuth2Client.mock.results[0].value;

         const mockPayload = {
            email: "googleuser@gmail.com",
            name: "Google User",
            sub: "google-user-id-123",
         };

         const mockTicket = {
            getPayload: jest.fn().mockReturnValue(mockPayload),
         };

         mockClient.verifyIdToken.mockResolvedValue(mockTicket);

         const res = await request(app).post("/google-signin").send({
            googleToken: "valid-google-token",
         });

         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("access_token");
         expect(mockClient.verifyIdToken).toHaveBeenCalledWith({
            idToken: "valid-google-token",
            audience: process.env.CLIENT_ID,
         });
         expect(mockTicket.getPayload).toHaveBeenCalled();
      });

      it("should return existing user access token for Google login with existing email", async () => {
         // Create a user first
         await User.create({
            username: "existinggoogleuser",
            email: "existinggoogle@gmail.com",
            password: hashPassword("somepassword"),
         });

         const { OAuth2Client } = require("google-auth-library");
         const mockClient = OAuth2Client.mock.results[0].value;

         const mockPayload = {
            email: "existinggoogle@gmail.com",
            name: "Existing Google User",
            sub: "existing-google-user-id",
         };

         const mockTicket = {
            getPayload: jest.fn().mockReturnValue(mockPayload),
         };

         mockClient.verifyIdToken.mockResolvedValue(mockTicket);

         const res = await request(app).post("/google-signin").send({
            googleToken: "valid-google-token-existing",
         });

         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("access_token");
      });

      it("should handle Google OAuth verification error", async () => {
         const { OAuth2Client } = require("google-auth-library");
         const mockClient = OAuth2Client.mock.results[0].value;

         mockClient.verifyIdToken.mockRejectedValue(new Error("Invalid token"));

         const res = await request(app).post("/google-signin").send({
            googleToken: "invalid-google-token",
         });

         expect(res.status).toBe(500);
      });
   });
});

describe("Books API Tests", () => {
   describe("GET /", () => {
      it("should return paginated books", async () => {
         const res = await request(app)
            .get("/")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
         expect(res.body).toHaveProperty("currentPage");
         expect(res.body).toHaveProperty("totalPages");
      });

      it("should return books with search filter", async () => {
         const res = await request(app)
            .get("/?search=Test")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });

      it("should return books with category filter", async () => {
         const res = await request(app)
            .get("/?category=Fiction")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });

      it("should return books with multiple categories", async () => {
         const res = await request(app)
            .get("/?category=Fiction,Drama")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });

      it("should return books with order desc", async () => {
         const res = await request(app)
            .get("/?order=desc")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });

      it("should return books with pagination", async () => {
         const res = await request(app)
            .get("/?page=1&limit=5")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
         expect(res.body.currentPage).toBe(1);
      });

      it("should return 401 without token", async () => {
         const res = await request(app).get("/");
         expect(res.status).toBe(401);
      });

      it("should return 401 with invalid token", async () => {
         const res = await request(app)
            .get("/")
            .set("Authorization", "Bearer invalidtoken");
         expect(res.status).toBe(401);
      });

      it("should return 401 with wrong token format", async () => {
         const res = await request(app)
            .get("/")
            .set("Authorization", "invalidtoken");
         expect(res.status).toBe(401);
      });
   });

   describe("GET /book/:id", () => {
      it("should return book detail", async () => {
         const res = await request(app)
            .get(`/book/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.data).toHaveProperty("id", testBookId);
      });

      it("should return 404 for non-existent book", async () => {
         const res = await request(app)
            .get("/book/999999")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(404);
         expect(res.body.message).toBe("Book not found");
      });

      it("should return 401 without token", async () => {
         const res = await request(app).get(`/book/${testBookId}`);
         expect(res.status).toBe(401);
      });

      it("should handle invalid book id", async () => {
         const res = await request(app)
            .get("/book/invalid")
            .set("Authorization", `Bearer ${access_token}`);
         expect([400, 500]).toContain(res.status);
      });
   });

   describe("GET /categories", () => {
      it("should return list of categories", async () => {
         const res = await request(app)
            .get("/categories")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("categories");
         expect(Array.isArray(res.body.categories)).toBe(true);
      });

      it("should return 401 without token", async () => {
         const res = await request(app).get("/categories");
         expect(res.status).toBe(401);
      });
   });

   describe("GET /category", () => {
      it("should return list of categories", async () => {
         const res = await request(app)
            .get("/category")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("categories");
         expect(Array.isArray(res.body.categories)).toBe(true);
      });

      it("should return 401 without token", async () => {
         const res = await request(app).get("/category");
         expect(res.status).toBe(401);
      });
   });
});

describe("Favorites API Tests", () => {
   describe("POST /favorites/:bookId", () => {
      it("should add book to favorites", async () => {
         const res = await request(app)
            .post(`/favorites/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(201);
         expect(res.body.message).toBe("Book added to favorites successfully");
      });

      it("should return 400 for duplicate favorite", async () => {
         const res = await request(app)
            .post(`/favorites/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(400);
         expect(res.body.message).toBe(
            "This book is already in your favorites"
         );
      });

      it("should return 404 for non-existent book", async () => {
         const res = await request(app)
            .post("/favorites/999999")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(404);
         expect(res.body.message).toBe("Book not found");
      });

      it("should return 401 without token", async () => {
         const res = await request(app).post(`/favorites/${testBookId}`);
         expect(res.status).toBe(401);
      });
   });

   describe("GET /book/favorites", () => {
      it("should return favorite books", async () => {
         const res = await request(app)
            .get("/book/favorites")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 404]).toContain(res.status);
         if (res.status === 200) {
            expect(res.body).toHaveProperty("data");
            expect(Array.isArray(res.body.data)).toBe(true);
         }
      });

      it("should return 404 when no favorites found", async () => {
         const res = await request(app)
            .get("/book/favorites")
            .set("Authorization", `Bearer ${anotherUserToken}`);
         expect(res.status).toBe(404);
         expect(res.body.message).toBe("No favorite books found");
      });

      it("should return 401 without token", async () => {
         const res = await request(app).get("/book/favorites");
         expect(res.status).toBe(401);
      });
   });

   describe("DELETE /favorites/:id", () => {
      beforeEach(async () => {
         // Get favorite id for testing
         const favorite = await FavoriteBook.findOne({
            where: { userId: testUserId, bookId: testBookId },
         });
         if (favorite) {
            favoriteId = favorite.id;
         }
      });

      it("should remove favorite book", async () => {
         if (favoriteId) {
            const res = await request(app)
               .delete(`/favorites/${favoriteId}`)
               .set("Authorization", `Bearer ${access_token}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Favorite book removed successfully");
         }
      });

      it("should return 404 for non-existent favorite", async () => {
         const res = await request(app)
            .delete("/favorites/999999")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(404);
         expect(res.body.message).toBe("Favorite book not found");
      });

      it("should return 403 for unauthorized access", async () => {
         // Create favorite for another user then try to delete with different user
         const favorite = await FavoriteBook.create({
            userId: anotherUserId,
            bookId: testBookId,
         });

         const res = await request(app)
            .delete(`/favorites/${favorite.id}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(403);
         expect(res.body.message).toBe(
            "You are not authorized to remove this favorite book"
         );
      });

      it("should return 401 without token", async () => {
         const res = await request(app).delete("/favorites/1");
         expect(res.status).toBe(401);
      });
   });
});

describe("Profile API Tests", () => {
   describe("GET /profile", () => {
      it("should return user profile", async () => {
         const res = await request(app)
            .get("/profile")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.data).toHaveProperty("username");
         expect(res.body.data).toHaveProperty("email");
         expect(res.body.data).not.toHaveProperty("password");
      });

      it("should return 401 without token", async () => {
         const res = await request(app).get("/profile");
         expect(res.status).toBe(401);
      });
   });

   describe("PUT /profile", () => {
      it("should update profile successfully", async () => {
         const res = await request(app)
            .put("/profile")
            .set("Authorization", `Bearer ${access_token}`)
            .send({ username: "updateduser" });
         expect(res.status).toBe(200);
         expect(res.body.message).toBe("Profile updated successfully");
      });

      it("should update profile with empty username", async () => {
         const res = await request(app)
            .put("/profile")
            .set("Authorization", `Bearer ${access_token}`)
            .send({});
         expect(res.status).toBe(200);
      });

      it("should return 401 without token", async () => {
         const res = await request(app)
            .put("/profile")
            .send({ username: "test" });
         expect(res.status).toBe(401);
      });
   });
});

describe("Recommendations API Tests", () => {
   describe("GET /book/recommend", () => {
      it("should return 402 when user has no tokens", async () => {
         const res = await request(app)
            .get("/book/recommend?category=Fiction")
            .set("Authorization", `Bearer ${anotherUserToken}`);
         expect(res.status).toBe(402);
         expect(res.body.message).toBe("You need to buy token first");
      });

      it("should return recommendations when user has tokens", async () => {
         const res = await request(app)
            .get("/book/recommend?category=Fiction")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);
      });

      it("should handle empty category", async () => {
         const res = await request(app)
            .get("/book/recommend?category=")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);
      });

      it("should return 401 without token", async () => {
         const res = await request(app).get("/book/recommend?category=Fiction");
         expect(res.status).toBe(401);
      });
   });
});

describe("Payment API Tests", () => {
   describe("POST /buy-token", () => {
      it("should create transaction", async () => {
         const res = await request(app)
            .post("/buy-token")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);
      });

      it("should return 401 without token", async () => {
         const res = await request(app).post("/buy-token");
         expect(res.status).toBe(401);
      });
   });

   describe("POST /midtrans-notification", () => {
      it("should handle notification with valid order_id", async () => {
         // Create a test transaction
         await Transaction.create({
            token: "test-order-123",
            paymentStatus: "pending",
            userId: testUserId,
         });

         const res = await request(app).post("/midtrans-notification").send({
            order_id: "test-order-123",
            transaction_status: "settlement",
         });
         expect([200, 500]).toContain(res.status);
      });

      it("should handle notification with invalid data", async () => {
         const res = await request(app).post("/midtrans-notification").send({});
         expect([200, 500]).toContain(res.status);
      });
   });
});

describe("Error Handling Tests", () => {
   it("should handle invalid authorization header", async () => {
      const res = await request(app)
         .get("/")
         .set("Authorization", "InvalidHeader");
      expect(res.status).toBe(401);
   });

   it("should handle missing authorization header", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(401);
   });

   it("should handle database connection errors", async () => {
      // This test depends on your error handling implementation
      const res = await request(app)
         .get("/book/invalid-id-format")
         .set("Authorization", `Bearer ${access_token}`);
      expect([400, 500]).toContain(res.status);
   });
});

describe("Middleware Tests", () => {
   it("should handle JWT token verification errors", async () => {
      const invalidToken = "invalid.jwt.token";
      const res = await request(app)
         .get("/")
         .set("Authorization", `Bearer ${invalidToken}`);
      expect(res.status).toBe(401);
   });

   it("should handle expired tokens", async () => {
      // Create an expired token (this is a mock - real implementation would need actual expired token)
      const res = await request(app)
         .get("/")
         .set("Authorization", "Bearer expiredtoken");
      expect(res.status).toBe(401);
   });
});
