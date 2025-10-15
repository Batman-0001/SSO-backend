# PEP Talk API Documentation

## Overview

The PEP Talk API provides comprehensive endpoints for managing PEP (Pre-employment Preparation) Talk sessions with support for draft saving, dynamic key points management, and comprehensive statistics.

## Base URL

```
/api/pep-talk
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create PEP Talk

**POST** `/api/pep-talk`

Creates a new PEP talk record with full details.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "pep_talk",
  "date": "2025-01-15T10:00:00.000Z",
  "topic": "Environmental Protection and Energy Conservation",
  "duration": 45,
  "trainer": "John Smith",
  "attendeesCount": 25,
  "keyPoints": [
    "Importance of environmental protection",
    "Energy conservation techniques",
    "Waste reduction strategies",
    "Sustainable practices"
  ],
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "completed"
}
```

**Response:**

```json
{
  "message": "PEP talk submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "pep_talk",
    "date": "2025-01-15T10:00:00.000Z",
    "topic": "Environmental Protection and Energy Conservation",
    "duration": 45,
    "trainer": "John Smith",
    "attendeesCount": 25,
    "keyPoints": [
      "Importance of environmental protection",
      "Energy conservation techniques",
      "Waste reduction strategies",
      "Sustainable practices"
    ],
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
  "message": "PEP talk saved as draft",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  },
  "status": "draft"
}
```

### 2. Save Draft PEP Talk

**POST** `/api/pep-talk/save-draft`

Saves a PEP talk as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "date": "2025-01-15T10:00:00.000Z",
  "topic": "Environmental Protection",
  "duration": 45,
  "trainer": "John Smith",
  "attendeesCount": 25,
  "keyPoints": [],
  "photos": []
}
```

**Response:**

```json
{
  "message": "PEP talk saved as draft",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "date": "2025-01-15T10:00:00.000Z",
    "topic": "Environmental Protection",
    "duration": 45,
    "trainer": "John Smith",
    "attendeesCount": 25,
    "keyPoints": [],
    "photos": [],
    "status": "draft",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 3. Get All PEP Talks

**GET** `/api/pep-talk`

Retrieves all PEP talk records with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `topic` (optional): Filter by topic (partial match)
- `trainer` (optional): Filter by trainer name (partial match)
- `status` (optional): Filter by status (default: "completed")
- `sortBy` (optional): Sort field (default: "date")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "module": "pep_talk",
      "date": "2025-01-15T10:00:00.000Z",
      "topic": "Environmental Protection and Energy Conservation",
      "duration": 45,
      "trainer": "John Smith",
      "attendeesCount": 25,
      "keyPoints": [
        "Importance of environmental protection",
        "Energy conservation techniques"
      ],
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

### 4. Get PEP Talk by ID

**GET** `/api/pep-talk/:id`

Retrieves a specific PEP talk record.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "pep_talk",
    "date": "2025-01-15T10:00:00.000Z",
    "topic": "Environmental Protection and Energy Conservation",
    "duration": 45,
    "trainer": "John Smith",
    "attendeesCount": 25,
    "keyPoints": [
      "Importance of environmental protection",
      "Energy conservation techniques"
    ],
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

### 5. Update PEP Talk

**PUT** `/api/pep-talk/:id`

Updates an existing PEP talk record.

**Request Body:**

```json
{
  "status": "completed",
  "duration": 60,
  "attendeesCount": 30,
  "topic": "Updated Topic",
  "trainer": "Jane Doe",
  "keyPoints": ["Updated key point 1", "Updated key point 2"]
}
```

**Response:**

```json
{
  "message": "PEP talk updated successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "topic": "Updated Topic",
    "duration": 60,
    "trainer": "Jane Doe",
    "attendeesCount": 30,
    "keyPoints": ["Updated key point 1", "Updated key point 2"],
    "status": "completed",
    "updatedBy": "user-id",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### 6. Delete PEP Talk

**DELETE** `/api/pep-talk/:id`

Deletes a PEP talk record. Only admins or the creator can delete records.

**Response:**

```json
{
  "message": "PEP talk deleted successfully"
}
```

### 7. Get PEP Talk Statistics

**GET** `/api/pep-talk/stats/overview`

Retrieves comprehensive PEP talk statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 15,
    "scheduled": 10,
    "completed": 120,
    "cancelled": 5,
    "totalAttendees": 3750,
    "totalDuration": 6750,
    "avgDuration": 45,
    "totalKeyPoints": 600
  }
}
```

### 8. Get Popular Topics

**GET** `/api/pep-talk/topics/popular`

Retrieves most popular PEP talk topics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `limit` (optional): Number of topics to return (default: 10)

**Response:**

```json
{
  "data": [
    {
      "_id": "Environmental Protection",
      "count": 25,
      "totalAttendees": 625,
      "avgDuration": 45
    },
    {
      "_id": "Safety Procedures",
      "count": 20,
      "totalAttendees": 500,
      "avgDuration": 40
    }
  ]
}
```

## Data Models

### PEP Talk Status

- `draft`: Talk saved but not yet completed
- `scheduled`: Talk is scheduled for future
- `completed`: Talk has been conducted
- `cancelled`: Talk was cancelled

### Key Points

- Array of strings containing key points covered in the talk
- At least one key point is required for non-draft status
- Empty key points are automatically filtered out

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
- `date`: Cannot be in future for completed talks

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
  "message": "PEP talk not found"
}
```

### 403 Forbidden

```json
{
  "message": "Not authorized to delete this PEP talk record"
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
- `photos` → `photos` (Array of Cloudinary URLs)

### Usage Examples

#### Save Draft

```javascript
// Use /save-draft endpoint for "Save Draft" button
const saveDraft = async (formData) => {
  const response = await fetch("/api/pep-talk/save-draft", {
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
      photos: formData.photos,
    }),
  });
};
```

#### Submit Complete

```javascript
// Use main POST endpoint for "Submit" button
const submitPepTalk = async (formData) => {
  const response = await fetch("/api/pep-talk", {
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
