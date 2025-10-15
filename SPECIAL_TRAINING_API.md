# Special Training API Documentation

## Overview

The Special Training API provides comprehensive endpoints for managing special technical training sessions with support for draft saving, dynamic key points management, certification tracking, and permit requirements.

## Base URL

```
/api/special-training
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Special Training

**POST** `/api/special-training`

Creates a new special training record with full details.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "special_training",
  "date": "2025-01-15T10:00:00.000Z",
  "topic": "Advanced Scaffolding Techniques",
  "duration": 120,
  "trainer": "John Smith",
  "attendeesCount": 15,
  "keyPoints": [
    "Advanced scaffolding assembly techniques",
    "Safety protocols for high-rise scaffolding",
    "Load calculation and weight distribution",
    "Inspection and maintenance procedures"
  ],
  "certificationsIssued": true,
  "permitRequired": true,
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "completed"
}
```

**Response:**

```json
{
  "message": "Special training submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "special_training",
    "date": "2025-01-15T10:00:00.000Z",
    "topic": "Advanced Scaffolding Techniques",
    "duration": 120,
    "trainer": "John Smith",
    "attendeesCount": 15,
    "keyPoints": [
      "Advanced scaffolding assembly techniques",
      "Safety protocols for high-rise scaffolding",
      "Load calculation and weight distribution",
      "Inspection and maintenance procedures"
    ],
    "certificationsIssued": true,
    "permitRequired": true,
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "completed",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "status": "completed"
}
```

**Draft Response:**

```json
{
  "message": "Special training saved as draft",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  },
  "status": "draft"
}
```

### 2. Save Draft Special Training

**POST** `/api/special-training/save-draft`

Saves a special training as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "date": "2025-01-15T10:00:00.000Z",
  "topic": "Advanced Scaffolding Techniques",
  "duration": 120,
  "trainer": "John Smith",
  "attendeesCount": 15,
  "keyPoints": [],
  "certificationsIssued": false,
  "permitRequired": false,
  "photos": []
}
```

**Response:**

```json
{
  "message": "Special training saved as draft",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "date": "2025-01-15T10:00:00.000Z",
    "topic": "Advanced Scaffolding Techniques",
    "duration": 120,
    "trainer": "John Smith",
    "attendeesCount": 15,
    "keyPoints": [],
    "certificationsIssued": false,
    "permitRequired": false,
    "photos": [],
    "status": "draft",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 3. Get All Special Trainings

**GET** `/api/special-training`

Retrieves all special training records with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `topic` (optional): Filter by topic (partial match)
- `trainer` (optional): Filter by trainer name (partial match)
- `status` (optional): Filter by status (default: "completed")
- `certificationsIssued` (optional): Filter by certification status (true/false)
- `permitRequired` (optional): Filter by permit requirement (true/false)
- `sortBy` (optional): Sort field (default: "date")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "module": "special_training",
      "date": "2025-01-15T10:00:00.000Z",
      "topic": "Advanced Scaffolding Techniques",
      "duration": 120,
      "trainer": "John Smith",
      "attendeesCount": 15,
      "keyPoints": [
        "Advanced scaffolding assembly techniques",
        "Safety protocols for high-rise scaffolding"
      ],
      "certificationsIssued": true,
      "permitRequired": true,
      "photos": ["cloudinary-url-1"],
      "status": "completed",
      "createdBy": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "employeeId": "EMP123"
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 4. Get Special Training by ID

**GET** `/api/special-training/:id`

Retrieves a specific special training record.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "special_training",
    "date": "2025-01-15T10:00:00.000Z",
    "topic": "Advanced Scaffolding Techniques",
    "duration": 120,
    "trainer": "John Smith",
    "attendeesCount": 15,
    "keyPoints": [
      "Advanced scaffolding assembly techniques",
      "Safety protocols for high-rise scaffolding"
    ],
    "certificationsIssued": true,
    "permitRequired": true,
    "photos": ["cloudinary-url-1"],
    "status": "completed",
    "createdBy": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "employeeId": "EMP123"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 5. Update Special Training

**PUT** `/api/special-training/:id`

Updates an existing special training record.

**Request Body:**

```json
{
  "status": "completed",
  "duration": 150,
  "attendeesCount": 20,
  "topic": "Updated Topic",
  "trainer": "Jane Doe",
  "keyPoints": ["Updated key point 1", "Updated key point 2"],
  "certificationsIssued": true,
  "permitRequired": false
}
```

**Response:**

```json
{
  "message": "Special training updated successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "topic": "Updated Topic",
    "duration": 150,
    "trainer": "Jane Doe",
    "attendeesCount": 20,
    "keyPoints": ["Updated key point 1", "Updated key point 2"],
    "certificationsIssued": true,
    "permitRequired": false,
    "status": "completed",
    "updatedBy": "user-id",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### 6. Delete Special Training

**DELETE** `/api/special-training/:id`

Deletes a special training record. Only admins or the creator can delete records.

**Response:**

```json
{
  "message": "Special training deleted successfully"
}
```

### 7. Get Special Training Statistics

**GET** `/api/special-training/stats/overview`

Retrieves comprehensive special training statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 200,
    "draft": 25,
    "scheduled": 15,
    "completed": 150,
    "cancelled": 10,
    "totalAttendees": 3000,
    "totalDuration": 18000,
    "avgDuration": 90,
    "totalKeyPoints": 800,
    "certificationTrainings": 120,
    "permitRequiredTrainings": 80
  }
}
```

### 8. Get Popular Topics

**GET** `/api/special-training/topics/popular`

Retrieves most popular special training topics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `limit` (optional): Number of topics to return (default: 10)

**Response:**

```json
{
  "data": [
    {
      "_id": "Advanced Scaffolding Techniques",
      "count": 30,
      "totalAttendees": 450,
      "avgDuration": 120,
      "certificationRate": 0.8,
      "permitRequiredRate": 0.9
    },
    {
      "_id": "Crane Operation Safety",
      "count": 25,
      "totalAttendees": 375,
      "avgDuration": 90,
      "certificationRate": 0.9,
      "permitRequiredRate": 1.0
    }
  ]
}
```

### 9. Get Certification Summary

**GET** `/api/special-training/certifications/summary`

Retrieves certification training summary.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "totalCertificationTrainings": 120,
    "totalCertifiedAttendees": 1800,
    "avgCertificationDuration": 95,
    "topics": [
      "Advanced Scaffolding Techniques",
      "Crane Operation Safety",
      "Electrical Safety Training"
    ]
  }
}
```

## Data Models

### Special Training Status

- `draft`: Training saved but not yet completed
- `scheduled`: Training is scheduled for future
- `completed`: Training has been conducted
- `cancelled`: Training was cancelled

### Key Points

- Array of strings containing key points covered in the training
- At least one key point is required for non-draft status
- Empty key points are automatically filtered out

### Certifications & Permits

- `certificationsIssued`: Boolean indicating if certificates were issued
- `permitRequired`: Boolean indicating if a permit is required for this training

### Photos

- Array of Cloudinary URLs
- Optional for all statuses
- Used for documentation and evidence

## Validation Rules

### Required Fields (All Statuses)

- `projectId`: String, not empty
- `date`: Valid ISO8601 date
- `topic`: String, not empty
- `duration`: Integer, minimum 1 minute
- `trainer`: String, not empty
- `attendeesCount`: Integer, minimum 0

### Conditional Validation

- `keyPoints`: At least one non-empty key point required for non-draft status
- `date`: Cannot be in future for completed trainings

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Topic is required",
      "param": "topic",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "Special training not found"
}
```

### 403 Forbidden

```json
{
  "message": "Not authorized to delete this special training record"
}
```

### 500 Internal Server Error

```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Frontend Integration

### Form Structure Mapping

Your frontend form fields map perfectly to the API:

- `date` → `date` (Date field)
- `topic` → `topic` (String field)
- `duration` → `duration` (Number field)
- `trainer` → `trainer` (String field)
- `attendeesCount` → `attendeesCount` (Number field)
- `keyPoints` → `keyPoints` (Array of strings)
- `certificationsIssued` → `certificationsIssued` (Boolean field)
- `permitRequired` → `permitRequired` (Boolean field)
- `photos` → `photos` (Array of Cloudinary URLs)

### Usage Examples

#### Save Draft

```javascript
// Use /save-draft endpoint for "Save Draft" button
const saveDraft = async (formData) => {
  const response = await fetch("/api/special-training/save-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      date: formData.date,
      topic: formData.topic,
      duration: parseInt(formData.duration),
      trainer: formData.trainer,
      attendeesCount: parseInt(formData.attendeesCount),
      keyPoints: formData.keyPoints.filter((kp) => kp.trim() !== ""),
      certificationsIssued: formData.certificationsIssued,
      permitRequired: formData.permitRequired,
      photos: formData.photos,
    }),
  });
};
```

#### Submit Complete

```javascript
// Use main POST endpoint for "Submit" button
const submitSpecialTraining = async (formData) => {
  const response = await fetch("/api/special-training", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      date: formData.date,
      topic: formData.topic,
      duration: parseInt(formData.duration),
      trainer: formData.trainer,
      attendeesCount: parseInt(formData.attendeesCount),
      keyPoints: formData.keyPoints.filter((kp) => kp.trim() !== ""),
      certificationsIssued: formData.certificationsIssued,
      permitRequired: formData.permitRequired,
      photos: formData.photos,
      status: "completed",
    }),
  });
};
```

## Notes

- The API automatically filters out empty key points
- Status is determined based on completeness (draft if no key points, completed if has key points)
- All timestamps are in ISO8601 format
- Photos should be uploaded to Cloudinary and URLs provided
- The API supports both draft saving and full submission workflows
- Certification and permit tracking provides additional insights for compliance
