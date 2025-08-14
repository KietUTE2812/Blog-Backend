# Personal Blog Backend API

Một RESTful API backend cho blog cá nhân được xây dựng bằng Node.js, Express và MongoDB.

## Tính năng

### 🔐 Authentication & Authorization
- Đăng ký và đăng nhập người dùng
- JWT token authentication
- Role-based access control (User/Admin)
- Password hashing với bcrypt

### 📝 Quản lý bài viết
- CRUD operations cho bài viết
- Hỗ trợ draft, published, archived status
- SEO optimization (meta title, description)
- Featured posts
- Categories và tags
- Search functionality
- Pagination
- View count tracking

### 👥 Quản lý người dùng
- User profiles với avatar và bio
- User statistics
- Admin user management

### 💬 Hệ thống bình luận
- Nested comments (replies)
- Comment approval system
- Like/unlike comments
- Spam detection
- Comment moderation

### 🛡️ Security & Performance
- Input validation với express-validator
- Rate limiting
- CORS support
- Helmet security headers
- Error handling middleware
- MongoDB indexing

## Cài đặt

### Yêu cầu hệ thống
- Node.js (v14 trở lên)
- MongoDB (v4.4 trở lên)
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd personal-blog-backend
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình môi trường
```bash
# Copy file env.example thành .env
cp env.example .env

# Chỉnh sửa file .env với thông tin của bạn
```

### Bước 4: Khởi động MongoDB
Đảm bảo MongoDB đang chạy trên máy của bạn hoặc sử dụng MongoDB Atlas.

### Bước 5: Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Cấu hình Environment Variables

Tạo file `.env` với các biến sau:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/personal-blog

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Posts
- `GET /api/posts` - Lấy danh sách bài viết
- `GET /api/posts/:slug` - Lấy bài viết theo slug
- `POST /api/posts` - Tạo bài viết mới
- `PUT /api/posts/:id` - Cập nhật bài viết
- `DELETE /api/posts/:id` - Xóa bài viết
- `GET /api/posts/author/:username` - Lấy bài viết theo tác giả
- `GET /api/posts/categories/list` - Lấy danh sách categories
- `GET /api/posts/tags/list` - Lấy danh sách tags

### Users
- `GET /api/users` - Lấy danh sách users (admin only)
- `GET /api/users/:username` - Lấy thông tin user
- `GET /api/users/:username/posts` - Lấy bài viết của user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (admin only)
- `GET /api/users/:id/stats` - Lấy thống kê user

### Comments
- `GET /api/comments/post/:postId` - Lấy comments của bài viết
- `POST /api/comments` - Tạo comment mới
- `PUT /api/comments/:id` - Cập nhật comment
- `DELETE /api/comments/:id` - Xóa comment
- `POST /api/comments/:id/like` - Like/unlike comment
- `PUT /api/comments/:id/approve` - Duyệt comment (admin only)
- `GET /api/comments/user/:userId` - Lấy comments của user
- `GET /api/comments/admin/pending` - Lấy pending comments (admin only)

## Cấu trúc Database

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  bio: String,
  avatar: String,
  role: String (enum: ['user', 'admin']),
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Post Schema
```javascript
{
  title: String (required),
  slug: String (unique, required),
  content: String (required),
  excerpt: String,
  featuredImage: String,
  author: ObjectId (ref: User),
  tags: [String],
  category: String (required),
  status: String (enum: ['draft', 'published', 'archived']),
  isFeatured: Boolean,
  viewCount: Number,
  likeCount: Number,
  commentCount: Number,
  publishedAt: Date,
  seoTitle: String,
  seoDescription: String,
  timestamps: true
}
```

### Comment Schema
```javascript
{
  content: String (required),
  author: ObjectId (ref: User),
  post: ObjectId (ref: Post),
  parentComment: ObjectId (ref: Comment),
  replies: [ObjectId],
  likes: [ObjectId],
  likeCount: Number,
  isApproved: Boolean,
  isSpam: Boolean,
  ipAddress: String,
  userAgent: String,
  timestamps: true
}
```

## Middleware

### Authentication Middleware
- `auth` - Yêu cầu JWT token hợp lệ
- `adminAuth` - Yêu cầu quyền admin
- `optionalAuth` - Tùy chọn authentication

### Validation Middleware
- `validate` - Validate request data với express-validator
- `handleAsync` - Xử lý async errors

## Security Features

- Password hashing với bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- CORS configuration
- Helmet security headers
- MongoDB injection protection

## Performance Features

- MongoDB indexing
- Pagination
- Efficient queries với populate
- Rate limiting
- Response compression

## Development

### Scripts
```bash
npm run dev      # Chạy với nodemon
npm start        # Chạy production
npm test         # Chạy tests
```

### Testing
```bash
npm test
```

## Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Cấu hình MongoDB production URI
3. Thay đổi JWT_SECRET
4. Cấu hình CORS origins
5. Setup logging
6. Configure rate limiting
7. Setup monitoring

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub. 