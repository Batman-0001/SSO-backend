# Daily Briefing (Toolbox Talk) API Documentation

## Overview

The Daily Briefing API provides endpoints for managing toolbox talks with support for multiple attendance methods and mandatory photo documentation.

## Base URL

```
/api/daily-briefing
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Daily Briefing

**POST** `/api/daily-briefing`

Creates a new daily briefing record.

**Request Body:**

```json
{
  "talkNumber": "TBT-2025-001",
  "dateTime": "2025-01-15T10:00:00.000Z",
  "location": "Zone A - Main Construction Area",
  "conductedBy": "John Smith (SSO)",
  "duration": "30",
  "topicCategory": "Working at Height",
  "customTopic": "", // Only required if topicCategory is "Custom Topic"
  "attendeesCount": 15,
  "attendanceMethod": "digital", // "digital", "photo", or "manual"

  // For digital attendance method
  "digitalSignatures": [
    {
      "name": "Worker Name",
      "signature": "base64-encoded-signature"
    }
  ],

  // For photo attendance method
  "attendancePhotos": ["cloudinary-url-1"],

  // For manual attendance method
  "attendeesList": "John Doe, Jane Smith, Bob Johnson",

  "keyPoints": [
    "Check safety harness and lanyard before use",
    "Ensure guardrails are in place"
  ],
  "hazardsDiscussed": "Fall hazards, electrical risks",
  "controlMeasures": "Use safety harness, maintain 3-point contact",
  "questionsRaised": "Questions about ladder safety procedures",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"] // Minimum 1 required
}
```

**Response:**

```json
{
  "message": "Daily briefing created successfully",
  "data": {
    "_id": "...",
    "talkNumber": "TBT-2025-001",
    "dateTime": "2025-01-15T10:00:00.000Z",
    "location": "Zone A - Main Construction Area"
    // ... other fields
  }
}
```

### 2. Get All Daily Briefings

**GET** `/api/daily-briefing`

Retrieves all daily briefing records with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `location` (optional): Filter by location
- `topicCategory` (optional): Filter by topic category
- `conductedBy` (optional): Filter by conductor
- `status` (optional): Filter by status (default: "submitted")
- `attendanceMethod` (optional): Filter by attendance method
- `sortBy` (optional): Sort field (default: "dateTime")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "talkNumber": "TBT-2025-001"
      // ... briefing data
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 3. Get Single Daily Briefing

**GET** `/api/daily-briefing/:id`

Retrieves a specific daily briefing record.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "talkNumber": "TBT-2025-001"
    // ... complete briefing data
  }
}
```

### 4. Update Daily Briefing

**PUT** `/api/daily-briefing/:id`

Updates an existing daily briefing record.

**Request Body:** (Same as create, but all fields are optional)

### 5. Delete Daily Briefing

**DELETE** `/api/daily-briefing/:id`

Deletes a daily briefing record. Only admin users or the creator can delete records.

### 6. Generate Talk Number

**POST** `/api/daily-briefing/generate-talk-number`

Generates a unique talk number for new briefings.

**Response:**

```json
{
  "talkNumber": "TBT-2025-042"
}
```

### 7. Get Statistics Overview

**GET** `/api/daily-briefing/stats/overview`

Retrieves comprehensive statistics about daily briefings.

**Query Parameters:**

- `dateFrom` (optional): Start date for statistics
- `dateTo` (optional): End date for statistics

**Response:**

```json
{
  "data": {
    "total": 150,
    "submitted": 120,
    "approved": 100,
    "rejected": 5,
    "totalAttendees": 2500,
    "totalDuration": 4500,
    "avgDuration": 30,
    "totalKeyPoints": 750,
    "totalPhotos": 300,
    "attendanceMethods": [
      { "_id": "digital", "count": 80 },
      { "_id": "photo", "count": 45 },
      { "_id": "manual", "count": 25 }
    ],
    "popularTopics": [
      { "_id": "Working at Height", "count": 25, "totalAttendees": 400 }
      // ... more topics
    ]
  }
}
```

### 8. Get Topic Categories

**GET** `/api/daily-briefing/topics/categories`

Retrieves all available topic categories.

**Response:**

```json
{
  "data": [
    "Working at Height",
    "Electrical Safety",
    "Excavation Safety",
    "PPE Usage",
    "Manual Handling",
    "Hot Work Safety",
    "Confined Space Entry",
    "Scaffolding Safety",
    "Crane Operations",
    "Fall Protection",
    "Fire Safety",
    "Chemical Handling",
    "Machine Guarding",
    "Housekeeping",
    "Emergency Procedures",
    "Custom Topic"
  ]
}
```

### 9. Get Attendance Methods

**GET** `/api/daily-briefing/attendance/methods`

Retrieves all available attendance methods with descriptions.

**Response:**

```json
{
  "data": [
    {
      "value": "digital",
      "label": "Digital Signatures (Capture on mobile)",
      "description": "Capture digital signatures from attendees"
    },
    {
      "value": "photo",
      "label": "Photo Upload (Group photo with workers)",
      "description": "Upload group photo with workers"
    },
    {
      "value": "manual",
      "label": "Manual List (Names comma-separated)",
      "description": "Enter names separated by commas"
    }
  ]
}
```

### 10. Approve Daily Briefing

**POST** `/api/daily-briefing/:id/approve`

Approves a daily briefing (Admin/Manager only).

**Response:**

```json
{
  "message": "Daily briefing approved successfully",
  "data": {
    // ... updated briefing data with status: "approved"
  }
}
```

### 11. Reject Daily Briefing

**POST** `/api/daily-briefing/:id/reject`

Rejects a daily briefing with optional reason (Admin/Manager only).

**Request Body:**

```json
{
  "reason": "Incomplete documentation"
}
```

**Response:**

```json
{
  "message": "Daily briefing rejected successfully",
  "data": {
    // ... updated briefing data with status: "rejected"
  }
}
```

## Data Validation

### Required Fields for Creation:

- `talkNumber`: Unique identifier
- `dateTime`: Valid ISO 8601 date
- `location`: Non-empty string
- `conductedBy`: Non-empty string
- `duration`: One of ["15", "30", "45"]
- `topicCategory`: Valid topic category
- `attendeesCount`: Integer >= 1
- `attendanceMethod`: One of ["digital", "photo", "manual"]
- `keyPoints`: Array with at least 1 non-empty string
- `photos`: Array with at least 1 photo URL

### Attendance Method Specific Requirements:

- **digital**: `digitalSignatures` array with at least 1 signature
- **photo**: `attendancePhotos` array with at least 1 photo
- **manual**: `attendeesList` non-empty string

### Custom Topic Validation:

- If `topicCategory` is "Custom Topic", then `customTopic` is required

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Talk number is required",
      "param": "talkNumber",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "Daily briefing not found"
}
```

### 500 Server Error

```json
{
  "message": "Server error",
  "error": "Error details"
}
```

## Status Values

- `draft`: Briefing is being prepared
- `submitted`: Briefing is submitted and awaiting review
- `approved`: Briefing has been approved
- `rejected`: Briefing has been rejected

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the briefing creation.

2. **Talk Number Generation**: Use the `/generate-talk-number` endpoint to get a unique talk number before creating a briefing.

3. **Validation**: The API performs comprehensive validation including attendance method-specific requirements and mandatory photo documentation.

4. **Permissions**: Only admins or briefing creators can delete records. Only admins/managers can approve/reject briefings.
