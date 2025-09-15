# Installation Guide

This guide provides step-by-step instructions for setting up the Basic API Building system with image compression and AWS S3 integration.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- AWS Account with S3 access
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd basic-apiBuilding
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `sharp` - Image processing and compression
- `aws-sdk` - AWS S3 integration
- `multer` - File upload handling
- `mongoose` - MongoDB integration
- `express` - Web framework
- And other essential packages

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/basic-api-building

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=3100
NODE_ENV=development

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Image Processing Configuration (Optional)
MAX_FILE_SIZE=10485760
COMPRESSION_QUALITY=90
MAX_IMAGE_WIDTH=1600
MAX_IMAGE_HEIGHT=1600
```

### 4. AWS S3 Setup

#### Create S3 Bucket
1. Log in to AWS Console
2. Navigate to S3 service
3. Create a new bucket with a unique name
4. Configure bucket permissions for public read access
5. Note the bucket name for your `.env` file

#### Configure IAM User
1. Create an IAM user with programmatic access
2. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name"
        }
    ]
}
```

3. Generate access keys and add them to your `.env` file

### 5. Database Setup

#### Start MongoDB
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Verify Connection
The application will automatically connect to MongoDB on startup.

### 6. Start the Application

```bash
npm start
```

The server will start on `http://localhost:3100`

### 7. Verify Installation

#### Health Check
```bash
curl http://localhost:3100/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-01T10:30:00.000Z",
  "uptime": 123.456
}
```

#### Test Image Upload
```bash
# Test with a sample image
curl -X POST http://localhost:3100/api/kyc/student/submit \
  -H "Authorization: Bearer <token>" \
  -F "aadharNumber=123456789012" \
  -F "aadharCardImage=@/path/to/test-image.jpg"
```

## Troubleshooting

### Common Issues

#### Sharp Installation Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### AWS S3 Access Denied
- Verify AWS credentials in `.env` file
- Check IAM user permissions
- Ensure S3 bucket exists and is accessible

#### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in `.env` file
- Ensure database permissions

#### Image Upload Failures
- Check file size limits (10MB maximum)
- Verify supported formats (JPEG, PNG, WebP)
- Ensure AWS S3 configuration is correct

### Performance Optimization

#### For Production
1. **Use PM2** for process management:
```bash
npm install -g pm2
pm2 start app.js --name "basic-api"
```

2. **Enable MongoDB indexing**:
```bash
# Connect to MongoDB and create indexes
db.students.createIndex({ "email": 1 })
db.societymembers.createIndex({ "email": 1 })
db.societymembers.createIndex({ "memberId": 1 })
```

3. **Configure AWS CloudFront** for faster image delivery

4. **Set up monitoring** with tools like New Relic or DataDog

## Development Setup

### Code Quality Tools
```bash
# Install ESLint and Prettier
npm install --save-dev eslint prettier

# Run linting
npm run lint

# Format code
npm run format
```

### Testing
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

## Security Considerations

### Production Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Enable monitoring and alerting

### Environment Variables Security
- Never commit `.env` files to version control
- Use environment-specific configuration
- Rotate AWS keys regularly
- Use IAM roles when possible

## Support

For additional help:
1. Check the [API Documentation](./api-endpoints.md)
2. Review [Error Handling](./error-handling.md)
3. Contact the development team
4. Check GitHub issues for known problems

## Conclusion

With this setup, you'll have a fully functional API system with:
- ✅ User authentication and authorization
- ✅ Society member management with auto-generated IDs
- ✅ KYC document processing
- ✅ Image compression and AWS S3 upload
- ✅ Comprehensive API documentation
- ✅ Error handling and validation

The system is ready for development and testing!
