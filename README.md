# Basic API Building - Authentication System

A comprehensive Node.js/Express.js API with role-based authentication system supporting Admin, Student, and Society Member user types.

## Features

- 🔐 **Role-based Authentication** - Admin, Student, and Society Member roles
- 🛡️ **Security** - JWT tokens, bcrypt password hashing, rate limiting, input validation
- 📝 **Input Validation** - Comprehensive validation using Joi
- 🚀 **Performance** - Optimized queries with proper indexing
- 📊 **Logging** - Request logging and error handling
- 🔒 **CORS & Security Headers** - Production-ready security configurations

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: Joi, validator
- **Development**: nodemon, dotenv

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd basic-apiBuilding
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/basic-api-building

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Start the server**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Admin Endpoints

#### Signup
```http
POST /api/admin/signup
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "permissions": ["user-management", "content-management"]
}
```

#### Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123"
}
```

#### Profile
```http
GET /api/admin/profile
Authorization: Bearer <token>
```

#### Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

### Student Endpoints

#### Signup
```http
POST /api/student/signup
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Student123",
  "firstName": "Jane",
  "lastName": "Smith",
  "studentId": "STU001",
  "department": "Computer Science",
  "year": "3rd",
  "phoneNumber": "+1234567890",
  "interests": ["Programming", "Web Development"]
}
```

#### Login
```http
POST /api/student/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Student123"
}
```

#### Profile
```http
GET /api/student/profile
Authorization: Bearer <token>
```

#### Dashboard
```http
GET /api/student/dashboard
Authorization: Bearer <token>
```

### Society Member Endpoints

#### Signup
```http
POST /api/society-member/signup
Content-Type: application/json

{
  "email": "member@example.com",
  "password": "Member123",
  "firstName": "Bob",
  "lastName": "Johnson",
  "memberId": "MEM001",
  "societyName": "Tech Society",
  "position": "President",
  "department": "Computer Science",
  "skills": ["Leadership", "Event Management"],
  "responsibilities": ["Organize events", "Manage members"]
}
```

#### Login
```http
POST /api/society-member/login
Content-Type: application/json

{
  "email": "member@example.com",
  "password": "Member123"
}
```

#### Profile
```http
GET /api/society-member/profile
Authorization: Bearer <token>
```

#### Dashboard
```http
GET /api/society-member/dashboard
Authorization: Bearer <token>
```

## Authentication

### JWT Token
All protected routes require a JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### Token Structure
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "userType": "admin|student|societyMember",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Security Features

### Rate Limiting
- **Authentication endpoints**: 5 attempts per 15 minutes
- **General endpoints**: 100 requests per 15 minutes

### Password Requirements
- Minimum 6 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

### Input Validation
- Email format validation
- Phone number validation
- XSS protection
- SQL injection prevention

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Database Models

### Admin Model
- email (unique)
- password (hashed)
- firstName, lastName
- role (super-admin, admin, moderator)
- permissions array
- isActive boolean

### Student Model
- email (unique)
- password (hashed)
- firstName, lastName
- studentId (unique)
- department, year
- phoneNumber, dateOfBirth
- address object
- interests array

### Society Member Model
- email (unique)
- password (hashed)
- firstName, lastName
- memberId (unique)
- societyName, position
- department
- phoneNumber, dateOfBirth
- address object
- skills, responsibilities arrays

## Development

### Project Structure
```
├── controllers/          # Route controllers
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── validation.js   # Input validation
│   └── security.js     # Security middleware
├── models/             # Database models
├── routes/             # API routes
├── utilities/          # Database connection
├── app.js             # Main application file
└── package.json       # Dependencies
```

### Adding New Features
1. Create model in `models/` directory
2. Add validation schema in `middleware/validation.js`
3. Create controller in `controllers/` directory
4. Define routes in `routes/` directory
5. Update main app.js with new routes

## Testing

### Manual Testing
Use tools like Postman or curl to test the endpoints:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test admin signup
curl -X POST http://localhost:3000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123","firstName":"Test","lastName":"Admin"}'
```

## Production Deployment

### Environment Variables
Ensure all environment variables are properly set:
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Strong secret key for JWT signing
- `NODE_ENV`: Set to "production"

### Security Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up proper logging
- [ ] Database connection security

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions, please open an issue in the repository.