# Getting Started

This guide will help you set up and start using the Basic API Building authentication system.

## Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd basic-apiBuilding
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

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

# AWS Configuration
AWS_ACCESS_KEY_ID=AKIA45SPDOFAN2M3TJUK
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=notes-market-bucket
```

**Important**: 
- Change the `JWT_SECRET` to a strong, unique secret key in production
- Ensure your AWS credentials have proper S3 permissions
- Make sure the S3 bucket exists and is accessible

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if installed locally)
mongod

# Or use MongoDB Atlas cloud database
# Update DATABASE_URL in .env file with your Atlas connection string
```

### 5. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Verification

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. API Documentation

```bash
curl http://localhost:3000/
```

This will return the API documentation with all available endpoints.

## Project Structure

```
├── controllers/          # Route controllers
│   └── authController.js
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── validation.js   # Input validation
│   └── security.js     # Security middleware
├── models/             # Database models
│   ├── admin.model.js
│   ├── student.model.js
│   └── societyMember.model.js
├── routes/             # API routes
│   ├── admin.js
│   ├── student.js
│   ├── societyMember.js
│   ├── users.js
│   └── index.js
├── utilities/          # Database connection
│   └── database.js
├── docs/              # API documentation
├── app.js             # Main application file
└── package.json       # Dependencies
```

## Development

### Available Scripts

```bash
npm start          # Start the server with nodemon
npm run dev        # Start in development mode (if configured)
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRE` | JWT token expiration time | 7d | No |
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | - | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | - | Yes |
| `AWS_REGION` | AWS Region | - | Yes |
| `AWS_S3_BUCKET_NAME` | S3 Bucket Name | - | Yes |

## Next Steps

1. **Create Your First User**: Try the signup endpoints
2. **Test Authentication**: Use the login endpoints
3. **Explore Protected Routes**: Test endpoints that require authentication
4. **Read API Documentation**: Check the [API Endpoints](./api-endpoints.md) guide

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MongoDB is running
   - Check the DATABASE_URL in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change the PORT in .env file
   - Kill the process using the port: `lsof -ti:3000 | xargs kill`

3. **JWT Secret Not Set**
   - Add JWT_SECRET to .env file
   - Use a strong, random secret key

4. **Validation Errors**
   - Check the request body format
   - Ensure all required fields are provided
   - Verify data types match the expected format

### Getting Help

- Check the [Error Handling](./error-handling.md) guide
- Review the [Examples](./examples.md) for common use cases
- Test with the provided [Testing](./testing.md) examples
