# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "bio": "Software Developer"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "Software Developer",
    "avatar": "",
    "role": "user"
  }
}
```

### Login
```http
POST /auth/login
```

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "Software Developer",
    "avatar": "",
    "role": "user"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

## Posts

### Get All Posts
```http
GET /posts?page=1&limit=10&category=technology&tag=javascript&search=react&featured=true
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `category` (optional): Filter by category
- `tag` (optional): Filter by tag
- `search` (optional): Search in title and content
- `featured` (optional): Filter featured posts (true/false)
- `sort` (optional): Sort order (-publishedAt, -viewCount, etc.)

**Response:**
```json
{
  "posts": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Getting Started with React",
      "slug": "getting-started-with-react",
      "excerpt": "Learn the basics of React...",
      "content": "React is a JavaScript library...",
      "author": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": ""
      },
      "category": "technology",
      "tags": ["react", "javascript", "frontend"],
      "status": "published",
      "isFeatured": false,
      "viewCount": 150,
      "likeCount": 25,
      "commentCount": 8,
      "publishedAt": "2023-01-15T10:30:00.000Z",
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Single Post
```http
GET /posts/getting-started-with-react
```

### Create Post
```http
POST /posts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Blog Post",
  "content": "This is the content of my blog post...",
  "excerpt": "A brief summary of the post",
  "category": "technology",
  "tags": ["javascript", "nodejs"],
  "status": "draft",
  "isFeatured": false,
  "featuredImage": "https://example.com/image.jpg",
  "seoTitle": "SEO Optimized Title",
  "seoDescription": "SEO description for search engines"
}
```

### Update Post
```http
PUT /posts/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

### Delete Post
```http
DELETE /posts/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

### Get Posts by Author
```http
GET /posts/author/johndoe?page=1&limit=10
```

### Get Categories
```http
GET /posts/categories/list
```

### Get Tags
```http
GET /posts/tags/list
```

## Users

### Get User Profile
```http
GET /users/johndoe
```

**Response:**
```json
{
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "Software Developer",
    "avatar": "",
    "role": "user",
    "postsCount": 15,
    "totalPostsCount": 20,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get User's Posts
```http
GET /users/johndoe/posts?page=1&limit=10&status=published
```

### Update User Profile
```http
PUT /users/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "bio": "Updated bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Get User Statistics (Admin or Self)
```http
GET /users/60f7b3b3b3b3b3b3b3b3b3b3/stats
Authorization: Bearer <token>
```

## Comments

### Get Comments for Post
```http
GET /comments/post/60f7b3b3b3b3b3b3b3b3b3b3?page=1&limit=10&sort=newest
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sort` (optional): Sort order (newest, oldest, mostLiked)

**Response:**
```json
{
  "comments": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "content": "Great article!",
      "author": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": ""
      },
      "post": "60f7b3b3b3b3b3b3b3b3b3b3",
      "parentComment": null,
      "replies": [
        {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
          "content": "I agree!",
          "author": {
            "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
            "username": "janedoe",
            "fullName": "Jane Doe",
            "avatar": ""
          }
        }
      ],
      "likeCount": 5,
      "isApproved": true,
      "createdAt": "2023-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Create Comment
```http
POST /comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "This is my comment",
  "postId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "parentCommentId": "60f7b3b3b3b3b3b3b3b3b3b3" // optional, for replies
}
```

### Update Comment
```http
PUT /comments/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

### Delete Comment
```http
DELETE /comments/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <token>
```

### Like/Unlike Comment
```http
POST /comments/60f7b3b3b3b3b3b3b3b3b3b3/like
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Comment liked",
  "likeCount": 6,
  "isLiked": true
}
```

### Approve/Reject Comment (Admin Only)
```http
PUT /comments/60f7b3b3b3b3b3b3b3b3b3b3/approve
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isApproved": true,
  "isSpam": false
}
```

### Get User's Comments
```http
GET /comments/user/60f7b3b3b3b3b3b3b3b3b3b3?page=1&limit=10
Authorization: Bearer <token>
```

### Get Pending Comments (Admin Only)
```http
GET /comments/admin/pending?page=1&limit=10
Authorization: Bearer <token>
```

## Error Responses

### Validation Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Error
```json
{
  "message": "Access denied. No token provided."
}
```

### Authorization Error
```json
{
  "message": "Not authorized to update this post"
}
```

### Not Found Error
```json
{
  "message": "Post not found"
}
```

### Server Error
```json
{
  "message": "Something went wrong!",
  "error": "Error details (only in development)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address. When exceeded:

```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

## Headers

### Authentication
```
Authorization: Bearer <jwt_token>
```

### Content Type
```
Content-Type: application/json
```

## Pagination

All list endpoints support pagination with the following response structure:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
``` 