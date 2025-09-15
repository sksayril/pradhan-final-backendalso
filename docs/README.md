# API Documentation

This folder contains comprehensive documentation for the Basic API Building authentication system.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [API Endpoints](./api-endpoints.md)
3. [Authentication](./authentication.md)
4. [Society Member Management](./society-member-management.md)
5. [KYC Endpoints](./kyc-endpoints.md)
6. [Image Upload & Compression](./image-upload-compression.md)
7. [User Management Endpoints](./user-management-endpoints.md)
8. [Error Handling](./error-handling.md)
9. [Examples](./examples.md)
10. [Testing](./testing.md)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=mongodb://localhost:27017/basic-api-building
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   PORT=3000
   NODE_ENV=development
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Test the API**
   ```bash
   curl http://localhost:3000/health
   ```

## API Base URL

```
http://localhost:3000/api
```

## User Types

- **Admin**: System administrators with full access
- **Student**: Regular students with limited access (auto-generated student IDs)
- **Society Member**: Society/club members with specific permissions (auto-generated Member IDs in format YYYYMMXXX)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

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

## KYC System

The system includes a comprehensive KYC (Know Your Customer) verification system:

- **Student KYC**: Aadhar number and Aadhar card image
- **Society Member KYC**: Aadhar number, PAN number, Aadhar card image, and PAN card image
- **Admin Approval**: Admins can approve or reject KYC submissions
- **File Upload**: Secure image upload with validation
- **Status Tracking**: Real-time KYC status updates

## Image Upload & Compression

Advanced image processing system for KYC document uploads:

- **Automatic Compression**: 60-80% file size reduction
- **AWS S3 Integration**: Secure cloud storage
- **Format Optimization**: All images converted to optimized JPEG
- **Quality Preservation**: Maintains document clarity
- **Metadata Removal**: Privacy protection
- **Error Handling**: Comprehensive validation and cleanup

## Society Member Features

- **Auto-generated Member IDs**: Format YYYYMMXXX (e.g., 202511001, 202511002)
- **Role-based Positions**: President, Vice-President, Secretary, Treasurer, Member, Coordinator, Volunteer
- **Enhanced KYC**: Additional PAN verification for society members
- **Admin Management**: Comprehensive admin tools for member oversight
- **Self-service Portal**: Members can manage their own profiles and KYC

## Next Steps

- Read [Getting Started](./getting-started.md) for detailed setup instructions
- Check [API Endpoints](./api-endpoints.md) for complete endpoint documentation
- Review [Society Member Management](./society-member-management.md) for society member functionality
- Review [KYC Endpoints](./kyc-endpoints.md) for KYC functionality
- Review [Image Upload & Compression](./image-upload-compression.md) for image processing features
- Review [Examples](./examples.md) for practical usage examples
