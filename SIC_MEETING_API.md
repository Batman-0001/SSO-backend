# SIC Meeting API Documentation

## Overview

The SIC (Site In-Charge) Meeting API provides comprehensive endpoints for managing site meetings with support for draft saving, attendee management, agenda tracking, decision recording, action item management, and digital signatures.

## Base URL

```
/api/sic-meeting
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create SIC Meeting

**POST** `/api/sic-meeting`

Creates a new SIC meeting with full details.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "sic_meeting",
  "meetingDateTime": "2025-01-15T10:00:00.000Z",
  "attendees": [
    {
      "name": "John Smith",
      "empId": "EMP345",
      "contractor": "MEIL"
    },
    {
      "name": "Jane Doe",
      "empId": "EMP456",
      "contractor": "Subcontractor"
    }
  ],
  "agendaPoints": [
    "Safety performance review",
    "Upcoming project milestones",
    "Resource allocation for next phase"
  ],
  "decisions": "Approved additional safety measures for Zone B. Assigned John Smith as safety coordinator. Next meeting scheduled for next Tuesday.",
  "actionOwners": "John Smith - Implement safety measures by Friday\nJane Doe - Prepare resource allocation report by Wednesday",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "status": "completed"
}
```

**Response:**

```json
{
  "message": "SIC meeting submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "sic_meeting",
    "meetingDateTime": "2025-01-15T10:00:00.000Z",
    "attendees": [
      {
        "name": "John Smith",
        "empId": "EMP345",
        "contractor": "MEIL"
      }
    ],
    "agendaPoints": [
      "Safety performance review",
      "Upcoming project milestones"
    ],
    "decisions": "Approved additional safety measures for Zone B...",
    "actionOwners": "John Smith - Implement safety measures...",
    "photos": ["cloudinary-url-1"],
    "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "completed",
    "meetingDuration": 0,
    "nextMeetingDate": null,
    "followUpRequired": false,
    "followUpNotes": "",
    "actionItems": [],
    "meetingType": "daily",
    "location": "",
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
  "message": "SIC meeting saved as draft",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  },
  "status": "draft"
}
```

### 2. Save Draft SIC Meeting

**POST** `/api/sic-meeting/save-draft`

Saves a SIC meeting as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "meetingDateTime": "2025-01-15T10:00:00.000Z",
  "attendees": [],
  "agendaPoints": ["Safety performance review"],
  "decisions": "",
  "actionOwners": "",
  "photos": [],
  "sicSignature": ""
}
```

**Response:**

```json
{
  "message": "SIC meeting saved as draft",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "meetingDateTime": "2025-01-15T10:00:00.000Z",
    "attendees": [],
    "agendaPoints": ["Safety performance review"],
    "decisions": "",
    "actionOwners": "",
    "photos": [],
    "sicSignature": "",
    "status": "draft",
    "meetingDuration": 0,
    "nextMeetingDate": null,
    "followUpRequired": false,
    "followUpNotes": "",
    "actionItems": [],
    "meetingType": "daily",
    "location": "",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 3. Get All SIC Meetings

**GET** `/api/sic-meeting`

Retrieves all SIC meetings with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `meetingType` (optional): Filter by meeting type
- `status` (optional): Filter by status (draft, completed, archived)
- `sortBy` (optional): Sort field (default: "meetingDateTime")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "module": "sic_meeting",
      "meetingDateTime": "2025-01-15T10:00:00.000Z",
      "attendees": [
        {
          "name": "John Smith",
          "empId": "EMP345",
          "contractor": "MEIL"
        }
      ],
      "agendaPoints": ["Safety performance review"],
      "decisions": "Approved additional safety measures...",
      "actionOwners": "John Smith - Implement safety measures...",
      "photos": ["cloudinary-url-1"],
      "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "status": "completed",
      "meetingDuration": 60,
      "nextMeetingDate": "2025-01-22T10:00:00.000Z",
      "followUpRequired": true,
      "followUpNotes": "Review safety implementation progress",
      "actionItems": [
        {
          "_id": "...",
          "description": "Implement safety measures in Zone B",
          "owner": "John Smith",
          "deadline": "2025-01-17T17:00:00.000Z",
          "status": "pending",
          "completedDate": null,
          "notes": ""
        }
      ],
      "meetingType": "daily",
      "location": "Site Office",
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

### 4. Get SIC Meeting by ID

**GET** `/api/sic-meeting/:id`

Retrieves a specific SIC meeting.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "sic_meeting",
    "meetingDateTime": "2025-01-15T10:00:00.000Z",
    "attendees": [
      {
        "name": "John Smith",
        "empId": "EMP345",
        "contractor": "MEIL"
      }
    ],
    "agendaPoints": ["Safety performance review"],
    "decisions": "Approved additional safety measures...",
    "actionOwners": "John Smith - Implement safety measures...",
    "photos": ["cloudinary-url-1"],
    "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "completed",
    "meetingDuration": 60,
    "nextMeetingDate": "2025-01-22T10:00:00.000Z",
    "followUpRequired": true,
    "followUpNotes": "Review safety implementation progress",
    "actionItems": [
      {
        "_id": "...",
        "description": "Implement safety measures in Zone B",
        "owner": "John Smith",
        "deadline": "2025-01-17T17:00:00.000Z",
        "status": "pending",
        "completedDate": null,
        "notes": ""
      }
    ],
    "meetingType": "daily",
    "location": "Site Office",
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

### 5. Update SIC Meeting

**PUT** `/api/sic-meeting/:id`

Updates an existing SIC meeting.

**Request Body:**

```json
{
  "status": "completed",
  "meetingType": "weekly",
  "location": "Updated location",
  "meetingDuration": 90,
  "agendaPoints": ["Updated agenda point 1", "Updated agenda point 2"],
  "decisions": "Updated decisions made during meeting",
  "actionOwners": "Updated action owners and responsibilities",
  "nextMeetingDate": "2025-01-22T10:00:00.000Z",
  "followUpRequired": true,
  "followUpNotes": "Updated follow-up notes",
  "actionItems": [
    {
      "description": "Updated action item description",
      "owner": "John Smith",
      "deadline": "2025-01-20T17:00:00.000Z",
      "notes": "Updated notes"
    }
  ]
}
```

**Response:**

```json
{
  "message": "SIC meeting updated successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "meetingDateTime": "2025-01-15T10:00:00.000Z",
    "attendees": [
      {
        "name": "John Smith",
        "empId": "EMP345",
        "contractor": "MEIL"
      }
    ],
    "agendaPoints": ["Updated agenda point 1", "Updated agenda point 2"],
    "decisions": "Updated decisions made during meeting",
    "actionOwners": "Updated action owners and responsibilities",
    "status": "completed",
    "meetingDuration": 90,
    "nextMeetingDate": "2025-01-22T10:00:00.000Z",
    "followUpRequired": true,
    "followUpNotes": "Updated follow-up notes",
    "actionItems": [
      {
        "_id": "...",
        "description": "Updated action item description",
        "owner": "John Smith",
        "deadline": "2025-01-20T17:00:00.000Z",
        "status": "pending",
        "notes": "Updated notes"
      }
    ],
    "updatedBy": "user-id",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### 6. Delete SIC Meeting

**DELETE** `/api/sic-meeting/:id`

Deletes a SIC meeting. Only admins or the creator can delete meetings.

**Response:**

```json
{
  "message": "SIC meeting deleted successfully"
}
```

### 7. Get SIC Meeting Statistics

**GET** `/api/sic-meeting/stats/overview`

Retrieves comprehensive SIC meeting statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 75,
    "draft": 5,
    "completed": 65,
    "archived": 5,
    "daily": 45,
    "weekly": 15,
    "monthly": 10,
    "special": 3,
    "emergency": 2,
    "followUpRequired": 25,
    "totalActionItems": 150,
    "completedActionItems": 120,
    "pendingActionItems": 30
  }
}
```

### 8. Get Pending Action Items

**GET** `/api/sic-meeting/action-items/pending`

Retrieves all pending action items across meetings.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "meetingId": "meeting-id",
      "meetingDateTime": "2025-01-15T10:00:00.000Z",
      "projectId": "P123",
      "_id": "action-item-id",
      "description": "Implement safety measures in Zone B",
      "owner": "John Smith",
      "deadline": "2025-01-17T17:00:00.000Z",
      "status": "pending",
      "completedDate": null,
      "notes": ""
    }
  ]
}
```

### 9. Get Overdue Action Items

**GET** `/api/sic-meeting/action-items/overdue`

Retrieves all overdue action items.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "meetingId": "meeting-id",
      "meetingDateTime": "2025-01-10T10:00:00.000Z",
      "projectId": "P123",
      "_id": "action-item-id",
      "description": "Complete safety inspection",
      "owner": "Jane Doe",
      "deadline": "2025-01-12T17:00:00.000Z",
      "status": "pending",
      "completedDate": null,
      "notes": ""
    }
  ]
}
```

### 10. Update Action Item Status

**PUT** `/api/sic-meeting/:id/action-item/:actionItemId`

Updates the status of a specific action item.

**Request Body:**

```json
{
  "status": "completed",
  "notes": "Safety inspection completed successfully"
}
```

**Response:**

```json
{
  "message": "Action item updated successfully",
  "data": {
    "_id": "...",
    "actionItems": [
      {
        "_id": "action-item-id",
        "description": "Complete safety inspection",
        "owner": "Jane Doe",
        "deadline": "2025-01-12T17:00:00.000Z",
        "status": "completed",
        "completedDate": "2025-01-15T14:30:00.000Z",
        "notes": "Safety inspection completed successfully"
      }
    ]
  }
}
```

## Data Models

### SIC Meeting Status

- `draft`: Meeting saved but not yet completed
- `completed`: Meeting completed and finalized
- `archived`: Meeting archived for historical reference

### Meeting Types

- `daily`: Daily site meetings
- `weekly`: Weekly progress meetings
- `monthly`: Monthly review meetings
- `special`: Special purpose meetings
- `emergency`: Emergency response meetings

### Action Item Status

- `pending`: Action item not started
- `in_progress`: Action item in progress
- `completed`: Action item completed

### Attendee Structure

```json
{
  "name": "Full name of attendee",
  "empId": "Employee ID or contractor reference",
  "contractor": "MEIL, Subcontractor, Visitor, etc."
}
```

### Action Item Structure

```json
{
  "description": "Detailed description of action required",
  "owner": "Person responsible for completion",
  "deadline": "ISO8601 deadline date",
  "status": "pending|in_progress|completed",
  "completedDate": "ISO8601 completion date (if completed)",
  "notes": "Additional notes or comments"
}
```

## Validation Rules

### Required Fields (All Statuses)

- `projectId`: String, not empty
- `meetingDateTime`: Valid ISO8601 date

### Required Fields (Completed Status Only)

- `attendees`: Array with at least one attendee
- `decisions`: String, not empty
- `sicSignature`: String, not empty

### Optional Fields

- `agendaPoints`: Array of agenda items
- `actionOwners`: String description of action owners
- `photos`: Array of Cloudinary URLs
- `meetingType`: Meeting type enum
- `location`: Meeting location
- `meetingDuration`: Duration in minutes
- `nextMeetingDate`: ISO8601 date for next meeting
- `followUpRequired`: Boolean flag
- `followUpNotes`: String notes
- `actionItems`: Array of action items

### Conditional Validation

- **Attendees**: Required for completed status, optional for drafts
- **Decisions**: Required for completed status, optional for drafts
- **SIC Signature**: Required for completed status, optional for drafts
- **Action Items**: If provided, must have description, owner, and deadline

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Valid meeting date and time is required",
      "param": "meetingDateTime",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "SIC meeting not found"
}
```

### 403 Forbidden

```json
{
  "message": "Not authorized to delete this SIC meeting"
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

- `meetingDateTime` → `meetingDateTime` (DateTime field)
- `attendees` → `attendees` (Array of attendee objects)
- `agendaPoints` → `agendaPoints` (Array of strings)
- `decisions` → `decisions` (String field)
- `actionOwners` → `actionOwners` (String field)
- `photos` → `photos` (Array of Cloudinary URLs)
- `sicSignature` → `sicSignature` (Base64 signature or Cloudinary URL)

### Usage Examples

#### Save Draft

```javascript
// Use /save-draft endpoint for "Save Draft" button
const saveDraft = async (formData) => {
  const response = await fetch("/api/sic-meeting/save-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      meetingDateTime: formData.meetingDateTime,
      attendees: formData.attendees,
      agendaPoints: formData.agendaPoints,
      decisions: formData.decisions || "",
      actionOwners: formData.actionOwners || "",
      photos: formData.photos,
      sicSignature: formData.sicSignature || "",
    }),
  });
};
```

#### Submit Complete

```javascript
// Use main POST endpoint for "Submit" button
const submitMeeting = async (formData) => {
  const response = await fetch("/api/sic-meeting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      meetingDateTime: formData.meetingDateTime,
      attendees: formData.attendees,
      agendaPoints: formData.agendaPoints,
      decisions: formData.decisions,
      actionOwners: formData.actionOwners || "",
      photos: formData.photos,
      sicSignature: formData.sicSignature,
      status: "completed",
    }),
  });
};
```

#### Update Action Item

```javascript
// Update action item status
const updateActionItem = async (meetingId, actionItemId, status, notes) => {
  const response = await fetch(
    `/api/sic-meeting/${meetingId}/action-item/${actionItemId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        notes,
      }),
    }
  );
};
```

## Advanced Features

### Action Item Management

- **Automatic Status Tracking**: Action items automatically track completion dates
- **Overdue Detection**: Built-in overdue action item identification
- **Progress Monitoring**: Track pending vs completed action items
- **Deadline Management**: Automatic deadline validation and tracking

### Meeting Analytics

- **Meeting Type Distribution**: Statistics by meeting type (daily, weekly, monthly, etc.)
- **Action Item Metrics**: Total, pending, and completed action item counts
- **Follow-up Tracking**: Meetings requiring follow-up identification
- **Attendance Patterns**: Attendee tracking and analysis

### Workflow Management

- **Draft to Complete**: Seamless transition from draft to completed status
- **Follow-up Scheduling**: Automatic next meeting scheduling
- **Archive Management**: Historical meeting archiving
- **Digital Signatures**: SIC authorization with signature validation

## Notes

- SIC Meetings are critical for project coordination and safety management
- Digital signature is mandatory for completed meetings
- All timestamps are in ISO8601 format
- Photos should be uploaded to Cloudinary and URLs provided
- The API supports both draft saving and full submission workflows
- Action item tracking provides comprehensive project management capabilities
- Meeting statistics help identify patterns and improve coordination
- Follow-up scheduling ensures continuity in project management
- Attendee management supports both MEIL and subcontractor personnel tracking
