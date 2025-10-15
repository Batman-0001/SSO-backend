# Incident Report API Documentation

## Overview

The Incident Report API provides comprehensive endpoints for managing workplace incidents with support for quick capture, detailed reporting, investigation workflows, and follow-up actions.

## Base URL

```
/api/incident-report
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Incident Report

**POST** `/api/incident-report`

Creates a new incident report with full details.

**Request Body:**

```json
{
  "incidentId": "INC-2025-0001",
  "dateTime": "2025-01-15T10:30:00.000Z",
  "location": "Zone A - Construction Site",
  "incidentType": "near_miss",
  "severity": "medium",
  "quickPhotos": ["cloudinary-url-1"],
  "description": "Worker almost fell from scaffolding",
  "activity": "Scaffolding work",
  "equipment": "Safety harness, ladder",
  "weather": "Partly Cloudy, 28°C",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "personName": "John Doe",
  "personRole": "Mason",
  "personCompany": "MEIL",
  "injuryDetails": "No injury",
  "treatment": "None required",
  "witnessName": "Jane Smith",
  "witnessStatement": "Saw the worker lose balance but caught himself",
  "immediateCause": "Worker not wearing safety harness",
  "rootCause": "Inadequate safety training",
  "immediateActions": "Stopped work, checked safety equipment",
  "correctiveActions": "Conduct safety training, implement daily equipment checks"
}
```

**Response:**

```json
{
  "message": "Incident report created successfully",
  "data": {
    "_id": "...",
    "incidentId": "INC-2025-0001",
    "dateTime": "2025-01-15T10:30:00.000Z",
    "location": "Zone A - Construction Site",
    "incidentType": "near_miss",
    "severity": "medium",
    "status": "submitted"
    // ... other fields
  },
  "isHighPriority": false,
  "alertMessage": null
}
```

### 2. Quick Save Incident

**POST** `/api/incident-report/quick-save`

Quickly captures essential incident information (minimal data for immediate capture).

**Request Body:**

```json
{
  "incidentId": "INC-2025-0001",
  "dateTime": "2025-01-15T10:30:00.000Z",
  "location": "Zone A - Construction Site",
  "incidentType": "near_miss",
  "severity": "medium",
  "quickPhotos": ["cloudinary-url-1"],
  "weather": "Partly Cloudy, 28°C"
}
```

**Response:**

```json
{
  "message": "Incident captured! Complete details when ready.",
  "data": {
    "_id": "...",
    "incidentId": "INC-2025-0001",
    "status": "draft"
    // ... minimal fields
  }
}
```

### 3. Get All Incident Reports

**GET** `/api/incident-report`

Retrieves all incident reports with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `location` (optional): Filter by location
- `incidentType` (optional): Filter by incident type
- `severity` (optional): Filter by severity level
- `status` (optional): Filter by status (default: "submitted")
- `createdBy` (optional): Filter by creator
- `sortBy` (optional): Sort field (default: "dateTime")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")
- `dateFrom` (optional): Start date filter
- `dateTo` (optional): End date filter
- `priority` (optional): Filter by priority ("critical" for LTI or high severity)

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "incidentId": "INC-2025-0001",
      "dateTime": "2025-01-15T10:30:00.000Z",
      "location": "Zone A - Construction Site",
      "incidentType": "near_miss",
      "severity": "medium",
      "status": "submitted"
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

### 4. Get Single Incident Report

**GET** `/api/incident-report/:id`

Retrieves a specific incident report with all details.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "incidentId": "INC-2025-0001",
    "dateTime": "2025-01-15T10:30:00.000Z",
    "location": "Zone A - Construction Site",
    "incidentType": "near_miss",
    "severity": "medium",
    "status": "submitted",
    "description": "Worker almost fell from scaffolding",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "followUpActions": [
      {
        "_id": "...",
        "action": "Conduct safety training",
        "assignedTo": "...",
        "dueDate": "2025-01-20T00:00:00.000Z",
        "status": "pending"
      }
    ]
    // ... complete incident data
  }
}
```

### 5. Update Incident Report

**PUT** `/api/incident-report/:id`

Updates an existing incident report.

**Request Body:** (Same as create, but all fields are optional)

### 6. Delete Incident Report

**DELETE** `/api/incident-report/:id`

Deletes an incident report. Only admin users or the creator can delete records.

### 7. Generate Incident ID

**POST** `/api/incident-report/generate-incident-id`

Generates a unique incident ID for new reports.

**Response:**

```json
{
  "incidentId": "INC-2025-0420"
}
```

### 8. Get Statistics Overview

**GET** `/api/incident-report/stats/overview`

Retrieves comprehensive statistics about incident reports.

**Query Parameters:**

- `dateFrom` (optional): Start date for statistics
- `dateTo` (optional): End date for statistics
- `location` (optional): Filter by location

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 10,
    "submitted": 80,
    "underInvestigation": 30,
    "investigationComplete": 20,
    "closed": 10,
    "low": 50,
    "medium": 70,
    "high": 30,
    "incidentTypes": [
      { "_id": "near_miss", "count": 60 },
      { "_id": "first_aid", "count": 40 },
      { "_id": "lti", "count": 5 }
    ],
    "severityBreakdown": [
      { "_id": "low", "count": 50 },
      { "_id": "medium", "count": 70 },
      { "_id": "high", "count": 30 }
    ],
    "monthlyTrend": [
      { "_id": { "year": 2025, "month": 1 }, "count": 25 },
      { "_id": { "year": 2025, "month": 2 }, "count": 30 }
    ]
  }
}
```

### 9. Get Incident Types

**GET** `/api/incident-report/types/incident-types`

Retrieves all available incident types with descriptions.

**Response:**

```json
{
  "data": [
    {
      "value": "near_miss",
      "label": "Near Miss",
      "color": "border-yellow-300 bg-yellow-50",
      "description": "An unplanned event that did not result in injury, illness, or damage"
    },
    {
      "value": "first_aid",
      "label": "First Aid Case",
      "color": "border-blue-300 bg-blue-50",
      "description": "Minor injury requiring first aid treatment only"
    },
    {
      "value": "medical",
      "label": "Medical Treatment",
      "color": "border-orange-300 bg-orange-50",
      "description": "Injury requiring medical treatment beyond first aid"
    },
    {
      "value": "lti",
      "label": "Lost Time Injury",
      "color": "border-red-300 bg-red-50",
      "description": "Injury resulting in lost work time"
    },
    {
      "value": "property",
      "label": "Property Damage",
      "color": "border-purple-300 bg-purple-50",
      "description": "Damage to equipment, materials, or property"
    },
    {
      "value": "environmental",
      "label": "Environmental",
      "color": "border-green-300 bg-green-50",
      "description": "Environmental incident or violation"
    }
  ]
}
```

### 10. Get Severity Levels

**GET** `/api/incident-report/types/severity-levels`

Retrieves all available severity levels with descriptions.

**Response:**

```json
{
  "data": [
    {
      "value": "low",
      "label": "Low",
      "color": "bg-green-500",
      "emoji": "🟢",
      "description": "Minimal impact, easily controlled"
    },
    {
      "value": "medium",
      "label": "Medium",
      "color": "bg-yellow-500",
      "emoji": "🟡",
      "description": "Moderate impact, requires attention"
    },
    {
      "value": "high",
      "label": "High",
      "color": "bg-red-500",
      "emoji": "🔴",
      "description": "Significant impact, immediate action required"
    }
  ]
}
```

### 11. Assign Investigator

**POST** `/api/incident-report/:id/assign-investigator`

Assigns an investigator to an incident (Admin/Manager only).

**Request Body:**

```json
{
  "investigatorId": "user-id",
  "investigationNotes": "Initial investigation notes"
}
```

**Response:**

```json
{
  "message": "Investigator assigned successfully",
  "data": {
    // ... updated incident data with investigator and status: "under_investigation"
  }
}
```

### 12. Add Follow-up Action

**POST** `/api/incident-report/:id/add-follow-up`

Adds a follow-up action to an incident.

**Request Body:**

```json
{
  "action": "Conduct safety training for all workers",
  "assignedTo": "user-id",
  "dueDate": "2025-01-20T00:00:00.000Z"
}
```

**Response:**

```json
{
  "message": "Follow-up action added successfully",
  "data": {
    // ... updated incident data with new follow-up action
  }
}
```

### 13. Update Follow-up Action

**PUT** `/api/incident-report/:id/follow-up/:actionId`

Updates the status of a follow-up action.

**Request Body:**

```json
{
  "status": "completed",
  "completedBy": "user-id"
}
```

**Response:**

```json
{
  "message": "Follow-up action updated successfully",
  "data": {
    // ... updated incident data with modified follow-up action
  }
}
```

## Data Validation

### Required Fields for Creation:

- `incidentId`: Unique identifier
- `dateTime`: Valid ISO 8601 date
- `location`: Non-empty string
- `incidentType`: One of ["near_miss", "first_aid", "medical", "lti", "property", "environmental"]
- `severity`: One of ["low", "medium", "high"]

### Required Fields for Submission (status != "draft"):

- `description`: Non-empty string
- `photos`: Array with at least 1 photo URL

### Quick Save Requirements:

- Only basic fields required (incidentId, dateTime, location, incidentType, severity)
- Status automatically set to "draft"

## Incident Types

1. **Near Miss**: Unplanned event without injury/damage
2. **First Aid Case**: Minor injury requiring first aid only
3. **Medical Treatment**: Injury requiring medical treatment beyond first aid
4. **Lost Time Injury (LTI)**: Injury resulting in lost work time
5. **Property Damage**: Damage to equipment, materials, or property
6. **Environmental**: Environmental incident or violation

## Severity Levels

1. **Low**: Minimal impact, easily controlled
2. **Medium**: Moderate impact, requires attention
3. **High**: Significant impact, immediate action required

## Status Values

- `draft`: Incident is being prepared (quick save)
- `submitted`: Incident is submitted and awaiting review
- `under_investigation`: Investigation is in progress
- `investigation_complete`: Investigation is finished
- `closed`: Incident is closed and resolved

## Priority Levels

- **Critical**: LTI incidents or high severity
- **High**: Medical treatment incidents or medium severity
- **Normal**: All other incidents

## Automatic Features

### High Priority Alerts

When an incident with:

- Incident type = "lti" OR
- Severity = "high"

The system automatically:

- Sets priority to "critical"
- Logs SMS alert requirement
- Returns alert message in response

### Status Transitions

- **Draft → Submitted**: When description and photos are provided
- **Submitted → Under Investigation**: When investigator is assigned
- **Under Investigation → Investigation Complete**: Manual status update
- **Investigation Complete → Closed**: Manual status update

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the incident creation.

2. **Incident ID Generation**: Use the `/generate-incident-id` endpoint to get a unique incident ID before creating a report.

3. **Quick Save Workflow**: Use quick save for immediate capture, then update with full details later.

4. **Investigation Workflow**: Assign investigators, track follow-up actions, and update statuses as investigations progress.

5. **Alert System**: High priority incidents automatically trigger alert requirements (implement SMS/email service separately).

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Incident ID is required",
      "param": "incidentId",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "Incident report not found"
}
```

### 500 Server Error

```json
{
  "message": "Server error",
  "error": "Error details"
}
```
