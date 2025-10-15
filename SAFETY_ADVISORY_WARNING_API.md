# Safety Advisory Warning API Documentation

## Overview

The Safety Advisory Warning (SAW) API provides comprehensive endpoints for managing safety warnings with support for draft saving, severity levels, validity periods, acknowledgment tracking, and comprehensive statistics.

## Base URL

```
/api/safety-advisory-warning
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Safety Advisory Warning

**POST** `/api/safety-advisory-warning`

Creates a new safety advisory warning with full details.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "safety_advisory_warning",
  "date": "2025-01-15T10:00:00.000Z",
  "warningTitle": "High Winds Expected - Crane Operations Suspended",
  "severity": "high",
  "affectedArea": "Zone A, All crane operations",
  "description": "Meteorological reports indicate strong winds (40+ km/h) expected from 2:00 PM to 6:00 PM today. All crane operations must be suspended during this period.",
  "validityFrom": "2025-01-15T14:00:00.000Z",
  "validityTo": "2025-01-15T18:00:00.000Z",
  "actionsRequired": "1. Suspend all crane operations immediately\n2. Secure all loose materials\n3. Notify all crane operators\n4. Resume operations only after wind speed drops below 25 km/h",
  "owner": "Safety Manager - John Smith",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "active"
}
```

**Response:**

```json
{
  "message": "Safety advisory warning submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "safety_advisory_warning",
    "date": "2025-01-15T10:00:00.000Z",
    "warningTitle": "High Winds Expected - Crane Operations Suspended",
    "severity": "high",
    "affectedArea": "Zone A, All crane operations",
    "description": "Meteorological reports indicate strong winds...",
    "validityFrom": "2025-01-15T14:00:00.000Z",
    "validityTo": "2025-01-15T18:00:00.000Z",
    "actionsRequired": "1. Suspend all crane operations...",
    "owner": "Safety Manager - John Smith",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "active",
    "acknowledgedBy": [],
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "status": "active"
}
```

**Draft Response:**

```json
{
  "message": "Safety advisory warning saved as draft",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  },
  "status": "draft"
}
```

### 2. Save Draft Safety Advisory Warning

**POST** `/api/safety-advisory-warning/save-draft`

Saves a safety advisory warning as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "date": "2025-01-15T10:00:00.000Z",
  "warningTitle": "High Winds Expected - Crane Operations Suspended",
  "severity": "high",
  "affectedArea": "Zone A, All crane operations",
  "description": "Meteorological reports indicate strong winds...",
  "validityFrom": "2025-01-15T14:00:00.000Z",
  "validityTo": "2025-01-15T18:00:00.000Z",
  "actionsRequired": "1. Suspend all crane operations...",
  "owner": "Safety Manager - John Smith",
  "photos": []
}
```

**Response:**

```json
{
  "message": "Safety advisory warning saved as draft",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "date": "2025-01-15T10:00:00.000Z",
    "warningTitle": "High Winds Expected - Crane Operations Suspended",
    "severity": "high",
    "affectedArea": "Zone A, All crane operations",
    "description": "Meteorological reports indicate strong winds...",
    "validityFrom": "2025-01-15T14:00:00.000Z",
    "validityTo": "2025-01-15T18:00:00.000Z",
    "actionsRequired": "1. Suspend all crane operations...",
    "owner": "Safety Manager - John Smith",
    "photos": [],
    "status": "draft",
    "acknowledgedBy": [],
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 3. Get All Safety Advisory Warnings

**GET** `/api/safety-advisory-warning`

Retrieves all safety advisory warnings with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `severity` (optional): Filter by severity level (low, medium, high, critical)
- `status` (optional): Filter by status (default: "active")
- `affectedArea` (optional): Filter by affected area (partial match)
- `sortBy` (optional): Sort field (default: "date")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "module": "safety_advisory_warning",
      "date": "2025-01-15T10:00:00.000Z",
      "warningTitle": "High Winds Expected - Crane Operations Suspended",
      "severity": "high",
      "affectedArea": "Zone A, All crane operations",
      "description": "Meteorological reports indicate strong winds...",
      "validityFrom": "2025-01-15T14:00:00.000Z",
      "validityTo": "2025-01-15T18:00:00.000Z",
      "actionsRequired": "1. Suspend all crane operations...",
      "owner": "Safety Manager - John Smith",
      "photos": ["cloudinary-url-1"],
      "status": "active",
      "acknowledgedBy": [
        {
          "user": {
            "_id": "user-id",
            "name": "Jane Doe",
            "email": "jane@example.com",
            "employeeId": "EMP456"
          },
          "acknowledgedAt": "2025-01-15T11:00:00.000Z",
          "notes": "Acknowledged and actioned"
        }
      ],
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

### 4. Get Safety Advisory Warning by ID

**GET** `/api/safety-advisory-warning/:id`

Retrieves a specific safety advisory warning.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "safety_advisory_warning",
    "date": "2025-01-15T10:00:00.000Z",
    "warningTitle": "High Winds Expected - Crane Operations Suspended",
    "severity": "high",
    "affectedArea": "Zone A, All crane operations",
    "description": "Meteorological reports indicate strong winds...",
    "validityFrom": "2025-01-15T14:00:00.000Z",
    "validityTo": "2025-01-15T18:00:00.000Z",
    "actionsRequired": "1. Suspend all crane operations...",
    "owner": "Safety Manager - John Smith",
    "photos": ["cloudinary-url-1"],
    "status": "active",
    "acknowledgedBy": [
      {
        "user": {
          "_id": "user-id",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "employeeId": "EMP456"
        },
        "acknowledgedAt": "2025-01-15T11:00:00.000Z",
        "notes": "Acknowledged and actioned"
      }
    ],
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

### 5. Update Safety Advisory Warning

**PUT** `/api/safety-advisory-warning/:id`

Updates an existing safety advisory warning.

**Request Body:**

```json
{
  "status": "resolved",
  "severity": "medium",
  "affectedArea": "Zone A only",
  "description": "Updated description...",
  "actionsRequired": "Updated actions...",
  "owner": "Updated Owner",
  "validityTo": "2025-01-15T20:00:00.000Z"
}
```

**Response:**

```json
{
  "message": "Safety advisory warning updated successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "warningTitle": "High Winds Expected - Crane Operations Suspended",
    "severity": "medium",
    "affectedArea": "Zone A only",
    "description": "Updated description...",
    "actionsRequired": "Updated actions...",
    "owner": "Updated Owner",
    "validityTo": "2025-01-15T20:00:00.000Z",
    "status": "resolved",
    "updatedBy": "user-id",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

### 6. Acknowledge Safety Advisory Warning

**POST** `/api/safety-advisory-warning/:id/acknowledge`

Acknowledges a safety advisory warning.

**Request Body:**

```json
{
  "notes": "Acknowledged and actions implemented"
}
```

**Response:**

```json
{
  "message": "Safety advisory warning acknowledged successfully",
  "data": {
    "_id": "...",
    "acknowledgedBy": [
      {
        "user": {
          "_id": "user-id",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "employeeId": "EMP456"
        },
        "acknowledgedAt": "2025-01-15T12:00:00.000Z",
        "notes": "Acknowledged and actions implemented"
      }
    ]
  }
}
```

### 7. Delete Safety Advisory Warning

**DELETE** `/api/safety-advisory-warning/:id`

Deletes a safety advisory warning. Only admins or the creator can delete warnings.

**Response:**

```json
{
  "message": "Safety advisory warning deleted successfully"
}
```

### 8. Get Safety Advisory Warning Statistics

**GET** `/api/safety-advisory-warning/stats/overview`

Retrieves comprehensive safety advisory warning statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 20,
    "active": 45,
    "expired": 35,
    "cancelled": 10,
    "resolved": 40,
    "low": 25,
    "medium": 40,
    "high": 50,
    "critical": 35
  }
}
```

### 9. Get Currently Active Warnings

**GET** `/api/safety-advisory-warning/active/current`

Retrieves currently active and valid warnings.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "warningTitle": "High Winds Expected - Crane Operations Suspended",
      "severity": "high",
      "affectedArea": "Zone A, All crane operations",
      "validityFrom": "2025-01-15T14:00:00.000Z",
      "validityTo": "2025-01-15T18:00:00.000Z",
      "status": "active",
      "acknowledgedBy": [
        {
          "user": {
            "_id": "user-id",
            "name": "Jane Doe",
            "email": "jane@example.com",
            "employeeId": "EMP456"
          },
          "acknowledgedAt": "2025-01-15T11:00:00.000Z",
          "notes": "Acknowledged"
        }
      ],
      "createdBy": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "employeeId": "EMP123"
      }
    }
  ]
}
```

## Data Models

### Safety Advisory Warning Status

- `draft`: Warning saved but not yet active
- `active`: Warning is currently active and valid
- `expired`: Warning has passed its validity period
- `cancelled`: Warning was cancelled
- `resolved`: Warning has been resolved

### Severity Levels

- `low`: Low priority warning
- `medium`: Medium priority warning
- `high`: High priority warning
- `critical`: Critical priority warning

### Acknowledgment Tracking

- `acknowledgedBy`: Array of users who have acknowledged the warning
- Each acknowledgment includes user details, timestamp, and optional notes

### Validity Period

- `validityFrom`: When the warning becomes effective
- `validityTo`: When the warning expires (optional - if not set, warning remains active until manually resolved)

## Validation Rules

### Required Fields (All Statuses)

- `projectId`: String, not empty
- `date`: Valid ISO8601 date
- `warningTitle`: String, not empty
- `severity`: One of: low, medium, high, critical
- `affectedArea`: String, not empty
- `description`: String, not empty
- `validityFrom`: Valid ISO8601 date
- `actionsRequired`: String, not empty
- `owner`: String, not empty

### Conditional Validation

- `validityTo`: Must be after validityFrom for active status
- `validityTo`: Optional for draft status

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Warning title is required",
      "param": "warningTitle",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "Safety advisory warning not found"
}
```

### 403 Forbidden

```json
{
  "message": "Not authorized to delete this safety advisory warning"
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
- `warningTitle` → `warningTitle` (String field)
- `severity` → `severity` (Enum: low, medium, high, critical)
- `affectedArea` → `affectedArea` (String field)
- `description` → `description` (String field)
- `validityFrom` → `validityFrom` (Date field)
- `validityTo` → `validityTo` (Date field, optional)
- `actionsRequired` → `actionsRequired` (String field)
- `owner` → `owner` (String field)
- `photos` → `photos` (Array of Cloudinary URLs)

### Usage Examples

#### Save Draft

```javascript
// Use /save-draft endpoint for "Save Draft" button
const saveDraft = async (formData) => {
  const response = await fetch("/api/safety-advisory-warning/save-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      date: formData.date,
      warningTitle: formData.warningTitle,
      severity: formData.severity,
      affectedArea: formData.affectedArea,
      description: formData.description,
      validityFrom: formData.validityFrom,
      validityTo: formData.validityTo || undefined,
      actionsRequired: formData.actionsRequired,
      owner: formData.owner,
      photos: formData.photos,
    }),
  });
};
```

#### Submit Complete

```javascript
// Use main POST endpoint for "Submit" button
const submitSAW = async (formData) => {
  const response = await fetch("/api/safety-advisory-warning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      date: formData.date,
      warningTitle: formData.warningTitle,
      severity: formData.severity,
      affectedArea: formData.affectedArea,
      description: formData.description,
      validityFrom: formData.validityFrom,
      validityTo: formData.validityTo || undefined,
      actionsRequired: formData.actionsRequired,
      owner: formData.owner,
      photos: formData.photos,
      status: "active",
    }),
  });
};
```

## Notes

- The API automatically expires warnings when validityTo date passes
- Acknowledgment tracking provides audit trail for compliance
- Validity date validation only applies to active warnings
- All timestamps are in ISO8601 format
- Photos should be uploaded to Cloudinary and URLs provided
- The API supports both draft saving and full submission workflows
- Active warnings can be filtered by validity period for real-time monitoring
