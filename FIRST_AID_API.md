# First Aid Case API Documentation

## Overview

The First Aid Case API provides endpoints for managing first aid incidents with support for draft saving, hospital transport tracking, witness management, and comprehensive case workflow.

## Base URL

```
/api/first-aid
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create First Aid Case

**POST** `/api/first-aid`

Creates a new first aid case with full details or as a draft.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "first_aid",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "victimName": "John Doe",
  "victimEmpId": "EMP123",
  "injuryType": "Cut on hand",
  "cause": "Slipped while carrying tools",
  "treatmentGiven": "Cleaned wound, applied bandage",
  "transportToHospital": false,
  "hospitalName": "",
  "hospitalDetails": "",
  "witnessNames": ["Jane Smith", "Bob Johnson"],
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "status": "reported"
}
```

**Response:**

```json
{
  "message": "First-aid case submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "first_aid",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "victimName": "John Doe",
    "victimEmpId": "EMP123",
    "injuryType": "Cut on hand",
    "cause": "Slipped while carrying tools",
    "treatmentGiven": "Cleaned wound, applied bandage",
    "transportToHospital": false,
    "hospitalName": "",
    "hospitalDetails": "",
    "witnessNames": ["Jane Smith", "Bob Johnson"],
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "reported",
    "createdBy": "...",
    "createdAt": "2025-01-15T14:35:00.000Z",
    "updatedAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Save Draft

**POST** `/api/first-aid/save-draft`

Saves a first aid case as draft with minimal validation (only projectId and dateTime required).

**Request Body:**

```json
{
  "projectId": "P123",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "victimName": "",
  "victimEmpId": "",
  "injuryType": "",
  "cause": "",
  "treatmentGiven": "",
  "transportToHospital": false,
  "hospitalName": "",
  "hospitalDetails": "",
  "witnessNames": [],
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

### 3. Get All First Aid Cases

**GET** `/api/first-aid`

Retrieves all first aid cases with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `injuryType` (optional): Filter by injury type
- `status` (optional): Filter by status (draft, reported, investigated, closed)
- `transportToHospital` (optional): Filter by hospital transport (true/false)
- `victimEmpId` (optional): Filter by victim employee ID
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
      "victimName": "John Doe",
      "injuryType": "Cut on hand",
      "status": "reported",
      "transportToHospital": false
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

### 4. Get Single First Aid Case

**GET** `/api/first-aid/:id`

Retrieves a specific first aid case with all details.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "first_aid",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "victimName": "John Doe",
    "victimEmpId": "EMP123",
    "injuryType": "Cut on hand",
    "cause": "Slipped while carrying tools",
    "treatmentGiven": "Cleaned wound, applied bandage",
    "transportToHospital": false,
    "hospitalName": "",
    "hospitalDetails": "",
    "witnessNames": ["Jane Smith", "Bob Johnson"],
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "reported",
    "investigationNotes": "",
    "followUpRequired": false,
    "followUpDate": null,
    "followUpNotes": "",
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

### 5. Update First Aid Case

**PUT** `/api/first-aid/:id`

Updates an existing first aid case.

**Request Body:** (Same as create, but all fields are optional)

### 6. Delete First Aid Case

**DELETE** `/api/first-aid/:id`

Deletes a first aid case. Only admin users or the creator can delete cases.

### 7. Get Statistics Overview

**GET** `/api/first-aid/stats/overview`

Retrieves comprehensive statistics about first aid cases.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 10,
    "reported": 80,
    "investigated": 40,
    "closed": 20,
    "hospitalTransports": 15,
    "followUpRequired": 25,
    "followUpDue": 5
  }
}
```

### 8. Get Popular Injury Types

**GET** `/api/first-aid/injury-types/popular`

Retrieves most common injury types with statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `limit` (optional): Number of results (default: 10)

**Response:**

```json
{
  "data": [
    {
      "_id": "Cut on hand",
      "count": 25,
      "hospitalTransports": 3,
      "avgWitnessCount": 1.2
    },
    {
      "_id": "Bruise",
      "count": 20,
      "hospitalTransports": 1,
      "avgWitnessCount": 0.8
    }
  ]
}
```

### 9. Get Due Follow-ups

**GET** `/api/first-aid/follow-up/due`

Retrieves cases with due follow-ups.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "victimName": "John Doe",
      "injuryType": "Cut on hand",
      "followUpDate": "2025-01-10T00:00:00.000Z",
      "followUpNotes": "Check healing progress",
      "status": "investigated"
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

- `victimName`: Victim's full name
- `victimEmpId`: Employee or contractor ID
- `injuryType`: Type of injury sustained
- `cause`: How the injury occurred
- `treatmentGiven`: First aid treatment provided

### Conditional Validation:

- If `transportToHospital` is true, then `hospitalName` is required

### Draft vs Submitted:

- **Draft**: Only `projectId` and `dateTime` required, can be saved with minimal data
- **Submitted**: All required fields must be filled, triggers full validation

## Status Values

- `draft`: Case is being prepared, minimal validation
- `reported`: Case is submitted and awaiting investigation
- `investigated`: Investigation is complete
- `closed`: Case is closed and resolved

## Hospital Transport Logic

When `transportToHospital` is true:

- `hospitalName` becomes required
- `hospitalDetails` can provide additional information
- Case severity is automatically classified as "serious"
- May trigger additional notifications or follow-up requirements

## Witness Management

- `witnessNames` is an array of strings
- Empty witness names are automatically filtered out
- Frontend can dynamically add/remove witnesses
- Witness count is tracked in virtual fields

## Follow-up System

- `followUpRequired`: Boolean flag for follow-up needed
- `followUpDate`: Date when follow-up should occur
- `followUpNotes`: Additional notes about follow-up
- Due follow-ups can be queried separately
- Follow-up status affects case workflow

## Integration Notes

1. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first, then include the returned URLs in the first aid case creation.

2. **Draft Workflow**: Use the `/save-draft` endpoint for quick saves with minimal data, then update with full details later.

3. **Status Management**: Cases automatically transition from draft to reported when all required fields are provided.

4. **Hospital Transport**: Conditional validation ensures hospital details are captured when transport occurs.

5. **Witness Management**: Dynamic witness arrays support flexible witness collection.

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
  "message": "First-aid case not found"
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

- **Incident Details**: All basic fields supported
- **Hospital Transport**: Switch-based transport tracking with conditional validation
- **Witnesses**: Dynamic witness management with add/remove functionality
- **Photos**: Photo picker integration with Cloudinary URLs
- **Draft Saving**: Local storage + server-side draft persistence
- **Validation**: Client-side and server-side validation aligned
