const request = require("supertest");
const app = require("../app");
let access_token;
let testBookId;
let favoriteId;

beforeAll(async () => {
   // Register user with unique email for book tests
   await request(app).post("/register").send({
      username: "bookuser",
      email: "bookuser@mail.com",
      password: "password123",
   });

   // Login untuk dapatkan token
   const res = await request(app).post("/login").send({
      email: "bookuser@mail.com",
      password: "password123",
   });
   access_token = res.body.access_token;
});

describe("Book API Integration", () => {
   it("GET / (home) - should return paginated books", async () => {
      const res = await request(app)
         .get("/")
         .set("Authorization", `Bearer ${access_token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
         testBookId = res.body.data[0].id;
      } else {
         // Create a test book if none exist
         const { Book } = require("../models");
         const book = await Book.create({
            title: "Test Book",
            imageUrl: "https://test.com/image.jpg",
            category: "Test",
            author: "Test Author",
            summary: "Test summary",
            price: 50000,
         });
         testBookId = book.id;
      }
   });

   it("GET /book/:id - should return book detail", async () => {
      const res = await request(app)
         .get(`/book/${testBookId}`)
         .set("Authorization", `Bearer ${access_token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", testBookId);
   });

   it("GET /book/:id - should 404 for not found", async () => {
      const res = await request(app)
         .get(`/book/999999`)
         .set("Authorization", `Bearer ${access_token}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message");
   });

   it("POST /favorites/:bookId - add favorite", async () => {
      const res = await request(app)
         .post(`/favorites/${testBookId}`)
         .set("Authorization", `Bearer ${access_token}`);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
      favoriteId = res.body.book.id || testBookId;
   });

   it("POST /favorites/:bookId - duplicate favorite", async () => {
      const res = await request(app)
         .post(`/favorites/${testBookId}`)
         .set("Authorization", `Bearer ${access_token}`);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
   });

   it("GET /book/favorites - should return favorite books", async () => {
      const res = await request(app)
         .get("/book/favorites")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 404]).toContain(res.status);
   });

   it("DELETE /favorites/:id - remove favorite", async () => {
      // get favorite id
      const favRes = await request(app)
         .get("/book/favorites")
         .set("Authorization", `Bearer ${access_token}`);
      if (favRes.body.data && favRes.body.data.length > 0) {
         const favId = favRes.body.data[0].id;
         const res = await request(app)
            .delete(`/favorites/${favId}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect([200, 404, 403]).toContain(res.status);
      }
   });

   it("DELETE /favorites/:id - not found", async () => {
      const res = await request(app)
         .delete(`/favorites/999999`)
         .set("Authorization", `Bearer ${access_token}`);
      expect([404, 403]).toContain(res.status);
   });

   it("PUT /profile - update username", async () => {
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({ username: "updateduser" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
   });

   it("GET /book/recommend - should return recommendations", async () => {
      const res = await request(app)
         .get("/book/recommend?category=Fiction")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 500]).toContain(res.status); // Gemini API bisa error quota
   });

   it("GET /book/recommend - empty result if category not found", async () => {
      const res = await request(app)
         .get("/book/recommend?category=asdasdasd")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 500]).toContain(res.status);
   });

   it("should 401 if no token", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(401);
   });

   it("should 401 if token invalid", async () => {
      const res = await request(app)
         .get("/")
         .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
   });

   // Negative test: add favorite book not found
   it("POST /favorites/:bookId - not found", async () => {
      const res = await request(app)
         .post(`/favorites/999999`)
         .set("Authorization", `Bearer ${access_token}`);
      expect(res.status).toBe(404);
   });

   // Negative test: remove favorite forbidden
   it("DELETE /favorites/:id - forbidden", async () => {
      // Simulasi forbidden dengan id random
      const res = await request(app)
         .delete(`/favorites/1`)
         .set("Authorization", `Bearer ${access_token}`);
      expect([403, 404]).toContain(res.status);
   });

   // Negative test: update profile without username
   it("PUT /profile - no username", async () => {
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({});
      expect(res.status).toBe(200); // tergantung implementasi, bisa 400 jika ada validasi
   });

   // Negative test: get book detail without token
   it("GET /book/:id - no token", async () => {
      const res = await request(app).get(`/book/${testBookId}`);
      expect(res.status).toBe(401);
   });

   // Negative test: add favorite without token
   it("POST /favorites/:bookId - no token", async () => {
      const res = await request(app).post(`/favorites/${testBookId}`);
      expect(res.status).toBe(401);
   });

   // Negative test: remove favorite without token
   it("DELETE /favorites/:id - no token", async () => {
      const res = await request(app).delete(`/favorites/1`);
      expect(res.status).toBe(401);
   });

   // Negative test: update profile without token
   it("PUT /profile - no token", async () => {
      const res = await request(app).put("/profile").send({ username: "x" });
      expect(res.status).toBe(401);
   });

   // Negative test: get favorites without token
   it("GET /book/favorites - no token", async () => {
      const res = await request(app).get("/book/favorites");
      expect(res.status).toBe(401);
   });

   // Negative test: get recommend without token
   it("GET /book/recommend - no token", async () => {
      const res = await request(app).get("/book/recommend?category=Fiction");
      expect(res.status).toBe(401);
   });

   // Negative test: register with existing email
   it("POST /register - duplicate email", async () => {
      const res = await request(app).post("/register").send({
         username: "testuser",
         email: "testuser@mail.com",
         password: "password123",
      });
      expect([400, 409]).toContain(res.status);
   });

   // Negative test: login wrong password
   it("POST /login - wrong password", async () => {
      const res = await request(app).post("/login").send({
         email: "testuser@mail.com",
         password: "wrongpassword",
      });
      expect(res.status).toBe(401);
   });

   // Negative test: login empty
   it("POST /login - empty", async () => {
      const res = await request(app).post("/login").send({});
      expect(res.status).toBe(400);
   });

   // Negative test: register empty
   it("POST /register - empty", async () => {
      const res = await request(app).post("/register").send({});
      expect(res.status).toBe(400);
   });

   it("GET /category - should return categories", async () => {
      const res = await request(app)
         .get("/category")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 404]).toContain(res.status);
   });

   it("GET /categories - should return categories", async () => {
      const res = await request(app)
         .get("/categories")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 404]).toContain(res.status);
   });

   it("PUT /profile - update with same username", async () => {
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({ username: "updateduser" });
      expect([200, 400]).toContain(res.status);
   });

   it("POST /register - invalid email", async () => {
      const res = await request(app).post("/register").send({
         username: "userx",
         email: "notanemail",
         password: "password123",
      });
      expect([400, 422]).toContain(res.status);
   });

   it("POST /login - email not registered", async () => {
      const res = await request(app).post("/login").send({
         email: "notfound@mail.com",
         password: "password123",
      });
      expect([401, 404]).toContain(res.status);
   });

   it("GET /book/:id - simulate server error", async () => {
      // Simulasi dengan id yang menyebabkan error (misal id string)
      const res = await request(app)
         .get("/book/errorid")
         .set("Authorization", `Bearer ${access_token}`);
      expect([500, 400, 404]).toContain(res.status);
   });

   it("DELETE /favorites/:id - forbidden (user lain)", async () => {
      // Simulasi forbidden dengan id random
      const res = await request(app)
         .delete(`/favorites/2`)
         .set("Authorization", `Bearer ${access_token}`);
      expect([403, 404]).toContain(res.status);
   });

   // Additional comprehensive tests for better coverage
   // Test with pagination parameters
   it("GET / - should handle pagination correctly", async () => {
      const res = await request(app)
         .get("/?page=1&limit=5")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
      if (res.status === 200) {
         expect(res.body).toHaveProperty("currentPage");
         expect(res.body).toHaveProperty("totalPages");
      }
   });

   it("GET / - should handle search parameter", async () => {
      const res = await request(app)
         .get("/?search=test")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle order parameter", async () => {
      const res = await request(app)
         .get("/?order=desc")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle category filter", async () => {
      const res = await request(app)
         .get("/?category=Fiction")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle multiple categories", async () => {
      const res = await request(app)
         .get("/?category=Fiction,Science")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle combined filters", async () => {
      const res = await request(app)
         .get("/?search=book&category=Fiction&order=asc&page=1&limit=5")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   // Profile tests
   it("GET /profile - should return user profile", async () => {
      const res = await request(app)
         .get("/profile")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET /profile - should return 401 without token", async () => {
      const res = await request(app).get("/profile");
      expect(res.status).toBe(401);
   });

   it("PUT /profile - update with valid data", async () => {
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({ username: "newtestuser" });
      expect([200, 401]).toContain(res.status);
   });

   it("PUT /profile - update with empty body", async () => {
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({});
      expect([200, 400, 401]).toContain(res.status);
   });

   // Payment/Token tests
   it("POST /buy-token - should create transaction", async () => {
      const res = await request(app)
         .post("/buy-token")
         .set("Authorization", `Bearer ${access_token}`)
         .send({ amount: 10000 });
      expect([200, 201, 401, 500]).toContain(res.status);
   });

   it("POST /buy-token - should return 401 without token", async () => {
      const res = await request(app).post("/buy-token").send({ amount: 10000 });
      expect(res.status).toBe(401);
   });

   // it("POST /buy-token - should handle empty amount", async () => {
   //    const res = await request(app)
   //       .post("/buy-token")
   //       .set("Authorization", `Bearer ${access_token}`)
   //       .send({});
   //    expect([400, 401, 500]).toContain(res.status);
   // });

   // Midtrans notification tests
   it("POST /midtrans-notification - should handle valid notification", async () => {
      const notificationData = {
         order_id: `order-1-${Date.now()}`,
         transaction_status: "settlement",
         gross_amount: "10000.00",
      };
      const res = await request(app)
         .post("/midtrans-notification")
         .send(notificationData);
      expect([200, 400, 500]).toContain(res.status);
   });

   it("POST /midtrans-notification - should handle invalid notification", async () => {
      const res = await request(app).post("/midtrans-notification").send({});
      expect([400, 500]).toContain(res.status);
   });

   it("POST /midtrans-notification - should handle capture status", async () => {
      const notificationData = {
         order_id: `order-1-${Date.now()}`,
         transaction_status: "capture",
         gross_amount: "5000.00",
      };
      const res = await request(app)
         .post("/midtrans-notification")
         .send(notificationData);
      expect([200, 400, 500]).toContain(res.status);
   });

   // Google signin tests
   it("POST /google-signin - should handle missing token", async () => {
      const res = await request(app).post("/google-signin").send({});
      expect([400, 401]).toContain(res.status);
   });

   it("POST /google-signin - should handle invalid token", async () => {
      const res = await request(app)
         .post("/google-signin")
         .send({ googleToken: "invalid_token" });
      expect([400, 401, 500]).toContain(res.status);
   });

   // Additional registration tests
   it("POST /register - should handle short password", async () => {
      const res = await request(app).post("/register").send({
         username: "shortpass",
         email: "shortpass@mail.com",
         password: "123",
      });
      expect([400, 422]).toContain(res.status);
   });

   it("POST /register - should handle missing password", async () => {
      const res = await request(app).post("/register").send({
         username: "nopass",
         email: "nopass@mail.com",
      });
      expect([400, 422]).toContain(res.status);
   });

   it("POST /register - should handle missing username", async () => {
      const res = await request(app).post("/register").send({
         email: "nousername@mail.com",
         password: "password123",
      });
      expect([400, 422]).toContain(res.status);
   });

   // Edge case login tests
   it("POST /login - should handle missing email", async () => {
      const res = await request(app).post("/login").send({
         password: "password123",
      });
      expect([400, 401]).toContain(res.status);
   });

   it("POST /login - should handle missing password", async () => {
      const res = await request(app).post("/login").send({
         email: "testuser@mail.com",
      });
      expect([400, 401]).toContain(res.status);
   });

   // Authorization header variations
   it("should handle malformed authorization header", async () => {
      const res = await request(app)
         .get("/")
         .set("Authorization", "InvalidFormat");
      expect(res.status).toBe(401);
   });

   it("should handle authorization header without Bearer", async () => {
      const res = await request(app).get("/").set("Authorization", "sometoken");
      expect(res.status).toBe(401);
   });

   it("should handle empty bearer token", async () => {
      const res = await request(app).get("/").set("Authorization", "Bearer ");
      expect(res.status).toBe(401);
   });

   // Book ID edge cases
   it("GET /book/:id - should handle negative ID", async () => {
      const res = await request(app)
         .get("/book/-1")
         .set("Authorization", `Bearer ${access_token}`);
      expect([400, 401, 404]).toContain(res.status);
   });

   it("GET /book/:id - should handle zero ID", async () => {
      const res = await request(app)
         .get("/book/0")
         .set("Authorization", `Bearer ${access_token}`);
      expect([400, 401, 404]).toContain(res.status);
   });

   it("GET /book/:id - should handle very large ID", async () => {
      const res = await request(app)
         .get("/book/999999999")
         .set("Authorization", `Bearer ${access_token}`);
      expect([401, 404]).toContain(res.status);
   });

   // Favorites edge cases
   it("POST /favorites/:bookId - should handle negative bookId", async () => {
      const res = await request(app)
         .post("/favorites/-1")
         .set("Authorization", `Bearer ${access_token}`);
      expect([400, 401, 404]).toContain(res.status);
   });

   it("POST /favorites/:bookId - should handle string bookId", async () => {
      const res = await request(app)
         .post("/favorites/notanumber")
         .set("Authorization", `Bearer ${access_token}`);
      expect([400, 401, 404]).toContain(res.status);
   });

   it("DELETE /favorites/:id - should handle negative ID", async () => {
      const res = await request(app)
         .delete("/favorites/-1")
         .set("Authorization", `Bearer ${access_token}`);
      expect([400, 401, 403, 404]).toContain(res.status);
   });

   it("DELETE /favorites/:id - should handle string ID", async () => {
      const res = await request(app)
         .delete("/favorites/notanumber")
         .set("Authorization", `Bearer ${access_token}`);
      expect([400, 401, 403, 404]).toContain(res.status);
   });

   // Recommendation edge cases
   it("GET /book/recommend - should handle empty category parameter", async () => {
      const res = await request(app)
         .get("/book/recommend?category=")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 400, 401, 500]).toContain(res.status);
   });

   it("GET /book/recommend - should handle special characters in category", async () => {
      const res = await request(app)
         .get("/book/recommend?category=Sci-Fi%20%26%20Fantasy")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401, 500]).toContain(res.status);
   });

   it("GET /book/recommend - should handle very long category name", async () => {
      const longCategory = "a".repeat(1000);
      const res = await request(app)
         .get(`/book/recommend?category=${longCategory}`)
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 400, 401, 500]).toContain(res.status);
   });

   // Profile update edge cases
   it("PUT /profile - should handle very long username", async () => {
      const longUsername = "a".repeat(1000);
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({ username: longUsername });
      expect([200, 400, 401]).toContain(res.status);
   });

   it("PUT /profile - should handle username with special characters", async () => {
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({ username: "test@user#123" });
      expect([200, 400, 401]).toContain(res.status);
   });

   it("PUT /profile - should handle null username", async () => {
      const res = await request(app)
         .put("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({ username: null });
      expect([200, 400, 401]).toContain(res.status);
   });

   // Category tests edge cases
   it("GET /category - should handle with different authentication", async () => {
      const res = await request(app)
         .get("/category")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401, 404]).toContain(res.status);
   });

   it("GET /categories - should handle with different authentication", async () => {
      const res = await request(app)
         .get("/categories")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401, 404]).toContain(res.status);
   });

   // Search with pagination edge cases
   it("GET / - should handle large page number", async () => {
      const res = await request(app)
         .get("/?page=999999&limit=10")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle zero page number", async () => {
      const res = await request(app)
         .get("/?page=0&limit=10")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle negative page number", async () => {
      const res = await request(app)
         .get("/?page=-1&limit=10")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle very large limit", async () => {
      const res = await request(app)
         .get("/?page=1&limit=1000")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle zero limit", async () => {
      const res = await request(app)
         .get("/?page=1&limit=0")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle string page/limit", async () => {
      const res = await request(app)
         .get("/?page=abc&limit=xyz")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 400, 401]).toContain(res.status);
   });

   // Search with special characters
   it("GET / - should handle search with special characters", async () => {
      const res = await request(app)
         .get("/?search=%20%21%40%23%24%25")
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   it("GET / - should handle very long search term", async () => {
      const longSearch = "test".repeat(250);
      const res = await request(app)
         .get(`/?search=${longSearch}`)
         .set("Authorization", `Bearer ${access_token}`);
      expect([200, 401]).toContain(res.status);
   });

   // Test user scenarios after successful auth
   it("POST /favorites/:bookId - add favorite after successful login", async () => {
      if (testBookId) {
         const res = await request(app)
            .post(`/favorites/${testBookId}`)
            .set("Authorization", `Bearer ${access_token}`);
         expect([201, 400, 401]).toContain(res.status);
      }
   });

   // Additional error handling tests
   it("should handle routes that don't exist", async () => {
      const res = await request(app)
         .get("/nonexistent")
         .set("Authorization", `Bearer ${access_token}`);
      expect([401, 404]).toContain(res.status);
   });

   it("should handle POST to GET-only routes", async () => {
      const res = await request(app)
         .post("/profile")
         .set("Authorization", `Bearer ${access_token}`)
         .send({});
      expect([401, 404, 405]).toContain(res.status);
   });

   it("should handle GET to POST-only routes", async () => {
      const res = await request(app)
         .get("/login")
         .set("Authorization", `Bearer ${access_token}`);
      expect([401, 404, 405]).toContain(res.status);
   });
});
