# Thumbnail Management System API Documentation

## Overview

The Thumbnail Management System provides comprehensive image management capabilities for admins and public access to thumbnails. This system supports multiple image uploads, automatic thumbnail generation, categorization, and full CRUD operations.

## Table of Contents

1. [Admin APIs](#admin-apis)
2. [Public APIs](#public-apis)
3. [API Route Structure](#api-route-structure)
4. [Quick Reference - All Endpoints](#quick-reference---all-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

## Admin APIs

### 1. Upload Multiple Thumbnails

**Endpoint:** `POST /api/admin/thumbnails/upload`

**Description:** Upload multiple images with automatic thumbnail generation and categorization.

**Content-Type:** `multipart/form-data`

**Request Body:**
```
images: [File Array] (required) - Up to 10 images
category: String (optional) - gallery, banner, slider, event, announcement, society_photo, other
isPublic: Boolean (optional) - Default: true
isFeatured: Boolean (optional) - Default: false
tags: String (optional) - Comma-separated tags
```

**Response:**
```json
{
  "success": true,
  "message": "3 thumbnails uploaded successfully",
  "data": {
    "uploadedThumbnails": [
      {
        "thumbnailId": "THUMB2509001",
        "title": "society_event_1",
        "description": "Uploaded image: society_event_1.jpg",
        "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/society_event_1.jpg",
        "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_society_event_1.jpg",
        "fileName": "society_event_1.jpg",
        "fileSize": 2048576,
        "mimeType": "image/jpeg",
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "category": "event",
        "tags": ["society", "event", "celebration"],
        "status": "active",
        "isPublic": true,
        "isFeatured": false,
        "displayOrder": 0,
        "altText": "society_event_1.jpg",
        "uploadedBy": {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "totalUploaded": 3,
    "totalErrors": 0
  }
}
```

### 2. Get All Thumbnails (Admin)

**Endpoint:** `GET /api/admin/thumbnails`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `status` (optional): Filter by status (active, inactive, archived)
- `isPublic` (optional): Filter by public status
- `isFeatured` (optional): Filter by featured status
- `tags` (optional): Filter by tags (comma-separated)
- `search` (optional): Search in title, description, tags, altText

**Response:**
```json
{
  "success": true,
  "message": "Thumbnails retrieved successfully",
  "data": {
    "thumbnails": [
      {
        "thumbnailId": "THUMB2509001",
        "title": "Society Event",
        "description": "Annual society celebration",
        "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/event1.jpg",
        "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_event1.jpg",
        "fileName": "event1.jpg",
        "fileSize": 2048576,
        "mimeType": "image/jpeg",
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "category": "event",
        "tags": ["society", "event", "celebration"],
        "status": "active",
        "isPublic": true,
        "isFeatured": true,
        "displayOrder": 1,
        "altText": "Society annual event celebration",
        "uploadedBy": {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalThumbnails": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Thumbnail by ID (Admin)

**Endpoint:** `GET /api/admin/thumbnails/:thumbnailId`

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail retrieved successfully",
  "data": {
    "thumbnailId": "THUMB2509001",
    "title": "Society Event",
    "description": "Annual society celebration",
    "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/event1.jpg",
    "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_event1.jpg",
    "fileName": "event1.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "category": "event",
    "tags": ["society", "event", "celebration"],
    "status": "active",
    "isPublic": true,
    "isFeatured": true,
    "displayOrder": 1,
    "altText": "Society annual event celebration",
    "uploadedBy": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    },
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Thumbnail

**Endpoint:** `PUT /api/admin/thumbnails/:thumbnailId`

**Request Body:**
```json
{
  "title": "Updated Society Event",
  "description": "Updated description for the event",
  "category": "event",
  "status": "active",
  "isPublic": true,
  "isFeatured": true,
  "altText": "Updated alt text for accessibility",
  "tags": ["society", "event", "celebration", "updated"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail updated successfully",
  "data": {
    "thumbnailId": "THUMB2509001",
    "title": "Updated Society Event",
    "description": "Updated description for the event",
    "category": "event",
    "status": "active",
    "isPublic": true,
    "isFeatured": true,
    "altText": "Updated alt text for accessibility",
    "tags": ["society", "event", "celebration", "updated"],
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### 5. Delete Thumbnail

**Endpoint:** `DELETE /api/admin/thumbnails/:thumbnailId`

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail deleted successfully"
}
```

### 6. Bulk Delete Thumbnails

**Endpoint:** `DELETE /api/admin/thumbnails/bulk/delete`

**Request Body:**
```json
{
  "thumbnailIds": ["THUMB2509001", "THUMB2509002", "THUMB2509003"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 thumbnails deleted successfully",
  "data": {
    "deletedCount": 3,
    "deletedIds": ["THUMB2509001", "THUMB2509002", "THUMB2509003"]
  }
}
```

### 7. Update Display Order

**Endpoint:** `PATCH /api/admin/thumbnails/:thumbnailId/display-order`

**Request Body:**
```json
{
  "displayOrder": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Display order updated successfully",
  "data": {
    "thumbnailId": "THUMB2509001",
    "displayOrder": 5,
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### 8. Toggle Featured Status

**Endpoint:** `PATCH /api/admin/thumbnails/:thumbnailId/featured`

**Response:**
```json
{
  "success": true,
  "message": "Featured status updated successfully",
  "data": {
    "thumbnailId": "THUMB2509001",
    "isFeatured": true,
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### 9. Get Thumbnail Statistics

**Endpoint:** `GET /api/admin/thumbnails/statistics/overview`

**Query Parameters:**
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail statistics retrieved successfully",
  "data": {
    "categoryBreakdown": [
      {
        "category": "event",
        "status": "active",
        "count": 15,
        "totalSize": 31457280
      },
      {
        "category": "gallery",
        "status": "active",
        "count": 25,
        "totalSize": 52428800
      }
    ],
    "totalThumbnails": 40,
    "totalSize": 83886080
  }
}
```

### 10. Get Categories

**Endpoint:** `GET /api/admin/thumbnails/categories/list`

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": ["gallery", "banner", "slider", "event", "announcement", "society_photo", "other"],
    "categoryStats": [
      {
        "_id": "gallery",
        "count": 25
      },
      {
        "_id": "event",
        "count": 15
      }
    ]
  }
}
```

## Public APIs

### 1. Get Public Thumbnails

**Endpoint:** `GET /api/thumbnails`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category
- `isFeatured` (optional): Filter by featured status
- `tags` (optional): Filter by tags (comma-separated)
- `search` (optional): Search in title, description, tags, altText

**Response:**
```json
{
  "success": true,
  "message": "Public thumbnails retrieved successfully",
  "data": {
    "thumbnails": [
      {
        "thumbnailId": "THUMB2509001",
        "title": "Society Event",
        "description": "Annual society celebration",
        "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_event1.jpg",
        "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/event1.jpg",
        "category": "event",
        "tags": ["society", "event", "celebration"],
        "isFeatured": true,
        "displayOrder": 1,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalThumbnails": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Featured Thumbnails

**Endpoint:** `GET /api/thumbnails/featured`

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Number of featured thumbnails (default: 6)

**Response:**
```json
{
  "success": true,
  "message": "Featured thumbnails retrieved successfully",
  "data": [
    {
      "thumbnailId": "THUMB2509001",
      "title": "Society Event",
      "description": "Annual society celebration",
      "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_event1.jpg",
      "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/event1.jpg",
      "category": "event",
      "tags": ["society", "event", "celebration"],
      "displayOrder": 1,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Thumbnails by Category

**Endpoint:** `GET /api/thumbnails/category/:category`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `isFeatured` (optional): Filter by featured status

**Response:**
```json
{
  "success": true,
  "message": "Thumbnails for category 'event' retrieved successfully",
  "data": {
    "category": "event",
    "thumbnails": [
      {
        "thumbnailId": "THUMB2509001",
        "title": "Society Event",
        "description": "Annual society celebration",
        "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_event1.jpg",
        "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/event1.jpg",
        "category": "event",
        "tags": ["society", "event", "celebration"],
        "isFeatured": true,
        "displayOrder": 1,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalThumbnails": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 4. Get Thumbnail Details

**Endpoint:** `GET /api/thumbnails/:thumbnailId`

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail details retrieved successfully",
  "data": {
    "thumbnailId": "THUMB2509001",
    "title": "Society Event",
    "description": "Annual society celebration",
    "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/event1.jpg",
    "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_event1.jpg",
    "fileName": "event1.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "category": "event",
    "tags": ["society", "event", "celebration"],
    "status": "active",
    "isPublic": true,
    "isFeatured": true,
    "displayOrder": 1,
    "altText": "Society annual event celebration",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 5. Get Available Categories

**Endpoint:** `GET /api/thumbnails/categories/available`

**Response:**
```json
{
  "success": true,
  "message": "Available categories retrieved successfully",
  "data": [
    {
      "_id": "gallery",
      "count": 25,
      "featuredCount": 5
    },
    {
      "_id": "event",
      "count": 15,
      "featuredCount": 3
    }
  ]
}
```

### 6. Get Popular Tags

**Endpoint:** `GET /api/thumbnails/tags/popular`

**Query Parameters:**
- `limit` (optional): Number of popular tags (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Popular tags retrieved successfully",
  "data": [
    {
      "_id": "society",
      "count": 25
    },
    {
      "_id": "event",
      "count": 15
    },
    {
      "_id": "celebration",
      "count": 10
    }
  ]
}
```

### 7. Search Thumbnails

**Endpoint:** `GET /api/thumbnails/search/query`

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "query": "society event",
    "results": [
      {
        "thumbnailId": "THUMB2509001",
        "title": "Society Event",
        "description": "Annual society celebration",
        "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumbnails/thumbnails/thumb_event1.jpg",
        "originalImageUrl": "https://s3.amazonaws.com/bucket/thumbnails/original/event1.jpg",
        "category": "event",
        "tags": ["society", "event", "celebration"],
        "isFeatured": true,
        "displayOrder": 1,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalResults": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## API Route Structure

### Admin Routes
- **Base Path:** `/api/admin/thumbnails`
- **Authentication:** Required (JWT token)
- **Authorization:** admin role

### Public Routes
- **Base Path:** `/api/thumbnails`
- **Authentication:** Not required
- **Access:** Public (only active and public thumbnails)

## Quick Reference - All Endpoints

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/thumbnails/upload` | Upload multiple thumbnails |
| GET | `/api/admin/thumbnails` | Get all thumbnails with filters |
| GET | `/api/admin/thumbnails/:thumbnailId` | Get thumbnail by ID |
| PUT | `/api/admin/thumbnails/:thumbnailId` | Update thumbnail |
| DELETE | `/api/admin/thumbnails/:thumbnailId` | Delete thumbnail |
| DELETE | `/api/admin/thumbnails/bulk/delete` | Bulk delete thumbnails |
| PATCH | `/api/admin/thumbnails/:thumbnailId/display-order` | Update display order |
| PATCH | `/api/admin/thumbnails/:thumbnailId/featured` | Toggle featured status |
| GET | `/api/admin/thumbnails/statistics/overview` | Get statistics |
| GET | `/api/admin/thumbnails/categories/list` | Get categories |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/thumbnails` | Get public thumbnails |
| GET | `/api/thumbnails/featured` | Get featured thumbnails |
| GET | `/api/thumbnails/category/:category` | Get thumbnails by category |
| GET | `/api/thumbnails/:thumbnailId` | Get thumbnail details |
| GET | `/api/thumbnails/categories/available` | Get available categories |
| GET | `/api/thumbnails/tags/popular` | Get popular tags |
| GET | `/api/thumbnails/search/query` | Search thumbnails |

## Data Models

### Thumbnail Model
```javascript
{
  thumbnailId: String, // THUMB2509001
  title: String,
  description: String,
  originalImageUrl: String,
  thumbnailUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  dimensions: {
    width: Number,
    height: Number
  },
  category: String, // gallery, banner, slider, event, announcement, society_photo, other
  tags: [String],
  status: String, // active, inactive, archived
  isPublic: Boolean,
  isFeatured: Boolean,
  displayOrder: Number,
  altText: String,
  uploadedBy: ObjectId, // Admin reference
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "category",
      "message": "Invalid category"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Thumbnail not found"
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Access denied. Invalid token."
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

## Examples

### Upload Multiple Images
```bash
curl -X POST http://localhost:3000/api/admin/thumbnails/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg" \
  -F "category=event" \
  -F "isPublic=true" \
  -F "isFeatured=false" \
  -F "tags=society,event,celebration"
```

### Get Public Thumbnails
```bash
curl -X GET "http://localhost:3000/api/thumbnails?category=event&isFeatured=true&page=1&limit=12"
```

### Search Thumbnails
```bash
curl -X GET "http://localhost:3000/api/thumbnails/search/query?q=society%20event&page=1&limit=12"
```

### Update Thumbnail
```bash
curl -X PUT http://localhost:3000/api/admin/thumbnails/THUMB2509001 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Society Event",
    "description": "Updated description",
    "isFeatured": true,
    "tags": ["society", "event", "celebration", "updated"]
  }'
```

### Bulk Delete
```bash
curl -X DELETE http://localhost:3000/api/admin/thumbnails/bulk/delete \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "thumbnailIds": ["THUMB2509001", "THUMB2509002", "THUMB2509003"]
  }'
```

## Route Registration Status

✅ **All routes are properly registered in app.js:**
- `/api/admin/thumbnails` → Admin Thumbnail Management APIs
- `/api/thumbnails` → Public Thumbnail APIs

## Summary

The Thumbnail Management System provides:

1. **Multiple Image Upload**: Upload up to 10 images at once
2. **Automatic Thumbnail Generation**: Creates 300x300 thumbnails automatically
3. **Categorization**: Organize images by categories (gallery, banner, slider, event, etc.)
4. **Tagging System**: Add tags for better organization and search
5. **Featured Images**: Mark important images as featured
6. **Display Order**: Control the order of image display
7. **Public/Private Access**: Control image visibility
8. **Search Functionality**: Search by title, description, tags, alt text
9. **Bulk Operations**: Delete multiple images at once
10. **Statistics**: Track image usage and storage
11. **S3 Integration**: Automatic file upload and deletion
12. **Image Processing**: Automatic resizing and optimization

The system is fully integrated with AWS S3 for file storage and provides comprehensive admin management with public access APIs for frontend applications.
