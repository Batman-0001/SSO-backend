# Daily Training API Documentation

## Overview

The Daily Training API provides endpoints for managing daily training sessions with support for draft saving, dynamic key points management, attendance tracking, and comprehensive training analytics.

## Base URL

```
/api/daily-training
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Daily Training

**POST** `/api/daily-training`

Creates a new daily training record with full details or as a draft.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "daily_training",
  "date": "2025-01-15T00:00:00.000Z",
  "topic": "PPE Usage and Safety",
  "duration": 30,
  "trainer": "Safety Officer John Smith",
  "attendeesCount": 15,
  "keyPoints": [
    "Importance of wearing hard hats at all times",
    "Proper use of safety harnesses for working at height",
    "Emergency evacuation procedures",
    "Reporting unsafe conditions immediately"
  ],
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "completed"
}
```

**Response:**

```json
{
  "message": "Daily training submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "daily_training",
    "date": "2025-01-15T00:00:00.000Z",
    "topic": "PPE Usage and Safety",
    "duration": 30,
    "trainer": "Safety Officer John Smith",
    "attendeesCount": 15,
    "keyPoints": [
      "Importance of wearing hard hats at all times",
      "Proper use of safety harnesses for working at height",
      "Emergency evacuation procedures",
      "Reporting unsafe conditions immediately"
    ],
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "completed",
    "createdBy": "...",
    "createdAt": "2025-01-15T14:35:00.000Z",
    "updatedAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Save Draft

**POST** `/api/daily-training/save-draft`

Saves a daily training record as draft with minimal validation (only projectId and date required).

**Request Body:**

```json
{
  "projectId": "P123",
  "date": "2025-01-15T00:00:00.000Z",
  "topic": "",
  "duration": 0,
  "trainer": "",
  "attendeesCount": 0,
  "keyPoints": [],
  "photos": []
}
```

**Response:**

```json
{
  "message": "Draft saved successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "status": "draft"
    // ... other fields
  }
}
```

### 3. Get All Daily Trainings

**GET** `/api/daily-training`

Retrieves all daily training records with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `topic` (optional): Filter by topic (partial match)
- `trainer` (optional): Filter by trainer name (partial match)
- `status` (optional): Filter by status (draft, scheduled, completed, cancelled)
- `sortBy` (optional): Sort field (default: "date")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "date": "2025-01-15T00:00:00.000Z",
      "topic": "PPE Usage and Safety",
      "duration": 30,
      "trainer": "Safety Officer John Smith",
      "attendeesCount": 15,
      "status": "completed"
      // ... other fields
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 4. Get Single Daily Training

**GET** `/api/daily-training/:id`

Retrieves a specific daily training record with all details.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "daily_training",
    "date": "2025-01-15T00:00:00.000Z",
    "topic": "PPE Usage and Safety",
    "duration": 30,
    "trainer": "Safety Officer John Smith",
    "attendeesCount": 15,
    "keyPoints": [
      "Importance of wearing hard hats at all times",
      "Proper use of safety harnesses for working at height",
      "Emergency evacuation procedures",
      "Reporting unsafe conditions immediately"
    ],
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "completed",
    "createdBy": {
      "_id": "...",
      "name": "Safety Officer",
      "email": "safety@company.com",
      "employeeId": "EMP001"
    },
    "createdAt": "2025-01-15T14:35:00.000Z",
    "updatedAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 5. Update Daily Training

**PUT** `/api/daily-training/:id`

Updates an existing daily training record.

**Request Body:** (Same as create, but all fields are optional)

### 6. Delete Daily Training

**DELETE** `/api/daily-training/:id`

Deletes a daily training record. Only admin users or the creator can delete training records.

### 7. Get Statistics Overview

**GET** `/api/daily-training/stats/overview`

Retrieves comprehensive statistics about daily trainings.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 10,
    "scheduled": 20,
    "completed": 110,
    "cancelled": 10,
    "totalAttendees": 2250,
    "totalDuration": 4500,
    "avgDuration": 30,
    "totalKeyPoints": 660
  }
}
```

### 8. Get Popular Topics

**GET** `/api/daily-training/topics/popular`

Retrieves the most popular training topics with analytics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `limit` (optional): Number of topics to return (default: 10)

**Response:**

```json
{
  "data": [
    {
      "_id": "PPE Usage and Safety",
      "count": 25,
      "totalAttendees": 375,
      "avgDuration": 30
    },
    {
      "_id": "Working at Height",
      "count": 20,
      "totalAttendees": 300,
      "avgDuration": 45
    }
  ]
}
```

## Data Validation

### Required Fields for Creation:

- `projectId`: Project identifier
- `date`: Valid ISO 8601 date

### Required Fields for Submission (status != "draft"):

- `topic`: Training topic description
- `duration`: Training duration in minutes (minimum 1)
- `trainer`: Name of the trainer
- `attendeesCount`: Number of attendees (non-negative)

### Conditional Validation:

- At least one valid key point is required for submitted trainings
- Training date cannot be in the future for completed trainings
- Duration must be at least 1 minute
- Empty key points are automatically filtered out

### Draft vs Submitted:

- **Draft**: Only `projectId` and `date` required, can be saved with minimal data
- **Submitted**: All required fields must be filled, triggers full validation including key points requirement

## Status Values

- `draft`: Training record is being prepared, minimal validation
- `scheduled`: Training is scheduled but not yet completed
- `completed`: Training has been completed
- `cancelled`: Training was cancelled

## Key Points Management

### Dynamic Key Points:

- Key points are stored as an array of strings
- Empty key points are automatically filtered out during save
- At least one valid key point is required for submitted trainings
- Each key point should be non-empty and trimmed

### Frontend Integration:

- Use dynamic add/remove functionality for key points
- Filter out empty key points before submission
- Validate minimum one key point for completed trainings

## Training Management

### Training Process:

1. **Draft**: Initial training record being prepared
2. **Scheduled**: Training is planned and scheduled
3. **Completed**: Training has been conducted
4. **Cancelled**: Training was cancelled

### Key Features:

- **Duration Tracking**: Training duration in minutes with analytics
- **Attendance Tracking**: Number of attendees with total calculations
- **Topic Analytics**: Popular topics with frequency and attendance data
- **Key Points**: Dynamic list of training points covered

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the training creation.

2. **Draft Workflow**: Use the `/save-draft` endpoint for quick saves with minimal data, then update with full details later.

3. **Key Points Management**: Filter out empty key points on the frontend before submission.

4. **Automatic Status Detection**: Training automatically becomes "completed" when all required fields are provided.

5. **Date Validation**: System prevents completed trainings with future dates.

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Project ID is required",
      "param": "projectId",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "Daily training not found"
}
```

### 500 Server Error

```json
{
  "message": "Server error",
  "error": "Error details"
}
```

## Frontend Integration

The API perfectly matches your frontend form structure:

- **Training Details**: All basic fields supported (date, topic, duration, trainer, attendees count)
- **Key Points Management**: Dynamic add/remove functionality with validation
- **Photos**: Photo picker integration with Cloudinary URLs
- **Draft Saving**: Local storage + server-side draft persistence

## Key Features

1. **Draft Support**: Save incomplete training records for later completion
2. **Dynamic Key Points**: Add/remove key points with automatic validation
3. **Attendance Tracking**: Numeric attendance count with analytics
4. **Photo Documentation**: Photo upload for training evidence
5. **Duration Analytics**: Training duration tracking with statistics
6. **Topic Analytics**: Popular topics with frequency analysis
7. **Flexible Status**: Draft, scheduled, completed, cancelled workflow
8. **Comprehensive Statistics**: Detailed analytics for training effectiveness

## Analytics Available

- **Status Distribution**: Draft, scheduled, completed, cancelled breakdown
- **Total Attendees**: Sum of all training attendance
- **Total Duration**: Combined training time across all sessions
- **Average Duration**: Mean training session length
- **Total Key Points**: Combined key points across all trainings
- **Popular Topics**: Most frequently covered training topics
- **Topic Analytics**: Attendance and duration data per topic

## Special Features

1. **Automatic Key Point Filtering**: Empty key points are automatically removed
2. **Automatic Status Detection**: Training becomes "completed" when all required fields are provided
3. **Future Date Validation**: Prevents completed trainings with future dates
4. **Duration Analytics**: Automatic calculation of total and average training duration
5. **Topic Popularity**: Analytics for most frequently covered training topics
6. **Key Points Count**: Automatic tracking of total key points across all trainings

## Virtual Fields

The model includes helpful virtual fields:

- `durationHours`: Duration converted to hours (rounded to 2 decimal places)
- `keyPointsCount`: Number of key points in the training
- `getValidKeyPoints()`: Method to get only non-empty key points

## Advanced Analytics

### Topic Analysis:

- Most popular training topics by frequency
- Total attendees per topic
- Average duration per topic
- Training effectiveness metrics

### Training Trends:

- Training frequency over time
- Attendance patterns
- Duration trends
- Key points coverage analysis

This API provides a comprehensive solution for daily training management with advanced analytics, flexible draft saving, and dynamic content management perfect for construction site safety training programs.
