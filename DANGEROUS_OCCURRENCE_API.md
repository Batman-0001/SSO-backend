# Dangerous Occurrence Report API Documentation

## Overview

The Dangerous Occurrence Report API provides endpoints for managing dangerous occurrence incidents with support for draft saving, investigation management, Head Office notification, and comprehensive regulatory compliance tracking.

## Base URL

```
/api/dangerous-occurrence
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Dangerous Occurrence Report

**POST** `/api/dangerous-occurrence`

Creates a new dangerous occurrence report with full details or as a draft.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "dangerous_occurrence",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "location": "Zone A - Main Construction Area",
  "situation": "Crane nearly toppled due to improper ground preparation",
  "potentialConsequence": "Could have resulted in multiple fatalities and major equipment damage",
  "preventiveActions": "Implement proper ground assessment and crane setup procedures",
  "reportedBy": "John Smith (EMP345)",
  "investigationRequired": true,
  "severity": "critical",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "reported"
}
```

**Response:**

```json
{
  "message": "Dangerous occurrence submitted successfully. Head Office has been notified.",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "dangerous_occurrence",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "location": "Zone A - Main Construction Area",
    "situation": "Crane nearly toppled due to improper ground preparation",
    "potentialConsequence": "Could have resulted in multiple fatalities and major equipment damage",
    "preventiveActions": "Implement proper ground assessment and crane setup procedures",
    "reportedBy": "John Smith (EMP345)",
    "investigationRequired": true,
    "severity": "critical",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "reported",
    "headOfficeNotified": true,
    "headOfficeNotificationDate": "2025-01-15T14:35:00.000Z",
    "createdBy": "...",
    "createdAt": "2025-01-15T14:35:00.000Z",
    "updatedAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Save Draft

**POST** `/api/dangerous-occurrence/save-draft`

Saves a dangerous occurrence report as draft with minimal validation (only projectId and dateTime required).

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
  "investigationRequired": false,
  "severity": "high",
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

### 3. Get All Dangerous Occurrence Reports

**GET** `/api/dangerous-occurrence`

Retrieves all dangerous occurrence reports with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `status` (optional): Filter by status (draft, reported, under_investigation, investigation_complete, closed)
- `investigationRequired` (optional): Filter by investigation requirement (true/false)
- `headOfficeNotified` (optional): Filter by head office notification (true/false)
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
      "situation": "Crane nearly toppled",
      "severity": "critical",
      "status": "reported",
      "investigationRequired": true,
      "headOfficeNotified": true
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

### 4. Get Single Dangerous Occurrence Report

**GET** `/api/dangerous-occurrence/:id`

Retrieves a specific dangerous occurrence report with all details.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "dangerous_occurrence",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "location": "Zone A - Main Construction Area",
    "situation": "Crane nearly toppled due to improper ground preparation",
    "potentialConsequence": "Could have resulted in multiple fatalities and major equipment damage",
    "preventiveActions": "Implement proper ground assessment and crane setup procedures",
    "reportedBy": "John Smith (EMP345)",
    "investigationRequired": true,
    "severity": "critical",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "reported",
    "investigationNotes": "",
    "investigator": "",
    "investigationStartDate": null,
    "investigationEndDate": null,
    "investigationFindings": "",
    "rootCause": "",
    "correctiveActions": "",
    "actionOwner": "",
    "actionDeadline": null,
    "actionCompleted": false,
    "actionCompletedDate": null,
    "headOfficeNotified": true,
    "headOfficeNotificationDate": "2025-01-15T14:35:00.000Z",
    "headOfficeResponse": "",
    "regulatoryReportRequired": false,
    "regulatoryReportSubmitted": false,
    "regulatoryReportDate": null,
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

### 5. Update Dangerous Occurrence Report

**PUT** `/api/dangerous-occurrence/:id`

Updates an existing dangerous occurrence report.

**Request Body:** (Same as create, but all fields are optional)

### 6. Delete Dangerous Occurrence Report

**DELETE** `/api/dangerous-occurrence/:id`

Deletes a dangerous occurrence report. Only admin users or the creator can delete reports.

### 7. Get Statistics Overview

**GET** `/api/dangerous-occurrence/stats/overview`

Retrieves comprehensive statistics about dangerous occurrence reports.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 25,
    "draft": 2,
    "reported": 15,
    "underInvestigation": 5,
    "investigationComplete": 2,
    "closed": 1,
    "low": 2,
    "medium": 8,
    "high": 10,
    "critical": 5,
    "investigationRequired": 12,
    "headOfficeNotified": 12,
    "regulatoryReportRequired": 3,
    "regulatoryReportSubmitted": 1,
    "actionsCompleted": 8,
    "actionsOverdue": 2
  }
}
```

### 8. Get Active Investigations

**GET** `/api/dangerous-occurrence/investigations/active`

Retrieves dangerous occurrence reports currently under investigation.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "location": "Zone A",
      "situation": "Crane nearly toppled",
      "investigator": "Safety Manager",
      "investigationStartDate": "2025-01-15T15:00:00.000Z",
      "status": "under_investigation"
      // ... other fields
    }
  ]
}
```

### 9. Get Overdue Actions

**GET** `/api/dangerous-occurrence/actions/overdue`

Retrieves dangerous occurrence reports with overdue corrective actions.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "location": "Zone A",
      "situation": "Crane nearly toppled",
      "actionOwner": "Site Manager",
      "actionDeadline": "2025-01-10T00:00:00.000Z",
      "correctiveActions": "Implement proper ground assessment procedures"
      // ... other fields
    }
  ]
}
```

### 10. Get Pending Regulatory Reports

**GET** `/api/dangerous-occurrence/regulatory/pending`

Retrieves dangerous occurrence reports requiring regulatory submissions.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "location": "Zone A",
      "situation": "Major equipment failure",
      "severity": "critical",
      "regulatoryReportRequired": true,
      "regulatoryReportSubmitted": false,
      "dateTime": "2025-01-15T14:30:00.000Z"
      // ... other fields
    }
  ]
}
```

## Data Validation

### Required Fields for Creation:

- `projectId`: Project identifier
- `dateTime`: Valid ISO 8601 date

### Required Fields for Submission (status != "draft"):

- `location`: Where the dangerous occurrence happened
- `situation`: Detailed description of what happened
- `potentialConsequence`: What could have happened
- `preventiveActions`: Suggested preventive measures
- `reportedBy`: Person who reported the occurrence

### Draft vs Submitted:

- **Draft**: Only `projectId` and `dateTime` required, can be saved with minimal data
- **Submitted**: All required fields must be filled, triggers full validation

## Status Values

- `draft`: Report is being prepared, minimal validation
- `reported`: Report is submitted and awaiting review
- `under_investigation`: Formal investigation is in progress
- `investigation_complete`: Investigation is finished
- `closed`: All actions completed and case resolved

## Severity Levels

- `low`: Minor dangerous occurrence with minimal potential consequences
- `medium`: Moderate dangerous occurrence with moderate potential consequences
- `high`: Significant dangerous occurrence with serious potential consequences
- `critical`: Major dangerous occurrence with potentially fatal consequences

## Investigation Management

### Investigation Process:

1. **Reported**: Initial submission with investigation requirement flag
2. **Under Investigation**: Formal investigation started with assigned investigator
3. **Investigation Complete**: Investigation finished with findings documented
4. **Closed**: Corrective actions completed and lessons learned

### Investigation Fields:

- `investigationRequired`: Boolean flag for investigation need
- `investigator`: Person assigned to conduct investigation
- `investigationStartDate`: When investigation began
- `investigationEndDate`: When investigation was completed
- `investigationNotes`: Initial notes about the investigation
- `investigationFindings`: Detailed findings from investigation
- `rootCause`: Root cause analysis results
- `correctiveActions`: Actions to prevent recurrence

## Head Office Notification

### Automatic Notification:

- When `investigationRequired` is true and report is submitted
- Head Office is automatically notified via pre-save hook
- `headOfficeNotified` and `headOfficeNotificationDate` are set automatically

### Head Office Response:

- `headOfficeResponse`: Response from Head Office
- Can be updated through the PUT endpoint

## Regulatory Compliance

### Regulatory Reporting:

- `regulatoryReportRequired`: Boolean flag for regulatory submission need
- `regulatoryReportSubmitted`: Whether report has been submitted
- `regulatoryReportDate`: When regulatory report was submitted

### Compliance Tracking:

- Automatic tracking of regulatory requirements
- Pending reports can be queried separately
- Submission status monitoring

## Action Management

### Corrective Actions:

- `actionOwner`: Person responsible for implementing actions
- `actionDeadline`: When actions must be completed
- `actionCompleted`: Boolean flag for completion status
- `actionCompletedDate`: When actions were completed

### Action Tracking:

- Overdue actions can be queried separately
- Automatic deadline monitoring
- Completion status tracking

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the dangerous occurrence report creation.

2. **Draft Workflow**: Use the `/save-draft` endpoint for quick saves with minimal data, then update with full details later.

3. **Investigation Workflow**: Reports with `investigationRequired: true` automatically trigger Head Office notification.

4. **Status Management**: Reports automatically transition from draft to reported when all required fields are provided.

5. **Regulatory Compliance**: Track regulatory reporting requirements and submission status.

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
  "message": "Dangerous occurrence not found"
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

- **Occurrence Details**: All basic fields supported (location, situation, potential consequence, preventive actions)
- **Investigation**: Switch-based investigation requirement with automatic Head Office notification
- **Photos**: Photo picker integration with Cloudinary URLs
- **Draft Saving**: Local storage + server-side draft persistence
- **Validation**: Client-side and server-side validation aligned

## Key Features

1. **Draft Support**: Save incomplete reports for later completion
2. **Investigation Management**: Complete investigation workflow from start to completion
3. **Head Office Notification**: Automatic notification when investigation is required
4. **Regulatory Compliance**: Track regulatory reporting requirements
5. **Action Tracking**: Monitor corrective action implementation
6. **Severity Assessment**: Risk-based categorization of dangerous occurrences
7. **Comprehensive Statistics**: Detailed analytics for safety improvement
8. **Overdue Monitoring**: Track overdue investigations and actions
