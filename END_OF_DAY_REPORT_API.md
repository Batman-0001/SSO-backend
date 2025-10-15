# End of Day Report API Documentation

## Overview

The End of Day Report API provides comprehensive endpoints for managing daily site reports with support for draft saving, work statistics tracking, safety performance monitoring, activities summary, and SSO review. This system consolidates daily site activities and safety metrics into comprehensive reports.

## Base URL

```
/api/end-of-day-report
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create End of Day Report

**POST** `/api/end-of-day-report`

Creates a new end of day report with full details.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "end_of_day_report",
  "reportId": "DR-2025-0115-001",
  "reportDate": "2025-01-15T00:00:00.000Z",
  "workStatistics": {
    "totalWorkers": 45,
    "meilEmployees": 12,
    "subcontractor": 30,
    "visitors": 3,
    "manHours": 360,
    "safeDays": 127,
    "highRiskActivities": [
      {
        "activity": "height",
        "count": 15
      },
      {
        "activity": "hotwork",
        "count": 8
      }
    ],
    "workPermits": {
      "height": 5,
      "hotWork": 3,
      "excavation": 2
    }
  },
  "safetyPerformance": {
    "safetyScore": 98,
    "ppeCompliance": 88,
    "housekeeping": 95,
    "equipmentSafety": 92,
    "scoreBreakdown": {
      "briefingCompletion": { "score": 20, "maxScore": 20 },
      "inspectionQuality": { "score": 25, "maxScore": 25 },
      "ppeCompliance": { "score": 18, "maxScore": 20 },
      "observationsLogged": { "score": 15, "maxScore": 15 },
      "zeroIncidents": { "score": 20, "maxScore": 20 }
    }
  },
  "activitiesSummary": {
    "toolboxTalks": {
      "count": 1,
      "attendees": 45,
      "topics": ["Working at Height"]
    },
    "siteInspections": {
      "count": 2,
      "categories": ["Scaffolding", "PPE Compliance"]
    },
    "incidentsReported": {
      "count": 0,
      "types": []
    },
    "observationsLogged": {
      "count": 5,
      "safe": 3,
      "unsafe": 2
    },
    "openActions": {
      "count": 6,
      "critical": 1,
      "high": 2,
      "medium": 3,
      "low": 0
    }
  },
  "ssoReview": {
    "siteStatus": "good",
    "highlights": "Excellent safety performance with zero incidents. All high-risk activities completed safely with proper permits and supervision.",
    "concerns": "PPE compliance slightly below target at 88%. Need to reinforce helmet usage in Zone B.",
    "tomorrowPlan": "Focus on PPE compliance training for Zone B workers. Continue height work safety protocols.",
    "weatherImpact": "Mild weather conditions, no impact on operations",
    "equipmentIssues": "All equipment functioning normally",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "ssoSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "status": "submitted"
}
```

**Response:**

```json
{
  "message": "End of day report submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "end_of_day_report",
    "reportId": "DR-2025-0115-001",
    "reportDate": "2025-01-15T00:00:00.000Z",
    "workStatistics": {
      "totalWorkers": 45,
      "meilEmployees": 12,
      "subcontractor": 30,
      "visitors": 3,
      "manHours": 360,
      "safeDays": 127,
      "highRiskActivities": [
        {
          "activity": "height",
          "count": 15
        },
        {
          "activity": "hotwork",
          "count": 8
        }
      ],
      "workPermits": {
        "height": 5,
        "hotWork": 3,
        "excavation": 2
      }
    },
    "safetyPerformance": {
      "safetyScore": 98,
      "ppeCompliance": 88,
      "housekeeping": 95,
      "equipmentSafety": 92,
      "scoreBreakdown": {
        "briefingCompletion": { "score": 20, "maxScore": 20 },
        "inspectionQuality": { "score": 25, "maxScore": 25 },
        "ppeCompliance": { "score": 18, "maxScore": 20 },
        "observationsLogged": { "score": 15, "maxScore": 15 },
        "zeroIncidents": { "score": 20, "maxScore": 20 }
      }
    },
    "activitiesSummary": {
      "toolboxTalks": {
        "count": 1,
        "attendees": 45,
        "topics": ["Working at Height"]
      },
      "siteInspections": {
        "count": 2,
        "categories": ["Scaffolding", "PPE Compliance"]
      },
      "incidentsReported": {
        "count": 0,
        "types": []
      },
      "observationsLogged": {
        "count": 5,
        "safe": 3,
        "unsafe": 2
      },
      "openActions": {
        "count": 6,
        "critical": 1,
        "high": 2,
        "medium": 3,
        "low": 0
      }
    },
    "ssoReview": {
      "siteStatus": "good",
      "highlights": "Excellent safety performance with zero incidents...",
      "concerns": "PPE compliance slightly below target at 88%...",
      "tomorrowPlan": "Focus on PPE compliance training...",
      "weatherImpact": "Mild weather conditions, no impact on operations",
      "equipmentIssues": "All equipment functioning normally",
      "photos": ["cloudinary-url-1", "cloudinary-url-2"],
      "ssoSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    },
    "status": "submitted",
    "approvedBy": "",
    "approvedAt": null,
    "approvalNotes": "",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T17:00:00.000Z",
    "updatedAt": "2025-01-15T17:00:00.000Z"
  },
  "status": "submitted"
}
```

**Draft Response:**

```json
{
  "message": "End of day report saved as draft",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  },
  "status": "draft"
}
```

### 2. Save Draft End of Day Report

**POST** `/api/end-of-day-report/save-draft`

Saves an end of day report as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "reportDate": "2025-01-15T00:00:00.000Z",
  "workStatistics": {
    "totalWorkers": 45,
    "meilEmployees": 12,
    "subcontractor": 30,
    "visitors": 3,
    "manHours": 360
  },
  "safetyPerformance": {
    "ppeCompliance": 88,
    "housekeeping": 95,
    "equipmentSafety": 92
  },
  "ssoReview": {
    "highlights": "",
    "concerns": "",
    "tomorrowPlan": "",
    "photos": [],
    "ssoSignature": ""
  }
}
```

**Response:**

```json
{
  "message": "End of day report saved as draft",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "reportId": "DR-2025-0115-001",
    "reportDate": "2025-01-15T00:00:00.000Z",
    "workStatistics": {
      "totalWorkers": 45,
      "meilEmployees": 12,
      "subcontractor": 30,
      "visitors": 3,
      "manHours": 360,
      "safeDays": 0,
      "highRiskActivities": [],
      "workPermits": {
        "height": 0,
        "hotWork": 0,
        "excavation": 0
      }
    },
    "safetyPerformance": {
      "safetyScore": 0,
      "ppeCompliance": 88,
      "housekeeping": 95,
      "equipmentSafety": 92,
      "scoreBreakdown": {
        "briefingCompletion": { "score": 0, "maxScore": 20 },
        "inspectionQuality": { "score": 0, "maxScore": 25 },
        "ppeCompliance": { "score": 0, "maxScore": 20 },
        "observationsLogged": { "score": 0, "maxScore": 15 },
        "zeroIncidents": { "score": 0, "maxScore": 20 }
      }
    },
    "activitiesSummary": {
      "toolboxTalks": { "count": 0, "attendees": 0, "topics": [] },
      "siteInspections": { "count": 0, "categories": [] },
      "incidentsReported": { "count": 0, "types": [] },
      "observationsLogged": { "count": 0, "safe": 0, "unsafe": 0 },
      "openActions": {
        "count": 0,
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0
      }
    },
    "ssoReview": {
      "siteStatus": "",
      "highlights": "",
      "concerns": "",
      "tomorrowPlan": "",
      "weatherImpact": "",
      "equipmentIssues": "",
      "photos": [],
      "ssoSignature": ""
    },
    "status": "draft",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T17:00:00.000Z"
  }
}
```

### 3. Get All End of Day Reports

**GET** `/api/end-of-day-report`

Retrieves all end of day reports with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `status` (optional): Filter by status (draft, submitted, approved, archived)
- `startDate` (optional): Filter reports from this date (ISO8601)
- `endDate` (optional): Filter reports until this date (ISO8601)
- `sortBy` (optional): Sort field (default: "reportDate")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "reportId": "DR-2025-0115-001",
      "reportDate": "2025-01-15T00:00:00.000Z",
      "workStatistics": {
        "totalWorkers": 45,
        "meilEmployees": 12,
        "subcontractor": 30,
        "visitors": 3,
        "manHours": 360
      },
      "safetyPerformance": {
        "safetyScore": 98,
        "ppeCompliance": 88,
        "housekeeping": 95,
        "equipmentSafety": 92
      },
      "ssoReview": {
        "siteStatus": "good",
        "highlights": "Excellent safety performance...",
        "concerns": "PPE compliance slightly below target...",
        "tomorrowPlan": "Focus on PPE compliance training..."
      },
      "status": "approved",
      "approvedBy": "Safety Manager - Jane Doe",
      "approvedAt": "2025-01-16T09:00:00.000Z",
      "createdBy": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "employeeId": "EMP123"
      },
      "createdAt": "2025-01-15T17:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 4. Get End of Day Report by ID

**GET** `/api/end-of-day-report/:id`

Retrieves a specific end of day report.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "reportId": "DR-2025-0115-001",
    "reportDate": "2025-01-15T00:00:00.000Z",
    "workStatistics": {
      "totalWorkers": 45,
      "meilEmployees": 12,
      "subcontractor": 30,
      "visitors": 3,
      "manHours": 360,
      "safeDays": 127,
      "highRiskActivities": [
        {
          "activity": "height",
          "count": 15
        }
      ],
      "workPermits": {
        "height": 5,
        "hotWork": 3,
        "excavation": 2
      }
    },
    "safetyPerformance": {
      "safetyScore": 98,
      "ppeCompliance": 88,
      "housekeeping": 95,
      "equipmentSafety": 92,
      "scoreBreakdown": {
        "briefingCompletion": { "score": 20, "maxScore": 20 },
        "inspectionQuality": { "score": 25, "maxScore": 25 },
        "ppeCompliance": { "score": 18, "maxScore": 20 },
        "observationsLogged": { "score": 15, "maxScore": 15 },
        "zeroIncidents": { "score": 20, "maxScore": 20 }
      }
    },
    "activitiesSummary": {
      "toolboxTalks": {
        "count": 1,
        "attendees": 45,
        "topics": ["Working at Height"]
      },
      "siteInspections": {
        "count": 2,
        "categories": ["Scaffolding", "PPE Compliance"]
      },
      "incidentsReported": {
        "count": 0,
        "types": []
      },
      "observationsLogged": {
        "count": 5,
        "safe": 3,
        "unsafe": 2
      },
      "openActions": {
        "count": 6,
        "critical": 1,
        "high": 2,
        "medium": 3,
        "low": 0
      }
    },
    "ssoReview": {
      "siteStatus": "good",
      "highlights": "Excellent safety performance with zero incidents...",
      "concerns": "PPE compliance slightly below target at 88%...",
      "tomorrowPlan": "Focus on PPE compliance training for Zone B workers...",
      "weatherImpact": "Mild weather conditions, no impact on operations",
      "equipmentIssues": "All equipment functioning normally",
      "photos": ["cloudinary-url-1", "cloudinary-url-2"],
      "ssoSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    },
    "status": "approved",
    "approvedBy": "Safety Manager - Jane Doe",
    "approvedAt": "2025-01-16T09:00:00.000Z",
    "approvalNotes": "Report reviewed and approved. Good safety performance noted.",
    "createdBy": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "employeeId": "EMP123"
    },
    "createdAt": "2025-01-15T17:00:00.000Z",
    "updatedAt": "2025-01-16T09:00:00.000Z"
  }
}
```

### 5. Update End of Day Report

**PUT** `/api/end-of-day-report/:id`

Updates an existing end of day report.

**Request Body:**

```json
{
  "status": "approved",
  "workStatistics": {
    "totalWorkers": 47,
    "manHours": 376
  },
  "safetyPerformance": {
    "ppeCompliance": 90,
    "safetyScore": 99
  },
  "ssoReview": {
    "siteStatus": "excellent",
    "highlights": "Updated highlights with additional achievements",
    "concerns": "Updated concerns based on latest observations"
  },
  "approvedBy": "Safety Manager - Jane Doe",
  "approvalNotes": "Report reviewed and approved with minor updates."
}
```

**Response:**

```json
{
  "message": "End of day report updated successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "workStatistics": {
      "totalWorkers": 47,
      "manHours": 376
    },
    "safetyPerformance": {
      "ppeCompliance": 90,
      "safetyScore": 99
    },
    "ssoReview": {
      "siteStatus": "excellent",
      "highlights": "Updated highlights with additional achievements",
      "concerns": "Updated concerns based on latest observations"
    },
    "status": "approved",
    "approvedBy": "Safety Manager - Jane Doe",
    "approvedAt": "2025-01-16T09:00:00.000Z",
    "approvalNotes": "Report reviewed and approved with minor updates.",
    "updatedBy": "user-id",
    "updatedAt": "2025-01-16T09:00:00.000Z"
  }
}
```

### 6. Delete End of Day Report

**DELETE** `/api/end-of-day-report/:id`

Deletes an end of day report. Only admins or the creator can delete reports.

**Response:**

```json
{
  "message": "End of day report deleted successfully"
}
```

### 7. Get End of Day Report Statistics

**GET** `/api/end-of-day-report/stats/overview`

Retrieves comprehensive end of day report statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `startDate` (optional): Filter reports from this date (ISO8601)
- `endDate` (optional): Filter reports until this date (ISO8601)

**Response:**

```json
{
  "data": {
    "total": 30,
    "draft": 2,
    "submitted": 5,
    "approved": 22,
    "archived": 1,
    "totalWorkers": 1350,
    "totalManHours": 10800,
    "avgSafetyScore": 94.5,
    "avgPpeCompliance": 91.2,
    "avgHousekeeping": 93.8,
    "avgEquipmentSafety": 92.1,
    "totalToolboxTalks": 30,
    "totalSiteInspections": 60,
    "totalIncidents": 2,
    "totalObservations": 150,
    "totalOpenActions": 45
  }
}
```

### 8. Get Safety Performance Trends

**GET** `/api/end-of-day-report/performance/trends`

Retrieves safety performance trends over time.

**Query Parameters:**

- `projectId` (required): Project ID
- `days` (optional): Number of days to look back (default: 30)

**Response:**

```json
{
  "data": [
    {
      "reportDate": "2025-01-15T00:00:00.000Z",
      "safetyPerformance": {
        "ppeCompliance": 88,
        "housekeeping": 95,
        "equipmentSafety": 92,
        "safetyScore": 98
      }
    },
    {
      "reportDate": "2025-01-14T00:00:00.000Z",
      "safetyPerformance": {
        "ppeCompliance": 90,
        "housekeeping": 93,
        "equipmentSafety": 89,
        "safetyScore": 95
      }
    }
  ]
}
```

### 9. Get Workforce Analytics

**GET** `/api/end-of-day-report/workforce/analytics`

Retrieves workforce analytics and trends.

**Query Parameters:**

- `projectId` (required): Project ID
- `startDate` (optional): Filter reports from this date (ISO8601)
- `endDate` (optional): Filter reports until this date (ISO8601)

**Response:**

```json
{
  "data": {
    "avgTotalWorkers": 45.2,
    "avgMeilEmployees": 12.1,
    "avgSubcontractors": 30.5,
    "avgVisitors": 2.6,
    "avgManHours": 361.8,
    "avgHoursPerWorker": 8.0,
    "totalManHours": 10854,
    "maxWorkers": 52,
    "minWorkers": 38
  }
}
```

### 10. Get Latest End of Day Report

**GET** `/api/end-of-day-report/latest`

Retrieves the latest end of day report for a project.

**Query Parameters:**

- `projectId` (required): Project ID

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "reportId": "DR-2025-0115-001",
    "reportDate": "2025-01-15T00:00:00.000Z",
    "workStatistics": {
      "totalWorkers": 45,
      "meilEmployees": 12,
      "subcontractor": 30,
      "visitors": 3,
      "manHours": 360
    },
    "safetyPerformance": {
      "safetyScore": 98,
      "ppeCompliance": 88,
      "housekeeping": 95,
      "equipmentSafety": 92
    },
    "ssoReview": {
      "siteStatus": "good",
      "highlights": "Excellent safety performance with zero incidents...",
      "concerns": "PPE compliance slightly below target at 88%...",
      "tomorrowPlan": "Focus on PPE compliance training..."
    },
    "status": "approved",
    "createdBy": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "employeeId": "EMP123"
    },
    "createdAt": "2025-01-15T17:00:00.000Z"
  }
}
```

## Data Models

### End of Day Report Status

- `draft`: Report saved but not yet submitted
- `submitted`: Report submitted for review
- `approved`: Report approved by management
- `archived`: Report archived for historical reference

### Site Status

- `excellent`: Outstanding safety performance
- `good`: Good safety performance with minor issues
- `satisfactory`: Acceptable safety performance
- `needs_improvement`: Safety performance needs attention

### High Risk Activities

- `height`: Working at height activities
- `hotwork`: Hot work activities
- `confined`: Confined space entry
- `excavation`: Excavation activities
- `lifting`: Heavy lifting operations
- `electrical`: Electrical work

### Work Statistics Structure

```json
{
  "totalWorkers": 45,
  "meilEmployees": 12,
  "subcontractor": 30,
  "visitors": 3,
  "manHours": 360,
  "safeDays": 127,
  "highRiskActivities": [
    {
      "activity": "height",
      "count": 15
    }
  ],
  "workPermits": {
    "height": 5,
    "hotWork": 3,
    "excavation": 2
  }
}
```

### Safety Performance Structure

```json
{
  "safetyScore": 98,
  "ppeCompliance": 88,
  "housekeeping": 95,
  "equipmentSafety": 92,
  "scoreBreakdown": {
    "briefingCompletion": { "score": 20, "maxScore": 20 },
    "inspectionQuality": { "score": 25, "maxScore": 25 },
    "ppeCompliance": { "score": 18, "maxScore": 20 },
    "observationsLogged": { "score": 15, "maxScore": 15 },
    "zeroIncidents": { "score": 20, "maxScore": 20 }
  }
}
```

### Activities Summary Structure

```json
{
  "toolboxTalks": {
    "count": 1,
    "attendees": 45,
    "topics": ["Working at Height"]
  },
  "siteInspections": {
    "count": 2,
    "categories": ["Scaffolding", "PPE Compliance"]
  },
  "incidentsReported": {
    "count": 0,
    "types": []
  },
  "observationsLogged": {
    "count": 5,
    "safe": 3,
    "unsafe": 2
  },
  "openActions": {
    "count": 6,
    "critical": 1,
    "high": 2,
    "medium": 3,
    "low": 0
  }
}
```

### SSO Review Structure

```json
{
  "siteStatus": "good",
  "highlights": "Key achievements and positive observations",
  "concerns": "Areas requiring attention",
  "tomorrowPlan": "Safety focus for next day",
  "weatherImpact": "Weather impact on operations",
  "equipmentIssues": "Equipment status and issues",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "ssoSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## Validation Rules

### Required Fields (All Statuses)

- `projectId`: String, not empty
- `reportDate`: Valid ISO8601 date

### Required Fields (Submitted Status Only)

- `workStatistics.totalWorkers`: Number, minimum 0
- `workStatistics.meilEmployees`: Number, minimum 0
- `workStatistics.subcontractor`: Number, minimum 0
- `workStatistics.visitors`: Number, minimum 0
- `workStatistics.manHours`: Number, minimum 0
- `safetyPerformance.ppeCompliance`: Number, 0-100
- `safetyPerformance.housekeeping`: Number, 0-100
- `safetyPerformance.equipmentSafety`: Number, 0-100
- `ssoReview.siteStatus`: Enum value
- `ssoReview.highlights`: String, not empty
- `ssoReview.ssoSignature`: String, not empty

### Optional Fields

- `reportId`: Auto-generated if not provided
- `activitiesSummary`: Auto-populated from other modules
- `safetyPerformance.safetyScore`: Auto-calculated if not provided
- `ssoReview.photos`: Array of Cloudinary URLs

### Conditional Validation

- **Worker Count Consistency**: Validates that MEIL + subcontractor + visitors ≈ totalWorkers
- **Safety Score Calculation**: Auto-calculates from score breakdown if not provided
- **SSO Signature**: Required for submitted status, optional for drafts
- **Approval Requirements**: Approved status requires approvedBy field

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Total workers must be a non-negative number",
      "param": "workStatistics.totalWorkers",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "End of day report not found"
}
```

### 403 Forbidden

```json
{
  "message": "Not authorized to delete this end of day report"
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

- `reportId` → `reportId` (Auto-generated or custom)
- `totalWorkers` → `workStatistics.totalWorkers`
- `meilEmployees` → `workStatistics.meilEmployees`
- `subcontractor` → `workStatistics.subcontractor`
- `visitors` → `workStatistics.visitors`
- `manHours` → `workStatistics.manHours`
- `highRiskActivities` → `workStatistics.highRiskActivities`
- `ppeCompliance` → `safetyPerformance.ppeCompliance`
- `housekeeping` → `safetyPerformance.housekeeping`
- `equipmentSafety` → `safetyPerformance.equipmentSafety`
- `siteStatus` → `ssoReview.siteStatus`
- `highlights` → `ssoReview.highlights`
- `concerns` → `ssoReview.concerns`
- `tomorrowPlan` → `ssoReview.tomorrowPlan`
- `photos` → `ssoReview.photos`

### Usage Examples

#### Save Draft

```javascript
// Use /save-draft endpoint for "Save Draft" button
const saveDraft = async (formData) => {
  const response = await fetch("/api/end-of-day-report/save-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      reportDate: new Date().toISOString().slice(0, 10),
      workStatistics: {
        totalWorkers: parseInt(formData.totalWorkers),
        meilEmployees: parseInt(formData.meilEmployees),
        subcontractor: parseInt(formData.subcontractor),
        visitors: parseInt(formData.visitors),
        manHours: parseInt(formData.manHours),
      },
      safetyPerformance: {
        ppeCompliance: parseInt(formData.ppeCompliance),
        housekeeping: parseInt(formData.housekeeping),
        equipmentSafety: parseInt(formData.equipmentSafety),
      },
      ssoReview: {
        highlights: formData.highlights || "",
        concerns: formData.concerns || "",
        tomorrowPlan: formData.tomorrowPlan || "",
        photos: formData.photos,
        ssoSignature: formData.ssoSignature || "",
      },
    }),
  });
};
```

#### Submit Complete

```javascript
// Use main POST endpoint for "Submit Report" button
const submitReport = async (formData) => {
  const response = await fetch("/api/end-of-day-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      reportDate: new Date().toISOString().slice(0, 10),
      workStatistics: {
        totalWorkers: parseInt(formData.totalWorkers),
        meilEmployees: parseInt(formData.meilEmployees),
        subcontractor: parseInt(formData.subcontractor),
        visitors: parseInt(formData.visitors),
        manHours: parseInt(formData.manHours),
        highRiskActivities: formData.highRiskActivities.map((activity) => ({
          activity,
          count: 0, // You can add count input in frontend
        })),
      },
      safetyPerformance: {
        ppeCompliance: parseInt(formData.ppeCompliance),
        housekeeping: parseInt(formData.housekeeping),
        equipmentSafety: parseInt(formData.equipmentSafety),
      },
      ssoReview: {
        siteStatus: formData.siteStatus,
        highlights: formData.highlights,
        concerns: formData.concerns || "",
        tomorrowPlan: formData.tomorrowPlan || "",
        weatherImpact: formData.weatherImpact || "",
        equipmentIssues: formData.equipmentIssues || "",
        photos: formData.photos,
        ssoSignature: formData.ssoSignature,
      },
      status: "submitted",
    }),
  });
};
```

#### Get Performance Trends

```javascript
// Get safety performance trends for charts
const getPerformanceTrends = async (projectId, days = 30) => {
  const response = await fetch(
    `/api/end-of-day-report/performance/trends?projectId=${projectId}&days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  return data.data;
};
```

#### Get Workforce Analytics

```javascript
// Get workforce analytics for dashboard
const getWorkforceAnalytics = async (projectId) => {
  const response = await fetch(
    `/api/end-of-day-report/workforce/analytics?projectId=${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  return data.data;
};
```

## Advanced Features

### Auto-Generated Data Integration

- **Activities Summary**: Automatically populated from other HSE modules
- **Safety Score Calculation**: Auto-calculated from score breakdown components
- **Report ID Generation**: Unique report IDs with date and sequence
- **Worker Count Validation**: Automatic validation of worker count consistency

### Analytics & Insights

- **Performance Trends**: Historical safety performance tracking
- **Workforce Analytics**: Comprehensive workforce metrics and trends
- **Safety Score Grading**: Automatic grade assignment (A+ to F)
- **Compliance Status**: Automatic compliance status determination

### Workflow Management

- **Draft to Submit**: Seamless transition from draft to submitted status
- **Approval Process**: Complete approval workflow with reviewer tracking
- **Archive Management**: Historical report archiving
- **Digital Signatures**: SSO authorization with signature validation

### Data Validation

- **Real-time Validation**: Immediate validation feedback
- **Cross-field Validation**: Worker count and man-hours consistency
- **Score Calculation**: Automatic safety score calculation
- **Required Field Management**: Different validation for draft vs submitted

## Notes

- End of Day Reports provide comprehensive daily site overview
- Activities summary can be auto-populated from other HSE modules
- Safety scores are automatically calculated from component scores
- Digital signature is mandatory for submitted reports
- All timestamps are in ISO8601 format
- Photos should be uploaded to Cloudinary and URLs provided
- The API supports both draft saving and full submission workflows
- Performance trends help identify patterns and improvements
- Workforce analytics provide insights into productivity and safety
- Report approval workflow ensures quality control
- Historical data supports long-term trend analysis
