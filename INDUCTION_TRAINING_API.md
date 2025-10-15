# Induction Training API Documentation

## Overview

The Induction Training API provides endpoints for managing induction training sessions with support for draft saving, attendance management, contractor tracking, and comprehensive training analytics.

## Base URL

```
/api/induction-training
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Induction Training

**POST** `/api/induction-training`

Creates a new induction training record with full details or as a draft.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "induction_training",
  "trainingDate": "2025-01-15T00:00:00.000Z",
  "duration": 120,
  "contractor": "contractor_a",
  "trainerName": "Safety Officer John Smith",
  "attendanceCount": 25,
  "attendees": [
    {
      "name": "Bob Johnson",
      "empId": "EMP001",
      "contractor": "ABC Construction Ltd"
    },
    {
      "name": "Alice Brown",
      "empId": "EMP002",
      "contractor": "ABC Construction Ltd"
    }
  ],
  "notes": "Safety protocols, emergency procedures, and PPE requirements covered",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "completed"
}
```

**Response:**

```json
{
  "message": "Induction training submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "induction_training",
    "trainingDate": "2025-01-15T00:00:00.000Z",
    "duration": 120,
    "contractor": "contractor_a",
    "trainerName": "Safety Officer John Smith",
    "attendanceCount": 25,
    "attendees": [
      {
        "name": "Bob Johnson",
        "empId": "EMP001",
        "contractor": "ABC Construction Ltd"
      }
    ],
    "notes": "Safety protocols, emergency procedures, and PPE requirements covered",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "completed",
    "createdBy": "...",
    "createdAt": "2025-01-15T14:35:00.000Z",
    "updatedAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Save Draft

**POST** `/api/induction-training/save-draft`

Saves an induction training record as draft with minimal validation (only projectId and trainingDate required).

**Request Body:**

```json
{
  "projectId": "P123",
  "trainingDate": "2025-01-15T00:00:00.000Z",
  "duration": 0,
  "contractor": "",
  "trainerName": "",
  "attendanceCount": 0,
  "attendees": [],
  "notes": "",
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

### 3. Get All Induction Trainings

**GET** `/api/induction-training`

Retrieves all induction training records with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `contractor` (optional): Filter by contractor
- `trainerName` (optional): Filter by trainer name (partial match)
- `status` (optional): Filter by status (draft, scheduled, completed, cancelled)
- `sortBy` (optional): Sort field (default: "trainingDate")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "trainingDate": "2025-01-15T00:00:00.000Z",
      "duration": 120,
      "contractor": "contractor_a",
      "trainerName": "Safety Officer John Smith",
      "attendanceCount": 25,
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

### 4. Get Single Induction Training

**GET** `/api/induction-training/:id`

Retrieves a specific induction training record with all details.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "induction_training",
    "trainingDate": "2025-01-15T00:00:00.000Z",
    "duration": 120,
    "contractor": "contractor_a",
    "trainerName": "Safety Officer John Smith",
    "attendanceCount": 25,
    "attendees": [
      {
        "name": "Bob Johnson",
        "empId": "EMP001",
        "contractor": "ABC Construction Ltd"
      }
    ],
    "notes": "Safety protocols, emergency procedures, and PPE requirements covered",
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

### 5. Update Induction Training

**PUT** `/api/induction-training/:id`

Updates an existing induction training record.

**Request Body:** (Same as create, but all fields are optional)

### 6. Delete Induction Training

**DELETE** `/api/induction-training/:id`

Deletes an induction training record. Only admin users or the creator can delete training records.

### 7. Get Statistics Overview

**GET** `/api/induction-training/stats/overview`

Retrieves comprehensive statistics about induction trainings.

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
    "totalAttendees": 2750,
    "totalDuration": 18000,
    "avgDuration": 120
  }
}
```

## Data Validation

### Required Fields for Creation:

- `projectId`: Project identifier
- `trainingDate`: Valid ISO 8601 date

### Required Fields for Submission (status != "draft"):

- `duration`: Training duration in minutes (minimum 1)
- `trainerName`: Name of the trainer
- `attendanceCount`: Number of attendees (non-negative)

### Conditional Validation:

- Attendance count must match the number of attendees in the list for submitted trainings
- Training date cannot be in the future for completed trainings
- Duration must be at least 1 minute

### Draft vs Submitted:

- **Draft**: Only `projectId` and `trainingDate` required, can be saved with minimal data
- **Submitted**: All required fields must be filled, triggers full validation including attendance count matching

## Status Values

- `draft`: Training record is being prepared, minimal validation
- `scheduled`: Training is scheduled but not yet completed
- `completed`: Training has been completed
- `cancelled`: Training was cancelled

## Contractor Options

- `contractor_a`: ABC Construction Ltd
- `contractor_b`: XYZ Builders
- `contractor_c`: Metro Contractors

## Attendee Schema

Each attendee object contains:

- `name` (required): Full name of the attendee
- `empId` (required): Employee ID or contractor identifier
- `contractor` (optional): Contractor name for subcontractor employees

## Training Management

### Training Process:

1. **Draft**: Initial training record being prepared
2. **Scheduled**: Training is planned and scheduled
3. **Completed**: Training has been conducted
4. **Cancelled**: Training was cancelled

### Attendance Tracking:

- `attendanceCount`: Total number of attendees
- `attendees`: Array of individual attendee records
- Attendance count must match attendees array length for completed trainings

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the training creation.

2. **Draft Workflow**: Use the `/save-draft` endpoint for quick saves with minimal data, then update with full details later.

3. **Attendance Management**: The system validates that attendance count matches the number of individual attendee records.

4. **Contractor Tracking**: Optional contractor field for tracking which subcontractor the training was for.

5. **Duration Tracking**: Training duration in minutes with automatic calculation of total training hours.

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
  "message": "Induction training not found"
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

- **Training Details**: All basic fields supported (date, duration, contractor, trainer name)
- **Attendance Management**: Dynamic attendee list with name, employee ID, and contractor
- **Attendance Count**: Numeric input with validation matching attendee list
- **Notes**: Text area for training material and additional notes
- **Photos**: Photo picker integration with Cloudinary URLs
- **Draft Saving**: Local storage + server-side draft persistence

## Key Features

1. **Draft Support**: Save incomplete training records for later completion
2. **Attendance Validation**: Automatic validation that count matches attendee list
3. **Contractor Tracking**: Optional contractor selection for subcontractor trainings
4. **Photo Documentation**: Photo upload for group photos and sign-in sheets
5. **Duration Tracking**: Training duration in minutes with analytics
6. **Flexible Status**: Draft, scheduled, completed, cancelled workflow
7. **Comprehensive Statistics**: Detailed analytics for training effectiveness
8. **Attendee Management**: Individual attendee records with employee IDs

## Analytics Available

- **Status Distribution**: Draft, scheduled, completed, cancelled breakdown
- **Total Attendees**: Sum of all training attendance
- **Total Duration**: Combined training time across all sessions
- **Average Duration**: Mean training session length
- **Contractor Analysis**: Training distribution by contractor
- **Trainer Performance**: Training sessions by trainer

## Special Features

1. **Automatic Status Detection**: Training automatically becomes "completed" when all required fields are provided
2. **Attendance Validation**: Ensures attendance count matches individual attendee records
3. **Future Date Validation**: Prevents completed trainings with future dates
4. **Duration Analytics**: Automatic calculation of total and average training duration
5. **Contractor Integration**: Optional contractor tracking for subcontractor management
