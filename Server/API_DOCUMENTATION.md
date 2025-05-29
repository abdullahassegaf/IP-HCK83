# API Documentation

## Overview

This API provides endpoints for a book store application with user authentication, book management, favorites, and payment integration.

**Base URL:** `http://localhost:3000`

## Authentication

Most endpoints require authentication using Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Authentication Endpoints

#### 1. Register User

**POST** `/register`

Register a new user account.

**Request Body:**

```json
{
   "username": "john_doe",
   "email": "john@example.com",
   "password": "password123"
}
```

**Response:**

```json
{
   "message": "User registered successfully",
   "data": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
   }
}
```

**Status Codes:**

-  `201`: User created successfully
-  `400`: Validation error (missing fields, invalid email, etc.)
-  `400`: Email already exists

---

#### 2. Login

**POST** `/login`

Authenticate user and get access token.

**Request Body:**

```json
{
   "email": "john@example.com",
   "password": "password123"
}
```

**Response:**

```json
{
   "message": "Login successful",
   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**

-  `200`: Login successful
-  `400`: Missing email or password
-  `401`: Invalid email or password

---

#### 3. Google Sign-in

**POST** `/google-signin`

Authenticate user using Google OAuth token.

**Request Body:**

```json
{
   "googleToken": "google-oauth-token-here"
}
```

**Response:**

```json
{
   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**

-  `200`: Login successful
-  `400`: Google token is required
-  `401`: Invalid Google token

---

### Book Endpoints

#### 4. Get Books (Home)

**GET** `/`

Get paginated list of books with search and filter options.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

-  `search` (optional): Search books by title
-  `order` (optional): Sort order - "asc" or "desc" (default: "asc")
-  `page` (optional): Page number (default: 1)
-  `limit` (optional): Items per page (default: 10)
-  `category` (optional): Filter by category (can be comma-separated for multiple categories)

**Example Request:**

```
GET /?search=javascript&order=desc&page=1&limit=5&category=Programming,Technology
```

**Response:**

```json
{
   "currentPage": 1,
   "totalPages": 5,
   "totalData": 25,
   "data": [
      {
         "id": 1,
         "title": "JavaScript: The Good Parts",
         "summary": "A book about JavaScript best practices",
         "price": 29.99,
         "category": "Programming",
         "createdAt": "2025-05-27T10:30:00.000Z",
         "updatedAt": "2025-05-27T10:30:00.000Z"
      }
   ]
}
```

**Status Codes:**

-  `200`: Success
-  `400`: Invalid limit (must be number) or page/limit must be greater than 0
-  `401`: Unauthorized (invalid or missing token)

---

#### 5. Get Book Details

**GET** `/book/:id`

Get detailed information about a specific book.

**Headers:**

```
Authorization: Bearer <token>
```

**Parameters:**

-  `id`: Book ID (integer)

**Response:**

```json
{
   "data": {
      "id": 1,
      "title": "JavaScript: The Good Parts",
      "summary": "A comprehensive guide to JavaScript best practices and patterns",
      "price": 29.99,
      "category": "Programming",
      "createdAt": "2025-05-27T10:30:00.000Z",
      "updatedAt": "2025-05-27T10:30:00.000Z"
   }
}
```

**Status Codes:**

-  `200`: Success
-  `400`: Invalid book ID format
-  `401`: Unauthorized
-  `404`: Book not found

---

#### 6. Get Categories

**GET** `/categories`

Get list of all available book categories.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
   "categories": ["Programming", "Technology", "Business", "Science Fiction"]
}
```

**Status Codes:**

-  `200`: Success
-  `401`: Unauthorized

---

#### 7. Get Category Books

**GET** `/category`

Get list of all available book categories (alternative endpoint).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
   "categories": ["Programming", "Technology", "Business", "Science Fiction"]
}
```

**Status Codes:**

-  `200`: Success
-  `401`: Unauthorized

---

#### 8. Get Recommended Books

**GET** `/book/recommend`

Get AI-generated book recommendations based on category/theme.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

-  `category` (required): Theme/category for recommendations

**Example Request:**

```
GET /book/recommend?category=Programming
```

**Response:**

```json
{
   "message": "Hello from Gemini API",
   "generation": [1, 5, 12],
   "Books": [
      {
         "title": "Clean Code",
         "summary": "A handbook of agile software craftsmanship"
      },
      {
         "title": "JavaScript: The Good Parts",
         "summary": "A guide to JavaScript best practices"
      }
   ]
}
```

**Status Codes:**

-  `200`: Success
-  `401`: Unauthorized
-  `402`: Payment required (user needs to buy tokens first)

---

### Favorites Endpoints

#### 9. Add Book to Favorites

**POST** `/favorites/:bookId`

Add a book to user's favorites list.

**Headers:**

```
Authorization: Bearer <token>
```

**Parameters:**

-  `bookId`: Book ID to add to favorites

**Response:**

```json
{
   "message": "Book added to favorites successfully",
   "book": {
      "id": 1,
      "title": "JavaScript: The Good Parts",
      "summary": "A book about JavaScript best practices",
      "price": 29.99,
      "category": "Programming"
   }
}
```

**Status Codes:**

-  `201`: Book added to favorites successfully
-  `400`: Invalid book ID format or book already in favorites
-  `401`: Unauthorized
-  `404`: Book not found

---

#### 10. Get Favorite Books

**GET** `/book/favorites`

Get user's favorite books list.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
   "data": [
      {
         "id": 1,
         "userId": 1,
         "bookId": 1,
         "createdAt": "2025-05-27T10:30:00.000Z",
         "updatedAt": "2025-05-27T10:30:00.000Z",
         "Book": {
            "id": 1,
            "title": "JavaScript: The Good Parts",
            "summary": "A book about JavaScript best practices",
            "price": 29.99,
            "category": "Programming"
         }
      }
   ]
}
```

**Status Codes:**

-  `200`: Success
-  `401`: Unauthorized
-  `404`: No favorite books found

---

#### 11. Remove Book from Favorites

**DELETE** `/favorites/:id`

Remove a book from user's favorites list.

**Headers:**

```
Authorization: Bearer <token>
```

**Parameters:**

-  `id`: Favorite record ID (not book ID)

**Response:**

```json
{
   "message": "Favorite book removed successfully"
}
```

**Status Codes:**

-  `200`: Favorite removed successfully
-  `400`: Invalid favorite ID format
-  `401`: Unauthorized
-  `403`: Forbidden (trying to remove someone else's favorite)
-  `404`: Favorite book not found

---

### User Profile Endpoints

#### 12. Get User Profile

**GET** `/profile`

Get current user's profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
   "data": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "token": 5,
      "createdAt": "2025-05-27T10:30:00.000Z",
      "updatedAt": "2025-05-27T10:30:00.000Z"
   }
}
```

**Status Codes:**

-  `200`: Success
-  `401`: Unauthorized
-  `404`: User not found

---

#### 13. Update User Profile

**PUT** `/profile`

Update current user's profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
   "username": "new_username"
}
```

**Response:**

```json
{
   "message": "Profile updated successfully"
}
```

**Status Codes:**

-  `200`: Profile updated successfully
-  `401`: Unauthorized
-  `400`: Validation error

---

### Payment Endpoints

#### 14. Buy Tokens

**POST** `/buy-token`

Create a payment transaction to buy tokens.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
   "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
}
```

**Status Codes:**

-  `200`: Transaction created successfully
-  `401`: Unauthorized
-  `500`: Payment service error

---

#### 15. Midtrans Payment Notification

**POST** `/midtrans-notification`

Webhook endpoint for Midtrans payment notifications (called by Midtrans, not by client).

**Request Body:** (Sent by Midtrans)

```json
{
   "transaction_status": "settlement",
   "order_id": "order-1-1685123456789",
   "custom_field1": "1"
}
```

**Response:**

```json
{
   "message": "OK"
}
```

**Status Codes:**

-  `200`: Notification processed successfully
-  `500`: Error processing notification

---

## Error Responses

All endpoints may return the following error format:

```json
{
   "message": "Error description"
}
```

### Common Error Status Codes:

-  `400`: Bad Request - Invalid input or validation error
-  `401`: Unauthorized - Missing or invalid authentication token
-  `402`: Payment Required - User needs to buy tokens
-  `403`: Forbidden - User doesn't have permission for this action
-  `404`: Not Found - Resource not found
-  `500`: Internal Server Error - Server-side error

### Common Error Messages:

-  `"Please login first"` - Missing authorization header
-  `"Invalid token format"` - Malformed authorization header
-  `"Invalid token"` - Expired or invalid JWT token
-  `"User not found"` - User associated with token doesn't exist
-  `"Validation error"` - Missing required fields or invalid data format
-  `"Resource not found"` - Requested resource doesn't exist
-  `"You need to buy token first"` - User has no tokens for premium features

---

## Authentication Flow

1. **Register** or **Login** to get an access token
2. Include the token in all subsequent requests as: `Authorization: Bearer <token>`
3. Token expires after a certain time, requiring re-authentication
4. For premium features (recommendations), users need to buy tokens first

---

## Notes

-  All timestamps are in ISO 8601 format
-  Pagination starts from page 1
-  Category filtering supports multiple categories separated by commas
-  Search is case-insensitive and matches partial titles
-  Tokens are required for AI-powered book recommendations
-  Payment integration uses Midtrans payment gateway
