# Near Miss Report API Documentation

## Overview

The Near Miss Report API provides endpoints for managing near miss incidents with support for draft saving, comprehensive workflow management, action tracking, and learning integration.

## Base URL

```
/api/near-miss
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Near Miss Report

**POST** `/api/near-miss`

Creates a new near miss report with full details or as a draft.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "near_miss",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "location": "Zone A - Main Construction Area",
  "situation": "Worker almost fell from scaffolding while reaching for tools",
  "potentialConsequence": "Could have resulted in serious injury or fatality",
  "preventiveActions": "Implement tool tethering system and better access routes",
  "reportedBy": "John Smith (EMP345)",
  "severity": "high",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "reported"
}
```

**Response:**

```json
{
  "message": "Near miss report submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "near_miss",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "location": "Zone A - Main Construction Area",
    "situation": "Worker almost fell from scaffolding while reaching for tools",
    "potentialConsequence": "Could have resulted in serious injury or fatality",
    "preventiveActions": "Implement tool tethering system and better access routes",
    "reportedBy": "John Smith (EMP345)",
    "severity": "high",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "reported",
    "createdBy": "...",
    "createdAt": "2025-01-15T14:35:00.000Z",
    "updatedAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Save Draft

**POST** `/api/near-miss/save-draft`

Saves a near miss report as draft with minimal validation (only projectId and dateTime required).

**Request Body:**

```json
{
  "projectId": "P123",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "location": "",
  "situation": "",
  "potentialConsequence": "",
  "preventiveActions": "",
  "reportedBy": "",
  "severity": "medium",
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

### 3. Get All Near Miss Reports

**GET** `/api/near-miss`

Retrieves all near miss reports with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `status` (optional): Filter by status (draft, reported, under_review, action_taken, closed)
- `location` (optional): Filter by location
- `sortBy` (optional): Sort field (default: "dateTime")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "dateTime": "2025-01-15T14:30:00.000Z",
      "location": "Zone A - Main Construction Area",
      "situation": "Worker almost fell from scaffolding",
      "severity": "high",
      "status": "reported"
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

### 4. Get Single Near Miss Report

**GET** `/api/near-miss/:id`

Retrieves a specific near miss report with all details.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "near_miss",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "location": "Zone A - Main Construction Area",
    "situation": "Worker almost fell from scaffolding while reaching for tools",
    "potentialConsequence": "Could have resulted in serious injury or fatality",
    "preventiveActions": "Implement tool tethering system and better access routes",
    "reportedBy": "John Smith (EMP345)",
    "severity": "high",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "reported",
    "reviewNotes": "",
    "actionsTaken": "",
    "actionOwner": "",
    "actionDeadline": null,
    "actionCompleted": false,
    "actionCompletedDate": null,
    "lessonsLearned": "",
    "sharedWithTeam": false,
    "sharedDate": null,
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

### 5. Update Near Miss Report

**PUT** `/api/near-miss/:id`

Updates an existing near miss report.

**Request Body:** (Same as create, but all fields are optional)

### 6. Delete Near Miss Report

**DELETE** `/api/near-miss/:id`

Deletes a near miss report. Only admin users or the creator can delete reports.

### 7. Get Statistics Overview

**GET** `/api/near-miss/stats/overview`

Retrieves comprehensive statistics about near miss reports.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 10,
    "reported": 80,
    "underReview": 30,
    "actionTaken": 20,
    "closed": 10,
    "low": 40,
    "medium": 60,
    "high": 35,
    "critical": 15,
    "actionsCompleted": 15,
    "actionsOverdue": 5,
    "sharedWithTeam": 25
  }
}
```

### 8. Get Overdue Actions

**GET** `/api/near-miss/actions/overdue`

Retrieves near miss reports with overdue actions.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "location": "Zone A",
      "situation": "Near fall incident",
      "actionOwner": "Site Manager",
      "actionDeadline": "2025-01-10T00:00:00.000Z",
      "actionsTaken": "Implement safety measures"
      // ... other fields
    }
  ]
}
```

### 9. Get Popular Lessons Learned

**GET** `/api/near-miss/lessons/popular`

Retrieves popular lessons learned from closed near miss reports.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `limit` (optional): Number of results (default: 10)

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "lessonsLearned": "Always maintain 3-point contact when climbing",
      "location": "Zone A",
      "severity": "high",
      "dateTime": "2025-01-15T14:30:00.000Z"
    }
  ]
}
```

### 10. Get Frequent Locations

**GET** `/api/near-miss/locations/frequent`

Retrieves most frequent near miss locations with statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `limit` (optional): Number of results (default: 10)

**Response:**

```json
{
  "data": [
    {
      "_id": "Zone A - Main Construction Area",
      "count": 25,
      "avgSeverity": 2.4,
      "criticalCount": 3
    },
    {
      "_id": "Zone B - Equipment Area",
      "count": 20,
      "avgSeverity": 1.8,
      "criticalCount": 1
    }
  ]
}
```

## Data Validation

### Required Fields for Creation:

- `projectId`: Project identifier
- `dateTime`: Valid ISO 8601 date

### Required Fields for Submission (status != "draft"):

- `location`: Where the near miss occurred
- `situation`: Detailed description of what happened
- `potentialConsequence`: What could have happened
- `preventiveActions`: Suggested preventive measures
- `reportedBy`: Person who reported the near miss

### Draft vs Submitted:

- **Draft**: Only `projectId` and `dateTime` required, can be saved with minimal data
- **Submitted**: All required fields must be filled, triggers full validation

## Status Values

- `draft`: Report is being prepared, minimal validation
- `reported`: Report is submitted and awaiting review
- `under_review`: Report is being reviewed by management
- `action_taken`: Actions have been assigned and are being implemented
- `closed`: All actions completed and lessons learned documented

## Severity Levels

- `low`: Minor near miss with minimal potential consequences
- `medium`: Moderate near miss with moderate potential consequences
- `high`: Significant near miss with serious potential consequences
- `critical`: Major near miss with potentially fatal consequences

## Workflow Management

### Review Process:

1. **Reported**: Initial submission
2. **Under Review**: Management review with notes
3. **Action Taken**: Actions assigned with deadlines
4. **Closed**: Actions completed and lessons learned

### Action Management:

- `actionsTaken`: Description of preventive actions
- `actionOwner`: Person responsible for implementation
- `actionDeadline`: When actions must be completed
- `actionCompleted`: Boolean flag for completion status
- `actionCompletedDate`: When actions were completed
- `lessonsLearned`: Key takeaways from the near miss

### Team Sharing:

- `sharedWithTeam`: Boolean flag for team notification
- `sharedDate`: When lessons were shared with team

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the near miss report creation.

2. **Draft Workflow**: Use the `/save-draft` endpoint for quick saves with minimal data, then update with full details later.

3. **Status Management**: Reports automatically transition from draft to reported when all required fields are provided.

4. **Action Tracking**: Comprehensive action management with deadlines and completion tracking.

5. **Learning Integration**: Lessons learned are captured and can be shared with the team for continuous improvement.

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
  "message": "Near miss report not found"
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

- **Near Miss Details**: All basic fields supported (location, situation, potential consequence, preventive actions)
- **Reporting**: Reporter information captured and validated
- **Photos**: Photo picker integration with Cloudinary URLs
- **Draft Saving**: Local storage + server-side draft persistence
- **Validation**: Client-side and server-side validation aligned

## Key Features

1. **Draft Support**: Save incomplete reports for later completion
2. **Severity Assessment**: Risk-based categorization of near misses
3. **Action Tracking**: Complete workflow from report to action completion
4. **Learning Integration**: Capture and share lessons learned
5. **Location Analysis**: Identify problem areas through location statistics
6. **Team Sharing**: Distribute lessons learned across the organization
7. **Overdue Tracking**: Monitor action completion deadlines
8. **Comprehensive Statistics**: Detailed analytics for safety improvement
