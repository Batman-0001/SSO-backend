# Safety Observation API Documentation

## Overview

The Safety Observation API provides endpoints for managing safety observations with support for draft saving, severity-based corrective action requirements, digital signatures, and comprehensive workflow management.

## Base URL

```
/api/safety-observations
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Safety Observation

**POST** `/api/safety-observations`

Creates a new safety observation with full details or as a draft.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "safety_observation",
  "type": "unsafe_act",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "location": "Zone A - Crane 3",
  "observedBy": "John Smith (EMP345)",
  "observedPerson": "Bob Johnson (Contractor)",
  "severity": "High",
  "description": "Worker was not wearing hard hat while working under crane operations. This could result in serious head injury if any objects fall from the crane.",
  "correctiveAction": "Immediately provided hard hat and instructed worker on safety requirements",
  "actionOwner": "site_incharge",
  "targetClosureDate": "2025-01-20T00:00:00.000Z",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "signature": "base64-signature-data",
  "status": "open"
}
```

**Response:**

```json
{
  "message": "Safety observation submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "safety_observation",
    "type": "unsafe_act",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "location": "Zone A - Crane 3",
    "observedBy": "John Smith (EMP345)",
    "observedPerson": "Bob Johnson (Contractor)",
    "severity": "High",
    "description": "Worker was not wearing hard hat while working under crane operations...",
    "correctiveAction": "Immediately provided hard hat and instructed worker on safety requirements",
    "actionOwner": "site_incharge",
    "targetClosureDate": "2025-01-20T00:00:00.000Z",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "signature": "base64-signature-data",
    "status": "open",
    "createdBy": "...",
    "createdAt": "2025-01-15T14:35:00.000Z",
    "updatedAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Save Draft

**POST** `/api/safety-observations/save-draft`

Saves a safety observation as draft with minimal validation (only projectId and dateTime required).

**Request Body:**

```json
{
  "projectId": "P123",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "type": "",
  "location": "",
  "observedBy": "",
  "observedPerson": "",
  "severity": "",
  "description": "",
  "correctiveAction": "",
  "actionOwner": "",
  "targetClosureDate": "",
  "photos": [],
  "signature": ""
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

### 3. Get All Safety Observations

**GET** `/api/safety-observations`

Retrieves all safety observations with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `severity` (optional): Filter by severity (Low, Medium, High, Critical)
- `status` (optional): Filter by status (draft, open, in_progress, closed, cancelled)
- `sortBy` (optional): Sort field (default: "createdAt")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "dateTime": "2025-01-15T14:30:00.000Z",
      "location": "Zone A - Crane 3",
      "type": "unsafe_act",
      "severity": "High",
      "status": "open",
      "observedBy": "John Smith (EMP345)"
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

### 4. Get Single Safety Observation

**GET** `/api/safety-observations/:id`

Retrieves a specific safety observation with all details.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "safety_observation",
    "type": "unsafe_act",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "location": "Zone A - Crane 3",
    "observedBy": "John Smith (EMP345)",
    "observedPerson": "Bob Johnson (Contractor)",
    "severity": "High",
    "description": "Worker was not wearing hard hat while working under crane operations...",
    "correctiveAction": "Immediately provided hard hat and instructed worker on safety requirements",
    "actionOwner": "site_incharge",
    "targetClosureDate": "2025-01-20T00:00:00.000Z",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "signature": "base64-signature-data",
    "status": "open",
    "assignedTo": "",
    "closureDate": null,
    "closureNotes": "",
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

### 5. Update Safety Observation

**PUT** `/api/safety-observations/:id`

Updates an existing safety observation.

**Request Body:** (Same as create, but all fields are optional)

### 6. Delete Safety Observation

**DELETE** `/api/safety-observations/:id`

Deletes a safety observation. Only admin users or the creator can delete observations.

### 7. Get Statistics Overview

**GET** `/api/safety-observations/stats/overview`

Retrieves comprehensive statistics about safety observations.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 10,
    "open": 80,
    "inProgress": 30,
    "closed": 25,
    "cancelled": 5,
    "low": 60,
    "medium": 50,
    "high": 30,
    "critical": 10
  }
}
```

## Data Validation

### Required Fields for Creation:

- `projectId`: Project identifier
- `dateTime`: Valid ISO 8601 date

### Required Fields for Submission (status != "draft"):

- `type`: Observation type (unsafe_act, unsafe_condition)
- `location`: Where the observation occurred
- `observedBy`: Person who made the observation
- `severity`: Severity level (Low, Medium, High, Critical)
- `description`: Detailed description (minimum 10 characters)
- `actionOwner`: Who is responsible for action (site_incharge, contractor_rep, other)

### Conditional Validation:

- If severity is Medium, High, or Critical, then `correctiveAction` is required
- Description must be at least 10 characters long
- Maximum 6 photos allowed

### Draft vs Submitted:

- **Draft**: Only `projectId` and `dateTime` required, can be saved with minimal data
- **Submitted**: All required fields must be filled, triggers full validation

## Status Values

- `draft`: Observation is being prepared, minimal validation
- `open`: Observation is submitted and awaiting action
- `in_progress`: Action is being implemented
- `closed`: Action completed and observation closed
- `cancelled`: Observation cancelled

## Observation Types

- `unsafe_act`: Observation of unsafe behavior or practices
- `unsafe_condition`: Observation of unsafe environmental conditions

## Severity Levels

- `Low`: Minor safety concern with minimal risk
- `Medium`: Moderate safety concern requiring attention
- `High`: Significant safety concern requiring immediate action
- `Critical`: Critical safety concern requiring urgent intervention

## Action Owners

- `site_incharge`: Site supervisor or manager
- `contractor_rep`: Contractor representative
- `other`: Other designated person

## Workflow Management

### Observation Process:

1. **Draft**: Initial observation being prepared
2. **Open**: Observation submitted and awaiting action assignment
3. **In Progress**: Action is being implemented
4. **Closed**: Action completed and observation resolved
5. **Cancelled**: Observation cancelled (if not applicable)

### Action Management:

- `correctiveAction`: Description of immediate action taken
- `actionOwner`: Person responsible for implementing the action
- `targetClosureDate`: Expected completion date
- `assignedTo`: Person assigned to handle the observation
- `closureDate`: When the observation was actually closed
- `closureNotes`: Notes about how the observation was resolved

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the safety observation creation.

2. **Draft Workflow**: Use the `/save-draft` endpoint for quick saves with minimal data, then update with full details later.

3. **Signature Integration**: Digital signatures can be captured as base64 strings or uploaded to Cloudinary.

4. **Severity Validation**: Corrective actions are automatically required for Medium, High, and Critical severity observations.

5. **Status Management**: Observations automatically transition from draft to open when all required fields are provided.

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
  "message": "Safety observation not found"
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

- **Observation Details**: All basic fields supported (type, location, observed by, observed person)
- **Severity Assessment**: Radio button selection with conditional validation
- **Description**: Text area with character count validation (minimum 10)
- **Corrective Action**: Conditional requirement for Medium/High/Critical severity
- **Action Owner**: Dropdown selection for responsibility assignment
- **Target Closure Date**: Date picker for expected completion
- **Photos**: Photo picker integration with Cloudinary URLs (max 6)
- **Signature**: Digital signature capture and storage
- **Draft Saving**: Local storage + server-side draft persistence

## Key Features

1. **Draft Support**: Save incomplete observations for later completion
2. **Severity-Based Validation**: Automatic corrective action requirements
3. **Digital Signatures**: Capture and store digital signatures
4. **Photo Evidence**: Up to 6 photos with Cloudinary integration
5. **Action Tracking**: Complete workflow from observation to closure
6. **Flexible Assignment**: Multiple action owner options
7. **Comprehensive Statistics**: Detailed analytics for safety improvement
8. **Character Validation**: Minimum description length enforcement
