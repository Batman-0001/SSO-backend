# Good Practice API Documentation

## Overview

The Good Practice API provides comprehensive endpoints for managing good safety practices with support for draft saving, award tracking, recognition management, team sharing, and comprehensive analytics. This system encourages positive safety behaviors across the project.

## Base URL

```
/api/good-practice
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Good Practice

**POST** `/api/good-practice`

Creates a new good practice with full details.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "good_practice",
  "date": "2025-01-15T00:00:00.000Z",
  "title": "Innovative Safety Harness Usage",
  "description": "Worker John Smith demonstrated exceptional safety awareness by implementing a double-check system for harness connections before working at height. This practice significantly reduced the risk of fall incidents and improved overall safety culture on the site.",
  "awardable": true,
  "personsCredited": "John Smith - Lead Safety Officer, Team Alpha",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "category": "safety",
  "impactLevel": "project_wide",
  "tags": ["safety", "innovation", "harness", "height-work"],
  "status": "submitted"
}
```

**Response:**

```json
{
  "message": "Good practice submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "good_practice",
    "date": "2025-01-15T00:00:00.000Z",
    "title": "Innovative Safety Harness Usage",
    "description": "Worker John Smith demonstrated exceptional safety awareness...",
    "awardable": true,
    "personsCredited": "John Smith - Lead Safety Officer, Team Alpha",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "status": "submitted",
    "category": "safety",
    "impactLevel": "project_wide",
    "reviewNotes": "",
    "reviewedBy": "",
    "reviewedAt": null,
    "awardType": "recognition",
    "awardValue": 0,
    "awardDate": null,
    "awardNotes": "",
    "sharedWithTeam": false,
    "sharedDate": null,
    "sharedNotes": "",
    "tags": ["safety", "innovation", "harness", "height-work"],
    "likes": 0,
    "views": 0,
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "status": "submitted"
}
```

**Draft Response:**

```json
{
  "message": "Good practice saved as draft",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  },
  "status": "draft"
}
```

### 2. Save Draft Good Practice

**POST** `/api/good-practice/save-draft`

Saves a good practice as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "date": "2025-01-15T00:00:00.000Z",
  "title": "",
  "description": "",
  "awardable": false,
  "personsCredited": "",
  "photos": [],
  "category": "safety",
  "impactLevel": "local",
  "tags": []
}
```

**Response:**

```json
{
  "message": "Good practice saved as draft",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "date": "2025-01-15T00:00:00.000Z",
    "title": "",
    "description": "",
    "awardable": false,
    "personsCredited": "",
    "photos": [],
    "status": "draft",
    "category": "safety",
    "impactLevel": "local",
    "reviewNotes": "",
    "reviewedBy": "",
    "reviewedAt": null,
    "awardType": "recognition",
    "awardValue": 0,
    "awardDate": null,
    "awardNotes": "",
    "sharedWithTeam": false,
    "sharedDate": null,
    "sharedNotes": "",
    "tags": [],
    "likes": 0,
    "views": 0,
    "createdBy": "user-id",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 3. Get All Good Practices

**GET** `/api/good-practice`

Retrieves all good practices with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `category` (optional): Filter by category
- `status` (optional): Filter by status (draft, submitted, under_review, approved, awarded, rejected)
- `awardable` (optional): Filter by awardable practices (true/false)
- `impactLevel` (optional): Filter by impact level
- `sortBy` (optional): Sort field (default: "date")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "module": "good_practice",
      "date": "2025-01-15T00:00:00.000Z",
      "title": "Innovative Safety Harness Usage",
      "description": "Worker John Smith demonstrated exceptional safety awareness...",
      "awardable": true,
      "personsCredited": "John Smith - Lead Safety Officer, Team Alpha",
      "photos": ["cloudinary-url-1"],
      "status": "approved",
      "category": "safety",
      "impactLevel": "project_wide",
      "reviewNotes": "Excellent initiative that demonstrates proactive safety thinking",
      "reviewedBy": "Safety Manager - Jane Doe",
      "reviewedAt": "2025-01-16T14:30:00.000Z",
      "awardType": "recognition",
      "awardValue": 0,
      "awardDate": null,
      "awardNotes": "",
      "sharedWithTeam": true,
      "sharedDate": "2025-01-16T15:00:00.000Z",
      "sharedNotes": "Automatically shared upon approval",
      "tags": ["safety", "innovation", "harness", "height-work"],
      "likes": 15,
      "views": 45,
      "createdBy": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "employeeId": "EMP123"
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-16T15:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 4. Get Good Practice by ID

**GET** `/api/good-practice/:id`

Retrieves a specific good practice and increments view count.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "good_practice",
    "date": "2025-01-15T00:00:00.000Z",
    "title": "Innovative Safety Harness Usage",
    "description": "Worker John Smith demonstrated exceptional safety awareness...",
    "awardable": true,
    "personsCredited": "John Smith - Lead Safety Officer, Team Alpha",
    "photos": ["cloudinary-url-1"],
    "status": "approved",
    "category": "safety",
    "impactLevel": "project_wide",
    "reviewNotes": "Excellent initiative that demonstrates proactive safety thinking",
    "reviewedBy": "Safety Manager - Jane Doe",
    "reviewedAt": "2025-01-16T14:30:00.000Z",
    "awardType": "recognition",
    "awardValue": 0,
    "awardDate": null,
    "awardNotes": "",
    "sharedWithTeam": true,
    "sharedDate": "2025-01-16T15:00:00.000Z",
    "sharedNotes": "Automatically shared upon approval",
    "tags": ["safety", "innovation", "harness", "height-work"],
    "likes": 15,
    "views": 46,
    "createdBy": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "employeeId": "EMP123"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-16T15:00:00.000Z"
  }
}
```

### 5. Update Good Practice

**PUT** `/api/good-practice/:id`

Updates an existing good practice.

**Request Body:**

```json
{
  "status": "approved",
  "category": "safety",
  "impactLevel": "project_wide",
  "title": "Updated title",
  "description": "Updated description",
  "personsCredited": "Updated credit information",
  "reviewNotes": "Updated review notes",
  "reviewedBy": "Safety Manager - Jane Doe",
  "awardType": "certificate",
  "awardValue": 500,
  "awardNotes": "Certificate and monetary reward for exceptional safety initiative",
  "sharedWithTeam": true,
  "sharedNotes": "Shared with entire project team",
  "tags": ["safety", "innovation", "harness", "height-work", "updated"]
}
```

**Response:**

```json
{
  "message": "Good practice updated successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "title": "Updated title",
    "description": "Updated description",
    "personsCredited": "Updated credit information",
    "status": "approved",
    "category": "safety",
    "impactLevel": "project_wide",
    "reviewNotes": "Updated review notes",
    "reviewedBy": "Safety Manager - Jane Doe",
    "reviewedAt": "2025-01-16T14:30:00.000Z",
    "awardType": "certificate",
    "awardValue": 500,
    "awardNotes": "Certificate and monetary reward for exceptional safety initiative",
    "sharedWithTeam": true,
    "sharedDate": "2025-01-16T15:00:00.000Z",
    "sharedNotes": "Shared with entire project team",
    "tags": ["safety", "innovation", "harness", "height-work", "updated"],
    "updatedBy": "user-id",
    "updatedAt": "2025-01-16T15:00:00.000Z"
  }
}
```

### 6. Delete Good Practice

**DELETE** `/api/good-practice/:id`

Deletes a good practice. Only admins or the creator can delete practices.

**Response:**

```json
{
  "message": "Good practice deleted successfully"
}
```

### 7. Like Good Practice

**PUT** `/api/good-practice/:id/like`

Increments the like count for a good practice.

**Response:**

```json
{
  "message": "Good practice liked successfully",
  "data": {
    "likes": 16
  }
}
```

### 8. Get Good Practice Statistics

**GET** `/api/good-practice/stats/overview`

Retrieves comprehensive good practice statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 75,
    "draft": 5,
    "submitted": 15,
    "underReview": 10,
    "approved": 35,
    "awarded": 8,
    "rejected": 2,
    "awardable": 25,
    "safety": 40,
    "environmental": 15,
    "efficiency": 10,
    "innovation": 5,
    "teamwork": 3,
    "leadership": 2,
    "totalLikes": 450,
    "totalViews": 1250,
    "sharedWithTeam": 30
  }
}
```

### 9. Get Pending Awards

**GET** `/api/good-practice/awards/pending`

Retrieves awardable practices pending review.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "date": "2025-01-15T00:00:00.000Z",
      "title": "Innovative Safety Harness Usage",
      "description": "Worker John Smith demonstrated exceptional safety awareness...",
      "awardable": true,
      "personsCredited": "John Smith - Lead Safety Officer, Team Alpha",
      "status": "submitted",
      "category": "safety",
      "impactLevel": "project_wide",
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

### 10. Get Most Popular Practices

**GET** `/api/good-practice/popular/top`

Retrieves most popular good practices by likes and views.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `limit` (optional): Number of results (default: 10)

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "title": "Innovative Safety Harness Usage",
      "description": "Worker John Smith demonstrated exceptional safety awareness...",
      "likes": 25,
      "views": 80,
      "status": "approved",
      "category": "safety",
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

### 11. Get Category Breakdown

**GET** `/api/good-practice/categories/breakdown`

Retrieves statistics broken down by category.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "safety",
      "count": 40,
      "avgLikes": 12.5,
      "avgViews": 35.2,
      "awardable": 15,
      "approved": 25,
      "awarded": 8
    },
    {
      "_id": "environmental",
      "count": 15,
      "avgLikes": 8.3,
      "avgViews": 28.7,
      "awardable": 5,
      "approved": 10,
      "awarded": 2
    }
  ]
}
```

## Data Models

### Good Practice Status

- `draft`: Practice saved but not yet submitted
- `submitted`: Practice submitted for review
- `under_review`: Practice currently under review
- `approved`: Practice approved by management
- `awarded`: Practice has been awarded recognition
- `rejected`: Practice was rejected

### Categories

- `safety`: Safety-related practices
- `environmental`: Environmental protection practices
- `efficiency`: Efficiency improvement practices
- `innovation`: Innovative solutions and practices
- `teamwork`: Team collaboration practices
- `leadership`: Leadership and management practices

### Impact Levels

- `local`: Impact limited to specific area/team
- `project_wide`: Impact across entire project
- `company_wide`: Impact across company operations
- `industry_wide`: Impact across industry standards

### Award Types

- `recognition`: Recognition and appreciation
- `monetary`: Monetary reward
- `certificate`: Certificate of achievement
- `trophy`: Trophy or physical award
- `other`: Other types of recognition

## Validation Rules

### Required Fields (All Statuses)

- `projectId`: String, not empty
- `date`: Valid ISO8601 date

### Required Fields (Submitted Status Only)

- `title`: String, not empty
- `description`: String, not empty

### Optional Fields

- `awardable`: Boolean flag for award eligibility
- `personsCredited`: String description of credited persons
- `photos`: Array of Cloudinary URLs (max 6 photos)
- `category`: Category enum (default: "safety")
- `impactLevel`: Impact level enum (default: "local")
- `tags`: Array of tag strings
- `status`: Status enum (default: "draft")

### Conditional Validation

- **Title**: Required for submitted status, optional for drafts
- **Description**: Required for submitted status, optional for drafts
- **Photos**: Maximum 6 photos allowed
- **Tags**: Automatically filtered to remove empty tags

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Valid date is required",
      "param": "date",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "Good practice not found"
}
```

### 403 Forbidden

```json
{
  "message": "Not authorized to delete this good practice"
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
- `title` → `title` (String field)
- `description` → `description` (String field)
- `awardable` → `awardable` (Boolean field)
- `personsCredited` → `personsCredited` (String field)
- `photos` → `photos` (Array of Cloudinary URLs)

### Usage Examples

#### Save Draft

```javascript
// Use /save-draft endpoint for "Save Draft" button
const saveDraft = async (formData) => {
  const response = await fetch("/api/good-practice/save-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      date: formData.date,
      title: formData.title || "",
      description: formData.description || "",
      awardable: formData.awardable || false,
      personsCredited: formData.personsCredited || "",
      photos: formData.photos,
      category: "safety",
      impactLevel: "local",
      tags: [],
    }),
  });
};
```

#### Submit Complete

```javascript
// Use main POST endpoint for "Submit" button
const submitPractice = async (formData) => {
  const response = await fetch("/api/good-practice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      date: formData.date,
      title: formData.title,
      description: formData.description,
      awardable: formData.awardable,
      personsCredited: formData.personsCredited || "",
      photos: formData.photos,
      category: "safety",
      impactLevel: "local",
      tags: [],
      status: "submitted",
    }),
  });
};
```

#### Like Practice

```javascript
// Like a good practice
const likePractice = async (practiceId) => {
  const response = await fetch(`/api/good-practice/${practiceId}/like`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
```

#### Approve Practice

```javascript
// Approve a good practice
const approvePractice = async (practiceId, reviewedBy, reviewNotes) => {
  const response = await fetch(`/api/good-practice/${practiceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "approved",
      reviewedBy,
      reviewNotes,
    }),
  });
};
```

#### Award Practice

```javascript
// Award a good practice
const awardPractice = async (practiceId, awardType, awardValue, awardNotes) => {
  const response = await fetch(`/api/good-practice/${practiceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "awarded",
      awardType,
      awardValue,
      awardNotes,
    }),
  });
};
```

## Advanced Features

### Recognition System

- **Award Tracking**: Complete award lifecycle from nomination to presentation
- **Multiple Award Types**: Support for recognition, monetary, certificates, trophies
- **Award History**: Complete audit trail of all awards given
- **Pending Awards**: Special endpoint for practices awaiting award decisions

### Team Sharing

- **Automatic Sharing**: Approved practices automatically shared with team
- **Manual Sharing**: Option to manually share practices with specific notes
- **Share Analytics**: Track which practices are most shared and viewed
- **Team Engagement**: Like and view tracking for team engagement

### Analytics & Insights

- **Category Analytics**: Performance metrics by practice category
- **Popular Practices**: Most liked and viewed practices identification
- **Impact Assessment**: Track practices by impact level
- **Engagement Metrics**: Likes, views, and sharing statistics

### Workflow Management

- **Review Process**: Complete review workflow with reviewer tracking
- **Status Progression**: Clear status progression from draft to award
- **Approval Tracking**: Reviewer notes and approval timestamps
- **Rejection Handling**: Proper rejection with feedback

## Notes

- Good practices encourage positive safety behaviors and recognition
- Award system motivates continued excellence in safety practices
- Team sharing promotes knowledge transfer and best practices
- All timestamps are in ISO8601 format
- Photos should be uploaded to Cloudinary and URLs provided
- The API supports both draft saving and full submission workflows
- Like and view tracking provides engagement metrics
- Category and impact level classification helps organize practices
- Automatic team sharing of approved practices ensures knowledge dissemination
- Comprehensive statistics help identify trends and popular practices
