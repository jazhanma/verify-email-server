# Authentication Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Overview
This document provides the input and output parameters for all API endpoints in the authentication backend. Each endpoint is documented with:
- **HTTP Method and Path**
- **Input Parameters** (Request Body, Query Parameters, Headers)
- **Output Parameters** (Response Body, Status Codes)
- **Example Requests and Responses**

---

## 1. User Registration

### **POST** `/api/register`

**Description:** Register a new user account with email verification

#### Input Parameters
**Request Body (JSON):**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)",
  "role": "string (required, one of: customer, admin, manager, worker)"
}
```

**Headers:**
```
Content-Type: application/json
```

#### Output Parameters
**Success Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "string (MongoDB ObjectId)",
    "name": "string",
    "email": "string",
    "role": "string",
    "isVerified": false
  },
  "emailSent": true,
  "emailError": null
}
```

**Error Responses:**
- **400 Bad Request** - Missing fields, invalid email, invalid role, password too short, email already exists
- **500 Internal Server Error** - Server error

#### Example Request
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

---

## 2. User Login

### **POST** `/api/auth/login`

**Description:** Authenticate a user with email and password

#### Input Parameters
**Request Body (JSON):**
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required)",
  "role": "string (required, one of: customer, admin, manager, worker)"
}
```

**Headers:**
```
Content-Type: application/json
```

#### Output Parameters
**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "string (MongoDB ObjectId)",
    "email": "string",
    "role": "string",
    "name": "string",
    "isVerified": true
  }
}
```

**Error Responses:**
- **400 Bad Request** - Missing fields, invalid email format, invalid role
- **401 Unauthorized** - Invalid password
- **403 Forbidden** - Email not verified
- **404 Not Found** - User not found
- **500 Internal Server Error** - Server error

#### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

---

## 3. Email Verification

### **GET** `/api/auth/verify`

**Description:** Verify user email address via verification link (returns HTML page)

#### Input Parameters
**Query Parameters:**
```
email: string (required, valid email format)
```

**Headers:**
```
None required
```

#### Output Parameters
**Success Response (200) - HTML Page:**
Returns a beautiful HTML page with:
- Success message: "Email Verified Successfully!"
- User account details (name, email, role)
- Auto-redirect to frontend after 5 seconds
- "Continue to Website" button

**Already Verified Response (200) - HTML Page:**
Returns HTML page with:
- Message: "Email Already Verified"
- Auto-redirect to frontend after 3 seconds

**Error Responses - HTML Pages:**
- **400 Bad Request** - Email parameter missing or invalid email format
- **404 Not Found** - User not found
- **500 Internal Server Error** - Server error

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/auth/verify?email=john@example.com"
```

**Note:** This endpoint returns HTML pages instead of JSON for better user experience. Users see a professional verification success page with auto-redirect to the frontend website.

---

## 4. Contact Form Submission

### **POST** `/api/contact`

**Description:** Submit a contact form message and send email notification

#### Input Parameters
**Request Body (JSON):**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "message": "string (required)"
}
```

**Headers:**
```
Content-Type: application/json
```

#### Output Parameters
**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- **400 Bad Request** - Missing fields, invalid email format
- **500 Internal Server Error** - Email sending failed, server error

#### Example Request
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, I have a question about your service."
  }'
```

---

## 5. Google Authentication (Mock)

### **POST** `/api/auth/google`

**Description:** Authenticate user with Google OAuth token (currently mocked)

#### Input Parameters
**Request Body (JSON):**
```json
{
  "token": "string (required, Google OAuth token)"
}
```

**Headers:**
```
Content-Type: application/json
```

#### Output Parameters
**Success Response (200):**
```json
{
  "success": true,
  "role": "customer",
  "user": {
    "email": "user@gmail.com",
    "name": "Google User",
    "role": "customer"
  }
}
```

**Error Responses:**
- **400 Bad Request** - Google token missing
- **500 Internal Server Error** - Server error

#### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "google_oauth_token_here"
  }'
```

---

## 6. Google Signup (Mock)

### **POST** `/api/auth/google-signup`

**Description:** Register new user with Google OAuth token (currently mocked)

#### Input Parameters
**Request Body (JSON):**
```json
{
  "token": "string (required, Google OAuth token)"
}
```

**Headers:**
```
Content-Type: application/json
```

#### Output Parameters
**Success Response (200):**
```json
{
  "success": true,
  "role": "customer",
  "user": {
    "email": "newuser@gmail.com",
    "name": "New Google User",
    "role": "customer"
  }
}
```

**Error Responses:**
- **400 Bad Request** - Google token missing
- **500 Internal Server Error** - Server error

#### Example Request
```bash
curl -X POST http://localhost:5000/api/auth/google-signup \
  -H "Content-Type: application/json" \
  -d '{
    "token": "google_oauth_token_here"
  }'
```

---

## 7. Test Verification (Debug Endpoint)

### **GET** `/api/auth/test-verify/:email`

**Description:** Debug endpoint to check user verification status

#### Input Parameters
**URL Parameters:**
```
email: string (required, email address)
```

**Headers:**
```
None required
```

#### Output Parameters
**Success Response (200):**
```json
{
  "success": true,
  "message": "User found",
  "user": {
    "email": "string",
    "name": "string",
    "role": "string",
    "isVerified": boolean,
    "id": "string (MongoDB ObjectId)"
  }
}
```

**User Not Found Response (200):**
```json
{
  "success": false,
  "message": "User not found",
  "email": "string"
}
```

**Error Responses:**
- **500 Internal Server Error** - Server error

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/auth/test-verify/john@example.com"
```

---

## Common Response Patterns

### Success Response Structure
All successful API responses follow this pattern:
```json
{
  "success": true,
  "message": "string (optional)",
  "data": "object (optional, endpoint-specific)"
}
```

### Error Response Structure
All error responses follow this pattern:
```json
{
  "success": false,
  "error": "string (error message)"
}
```

### HTTP Status Codes
- **200 OK** - Request successful
- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Authentication failed
- **403 Forbidden** - Access denied (e.g., email not verified)
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Data Models

### User Model
```json
{
  "_id": "MongoDB ObjectId",
  "name": "string",
  "email": "string (lowercase)",
  "password": "string (plain text for now)",
  "role": "string (customer|admin|manager|worker)",
  "isVerified": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Contact Message Model
```json
{
  "_id": "MongoDB ObjectId",
  "name": "string",
  "email": "string",
  "message": "string",
  "createdAt": "Date"
}
```

---

## Notes for Frontend Teams

1. **Email Verification**: Users must verify their email before they can log in
2. **Verification Experience**: Email verification now shows a beautiful HTML page with auto-redirect to frontend
3. **Role-Based Access**: Different user roles (customer, admin, manager, worker) are supported
4. **CORS**: Backend is configured to accept requests from `localhost:3000`
5. **Error Handling**: Always check the `success` field in responses
6. **Google OAuth**: Currently mocked - will need real Google OAuth integration
7. **Password Security**: Passwords are currently stored in plain text (should be hashed in production)

---

## Email Template Parameters

### Verification Email Template
The backend sends these parameters to EmailJS for verification emails:
```json
{
  "verificationLink": "http://localhost:5000/api/auth/verify?email=user@example.com",
  "name": "User Name"
}
```

### Contact Form Email Template
The backend sends these parameters to EmailJS for contact form emails:
```json
{
  "message": "Contact form message content",
  "from_email": "sender@example.com",
  "to_email": "recipient@example.com"
}
```

---

## Testing Endpoints

You can test these endpoints using:
- **Postman** or **Insomnia** for API testing
- **cURL** commands (examples provided above)
- **Frontend application** at `http://localhost:3000`

The backend server runs on `http://localhost:5000` and includes detailed console logging for debugging. 