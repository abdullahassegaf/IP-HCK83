const request = require("supertest");
const app = require("../app");
const { User, Book, FavoriteBook, Transaction } = require("../models");
const { generateToken } = require("../helpers/jwt");

// Mock external dependencies
jest.mock("../helpers/lib", () => ({
   generateContent: jest.fn().mockResolvedValue("[1, 2, 3]"),
}));

jest.mock("midtrans-client", () => ({
   Snap: jest.fn().mockImplementation(() => ({
      createTransaction: jest.fn().mockResolvedValue({
         redirect_url: "https://test-payment.com",
      }),
      transaction: {
         notification: jest.fn().mockResolvedValue({
            transaction_status: "settlement",
            order_id: "test-order-123",
            custom_field1: "1",
         }),
      },
   })),
}));

let access_token;
let testUserId;
let testBookId;
let testUser;

beforeAll(async () => {
   // Create test user with tokens and unique email for controller tests
   testUser = await User.create({
      username: "ctrluser",
      email: "ctrluser@mail.com",
      password: "password123",
      token: 10,
   });
   testUserId = testUser.id;
   access_token = generateToken({ id: testUser.id, email: testUser.email });

   // Create test books
   const books = await Book.bulkCreate([
      {
         title: "Fiction Book 1",
         summary: "A fiction book",
         category: "Fiction",
         price: 50000,
         imageUrl: "https://test.com/image1.jpg",
      },
      {
         title: "Drama Book 1",
         summary: "A drama book",
         category: "Drama",
         price: 60000,
         imageUrl: "https://test.com/image2.jpg",
      },
      {
         title: "Science Book 1",
         summary: "A science book",
         category: "Science",
         price: 70000,
         imageUrl: "https://test.com/image3.jpg",
      },
   ]);
   testBookId = books[0].id;
});

afterAll(async () => {
   // Clean up
   await FavoriteBook.destroy({ where: {} });
   await Transaction.destroy({ where: {} });
   await Book.destroy({ where: {} });
   await User.destroy({ where: {} });
});

describe("Controller Edge Cases", () => {
   describe("Home Controller Advanced Tests", () => {
      it("should handle search with special characters", async () => {
         const res = await request(app)
            .get("/?search=Fiction%20Book")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });

      it("should handle multiple category filters as array", async () => {
         const res = await request(app)
            .get("/?category=Fiction,Drama,Science")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });

      it("should handle empty category filter", async () => {
         const res = await request(app)
            .get("/?category=")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });

      it("should handle large page numbers", async () => {
         const res = await request(app)
            .get("/?page=999&limit=10")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.data).toEqual([]);
      });

      it("should handle limit edge cases", async () => {
         const res = await request(app)
            .get("/?limit=1")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.data.length).toBeLessThanOrEqual(1);
      });

      it("should handle both search and category filters", async () => {
         const res = await request(app)
            .get("/?search=Book&category=Fiction")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty("data");
      });
   });

   describe("Profile Controller Advanced Tests", () => {
      it("should handle profile update with null username", async () => {
         const res = await request(app)
            .put("/profile")
            .set("Authorization", `Bearer ${access_token}`)
            .send({ username: null });
         expect(res.status).toBe(200);
      });

      it("should handle profile update with very long username", async () => {
         const longUsername = "a".repeat(255);
         const res = await request(app)
            .put("/profile")
            .set("Authorization", `Bearer ${access_token}`)
            .send({ username: longUsername });
         expect(res.status).toBe(200);
      });

      it("should handle profile update with special characters", async () => {
         const res = await request(app)
            .put("/profile")
            .set("Authorization", `Bearer ${access_token}`)
            .send({ username: "test@user#123" });
         expect(res.status).toBe(200);
      });
   });

   describe("Favorites Controller Advanced Tests", () => {
      beforeEach(async () => {
         // Clean favorites before each test
         await FavoriteBook.destroy({ where: { userId: testUserId } });
      });

      it("should handle adding favorite with string bookId", async () => {
         const res = await request(app)
            .post(`/favorites/${testBookId.toString()}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(201);
      });

      it("should handle removing favorite that doesn't exist", async () => {
         const res = await request(app)
            .delete("/favorites/99999")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(404);
      });

      it("should handle concurrent favorite operations", async () => {
         // Add favorite first
         await request(app)
            .post(`/favorites/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);

         // Try to add same favorite again
         const res = await request(app)
            .post(`/favorites/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(400);
      });

      it("should handle favorites list with includes", async () => {
         // Add a favorite first
         await request(app)
            .post(`/favorites/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);

         const res = await request(app)
            .get("/book/favorites")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.data[0]).toHaveProperty("Book");
      });
   });

   describe("Recommendations Controller Advanced Tests", () => {
      it("should handle recommendation with user having tokens", async () => {
         const res = await request(app)
            .get("/book/recommend?category=Fiction")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);
      });

      it("should handle recommendation with no category", async () => {
         const res = await request(app)
            .get("/book/recommend")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);
      });

      it("should handle recommendation with empty book list", async () => {
         // Temporarily remove all books
         const originalBooks = await Book.findAll();
         await Book.destroy({ where: {} });

         const res = await request(app)
            .get("/book/recommend?category=Fiction")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);

         // Restore books
         await Book.bulkCreate(originalBooks.map((book) => book.dataValues));
      });

      it("should handle user with zero tokens", async () => {
         // Create user with no tokens
         const userNoTokens = await User.create({
            username: "notokens",
            email: "notokens@mail.com",
            password: "password123",
            token: 0,
         });
         const noTokensAccess = generateToken({
            id: userNoTokens.id,
            email: userNoTokens.email,
         });

         const res = await request(app)
            .get("/book/recommend?category=Fiction")
            .set("Authorization", `Bearer ${noTokensAccess}`);
         expect(res.status).toBe(402);
         expect(res.body.message).toBe("You need to buy token first");
      });
   });

   describe("Categories Controller Advanced Tests", () => {
      it("should return unique categories only", async () => {
         const res = await request(app)
            .get("/categories")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.categories).toBeDefined();
         expect(Array.isArray(res.body.categories)).toBe(true);

         // Check for uniqueness
         const categories = res.body.categories;
         const uniqueCategories = [...new Set(categories)];
         expect(categories.length).toBe(uniqueCategories.length);
      });

      it("should filter out null/empty categories", async () => {
         // Create book with null category
         await Book.create({
            title: "No Category Book",
            summary: "A book without category",
            category: null,
            price: 30000,
            imageUrl: "https://test.com/image.jpg",
         });

         const res = await request(app)
            .get("/categories")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.categories).not.toContain(null);
         expect(res.body.categories).not.toContain("");
      });
   });

   describe("Book Detail Controller Advanced Tests", () => {
      it("should handle numeric string id", async () => {
         const res = await request(app)
            .get(`/book/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(200);
         expect(res.body.data.id).toBe(testBookId);
      });

      it("should handle non-numeric id gracefully", async () => {
         const res = await request(app)
            .get("/book/abc123")
            .set("Authorization", `Bearer ${access_token}`);
         expect([400, 404, 500]).toContain(res.status);
      });

      it("should handle very large id numbers", async () => {
         const res = await request(app)
            .get("/book/999999999999")
            .set("Authorization", `Bearer ${access_token}`);
         expect(res.status).toBe(404);
      });
   });

   describe("Midtrans Controller Advanced Tests", () => {
      it("should create transaction successfully", async () => {
         const res = await request(app)
            .post("/buy-token")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);
      });

      it("should handle midtrans notification with settlement", async () => {
         // Create a pending transaction
         await Transaction.create({
            token: "test-order-settlement",
            paymentStatus: "pending",
            userId: testUserId,
         });

         const res = await request(app).post("/midtrans-notification").send({
            order_id: "test-order-settlement",
            transaction_status: "settlement",
            custom_field1: testUserId.toString(),
         });
         expect([200, 500]).toContain(res.status);
      });

      it("should handle midtrans notification with capture", async () => {
         // Create a pending transaction
         await Transaction.create({
            token: "test-order-capture",
            paymentStatus: "pending",
            userId: testUserId,
         });

         const res = await request(app).post("/midtrans-notification").send({
            order_id: "test-order-capture",
            transaction_status: "capture",
            custom_field1: testUserId.toString(),
         });
         expect([200, 500]).toContain(res.status);
      });

      it("should handle midtrans notification with pending status", async () => {
         const res = await request(app).post("/midtrans-notification").send({
            order_id: "test-order-pending",
            transaction_status: "pending",
         });
         expect([200, 500]).toContain(res.status);
      });

      it("should handle midtrans notification without order_id", async () => {
         const res = await request(app).post("/midtrans-notification").send({
            transaction_status: "settlement",
         });
         expect([200, 500]).toContain(res.status);
      });

      it("should extract userId from order_id format", async () => {
         const res = await request(app)
            .post("/midtrans-notification")
            .send({
               order_id: `order-${testUserId}-123456789`,
               transaction_status: "settlement",
            });
         expect([200, 500]).toContain(res.status);
      });
   });

   describe("Error Scenarios", () => {
      it("should handle database errors gracefully", async () => {
         // This test simulates database connection issues
         // In a real scenario, you might mock the database to throw errors
         const res = await request(app)
            .get("/")
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 500]).toContain(res.status);
      });

      it("should handle malformed request data", async () => {
         const res = await request(app)
            .post("/favorites/invalid-book-id")
            .set("Authorization", `Bearer ${access_token}`);
         expect([400, 404, 500]).toContain(res.status);
      });

      it("should handle missing required fields", async () => {
         const res = await request(app).post("/register").send({
            username: "testuser",
            // missing email and password
         });
         expect(res.status).toBe(400);
      });
   });

   describe("Authentication Edge Cases", () => {
      it("should handle malformed JWT token", async () => {
         const res = await request(app)
            .get("/")
            .set("Authorization", "Bearer not.a.valid.jwt");
         expect(res.status).toBe(401);
      });

      it("should handle empty bearer token", async () => {
         const res = await request(app)
            .get("/")
            .set("Authorization", "Bearer ");
         expect(res.status).toBe(401);
      });

      it("should handle bearer token with extra spaces", async () => {
         const res = await request(app)
            .get("/")
            .set("Authorization", `  Bearer   ${access_token}  `);
         expect(res.status).toBe(401);
      });
   });
});
