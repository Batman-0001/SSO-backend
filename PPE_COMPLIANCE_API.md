# PPE Compliance API Documentation

## Overview

The PPE Compliance API provides endpoints for managing Personal Protective Equipment (PPE) compliance monitoring with two distinct modes: Quick Check and Detailed Audit. This system supports comprehensive safety equipment monitoring with real-time compliance tracking, worker-by-worker audits, and advanced analytics.

## Base URL

```
/api/ppe-compliance
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### ================================

### PPE COMPLIANCE MONITORING

### ================================

### 1. Create PPE Compliance Check

**POST** `/api/ppe-compliance`

Creates a new PPE compliance check for both quick and detailed modes.

**Request Body (Quick Mode):**

```json
{
  "projectId": "P123",
  "mode": "quick",
  "area": "Zone A - Main Construction",
  "activity": "Formwork installation",
  "auditorName": "John Smith",
  "auditorId": "EMP001",
  "workersCount": 15,
  "compliantCount": 12,
  "groupPhoto": "cloudinary-url-group-photo",
  "averagePpeChecks": {
    "helmet": true,
    "shoes": true,
    "vest": true,
    "glasses": false,
    "gloves": true,
    "harness": false,
    "earProtection": false
  },
  "photos": ["cloudinary-url-1"],
  "notes": "Overall good compliance, need to address eye protection",
  "weatherConditions": "Clear, 25°C",
  "status": "completed"
}
```

**Request Body (Detailed Mode):**

```json
{
  "projectId": "P123",
  "mode": "detailed",
  "area": "Zone B - Excavation Area",
  "activity": "Excavation work",
  "auditorName": "Jane Doe",
  "auditorId": "EMP002",
  "workerAudits": [
    {
      "workerId": "W001",
      "name": "Mike Johnson",
      "photo": "cloudinary-url-worker-photo",
      "ppeItems": [
        {
          "id": "helmet",
          "label": "Safety Helmet",
          "icon": "⛑️",
          "required": true,
          "compliant": true,
          "condition": "good"
        },
        {
          "id": "shoes",
          "label": "Safety Shoes",
          "icon": "👢",
          "required": true,
          "compliant": true,
          "condition": "good"
        }
      ],
      "compliant": true,
      "compliancePercentage": 85,
      "notes": "All required PPE worn properly"
    }
  ],
  "photos": ["cloudinary-url-overall"],
  "notes": "Detailed audit of excavation team",
  "weatherConditions": "Partly cloudy, 22°C",
  "status": "completed"
}
```

**Response:**

```json
{
  "message": "PPE compliance check submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "mode": "quick",
    "area": "Zone A - Main Construction",
    "activity": "Formwork installation",
    "auditorName": "John Smith",
    "auditorId": "EMP001",
    "auditDate": "2025-01-15T14:30:00.000Z",
    "workersCount": 15,
    "compliantCount": 12,
    "complianceRate": 80,
    "groupPhoto": "cloudinary-url-group-photo",
    "averagePpeChecks": {
      "helmet": true,
      "shoes": true,
      "vest": true,
      "glasses": false,
      "gloves": true,
      "harness": false,
      "earProtection": false
    },
    "totalAudited": 0,
    "totalCompliant": 0,
    "totalIssues": 0,
    "overallComplianceRate": 0,
    "status": "action_required",
    "actionItems": [],
    "createdAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Save Draft

**POST** `/api/ppe-compliance/save-draft`

Saves a PPE compliance check as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "mode": "quick",
  "area": "Zone A - Main Construction",
  "activity": "Formwork installation",
  "auditorName": "John Smith",
  "auditorId": "EMP001"
}
```

**Response:**

```json
{
  "message": "Draft saved successfully",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  }
}
```

### 3. Get All PPE Compliance Checks

**GET** `/api/ppe-compliance`

Retrieves all PPE compliance checks with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `mode` (optional): Filter by mode ("quick" or "detailed")
- `area` (optional): Filter by area (partial match)
- `auditorName` (optional): Filter by auditor name (partial match)
- `status` (optional): Filter by status
- `sortBy` (optional): Sort field (default: "auditDate")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "mode": "quick",
      "area": "Zone A - Main Construction",
      "activity": "Formwork installation",
      "auditorName": "John Smith",
      "auditDate": "2025-01-15T14:30:00.000Z",
      "complianceRate": 80,
      "status": "action_required"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 4. Get Single PPE Compliance Check

**GET** `/api/ppe-compliance/:id`

Retrieves a specific PPE compliance check with all details.

### 5. Update PPE Compliance Check

**PUT** `/api/ppe-compliance/:id`

Updates an existing PPE compliance check.

### 6. Add Worker Audit (Detailed Mode Only)

**POST** `/api/ppe-compliance/:id/workers`

Adds a worker audit to a detailed mode compliance check.

**Request Body:**

```json
{
  "workerId": "W002",
  "name": "Sarah Wilson",
  "photo": "cloudinary-url-worker-photo",
  "ppeItems": [
    {
      "id": "helmet",
      "label": "Safety Helmet",
      "icon": "⛑️",
      "required": true,
      "compliant": true,
      "condition": "good"
    },
    {
      "id": "glasses",
      "label": "Safety Glasses",
      "icon": "🥽",
      "required": true,
      "compliant": false,
      "condition": "not_applicable"
    }
  ],
  "compliant": false,
  "compliancePercentage": 50,
  "notes": "Missing safety glasses"
}
```

### 7. Update Worker Audit

**PUT** `/api/ppe-compliance/:id/workers/:workerIndex`

Updates a specific worker audit in detailed mode.

### 8. Add Action Item

**POST** `/api/ppe-compliance/:id/action-items`

Adds an action item to a PPE compliance check.

**Request Body:**

```json
{
  "workerId": "W002",
  "description": "Provide safety glasses to worker W002",
  "priority": "high",
  "assignedTo": "Safety Officer",
  "dueDate": "2025-01-16T00:00:00.000Z",
  "notes": "Immediate action required"
}
```

### 9. Delete PPE Compliance Check

**DELETE** `/api/ppe-compliance/:id`

Deletes a PPE compliance check. Only admin users or the creator can delete checks.

### ================================

### STATISTICS AND ANALYTICS

### ================================

### 10. Get Statistics Overview

**GET** `/api/ppe-compliance/stats/overview`

Retrieves comprehensive PPE compliance statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `mode` (optional): Filter by mode ("quick" or "detailed")

**Response:**

```json
{
  "data": {
    "total": 100,
    "quickChecks": 75,
    "detailedAudits": 25,
    "draft": 10,
    "completed": 70,
    "actionRequired": 20,
    "totalWorkers": 500,
    "totalCompliant": 400,
    "totalAudited": 125,
    "avgComplianceRate": 80,
    "avgOverallComplianceRate": 85
  }
}
```

### 11. Get Statistics by Area

**GET** `/api/ppe-compliance/stats/areas`

Retrieves PPE compliance statistics grouped by area.

**Response:**

```json
{
  "data": [
    {
      "_id": "Zone A - Main Construction",
      "count": 25,
      "quickChecks": 20,
      "detailedAudits": 5,
      "totalWorkers": 150,
      "totalCompliant": 120,
      "avgComplianceRate": 80,
      "avgOverallComplianceRate": 85
    }
  ]
}
```

### 12. Get Statistics by Auditor

**GET** `/api/ppe-compliance/stats/auditors`

Retrieves PPE compliance statistics grouped by auditor.

**Response:**

```json
{
  "data": [
    {
      "_id": "John Smith",
      "count": 45,
      "quickChecks": 35,
      "detailedAudits": 10,
      "totalWorkers": 225,
      "totalCompliant": 180,
      "avgComplianceRate": 82,
      "avgOverallComplianceRate": 88
    }
  ]
}
```

### 13. Get Compliance Trends

**GET** `/api/ppe-compliance/stats/compliance-trends`

Retrieves PPE compliance trends over time.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `days` (optional): Number of days to look back (default: 30)

**Response:**

```json
{
  "data": [
    {
      "_id": {
        "year": 2025,
        "month": 1,
        "day": 15
      },
      "count": 8,
      "avgComplianceRate": 82,
      "avgOverallComplianceRate": 85,
      "totalWorkers": 60,
      "totalCompliant": 49
    }
  ]
}
```

## Data Validation

### PPE Compliance Validation:

- `projectId`: Project identifier (required)
- `mode`: Monitoring mode - "quick" or "detailed" (required)
- `area`: Work area/zone (required)
- `activity`: Activity being performed (required)
- `auditorName`: Name of the auditor (required)

### Quick Mode Validation:

- `workersCount`: Total number of workers (required, minimum 1)
- `compliantCount`: Number of compliant workers (required, non-negative)
- `groupPhoto`: Group photo URL (optional)
- `averagePpeChecks`: Average PPE compliance by item type (optional)

### Detailed Mode Validation:

- `workerAudits`: Array of individual worker audits (optional)
- Each worker audit can include PPE items with compliance status

### PPE Item Structure:

- `id`: Unique identifier for PPE item (required)
- `label`: Human-readable name (required)
- `icon`: Emoji or icon representation (required)
- `required`: Whether this PPE is required for the activity (optional)
- `compliant`: Whether the worker is compliant with this item (optional)
- `condition`: Physical condition of the PPE item (optional)

## Mode Differences

### Quick Check Mode:

- **Purpose**: Fast spot checks for quick assessment
- **Data**: Group photo, worker counts, average PPE compliance
- **Use Case**: Regular compliance monitoring, quick assessments
- **Compliance Rate**: Based on compliant vs total worker count

### Detailed Audit Mode:

- **Purpose**: Comprehensive worker-by-worker inspection
- **Data**: Individual worker photos, detailed PPE item tracking
- **Use Case**: Thorough inspections, incident investigations
- **Compliance Rate**: Based on individual worker compliance percentages

## Status Values

### Compliance Check Status:

- `draft`: Check is being prepared
- `completed`: Check completed successfully
- `reviewed`: Check has been reviewed by management
- `action_required`: Check completed but requires corrective actions

### PPE Item Condition:

- `good`: PPE item is in good condition
- `fair`: PPE item is in fair condition but usable
- `poor`: PPE item is in poor condition and needs replacement
- `not_applicable`: PPE item is not applicable for this worker/activity

### Action Item Status:

- `pending`: Action item created but not started
- `in_progress`: Action item is being worked on
- `completed`: Action item completed
- `cancelled`: Action item cancelled

### Action Item Priority:

- `low`: Low priority action item
- `medium`: Medium priority action item
- `high`: High priority action item
- `critical`: Critical priority action item (requires immediate attention)

## Integration Notes

1. **Mode Selection**: Choose appropriate mode based on inspection requirements
2. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first
3. **Draft Workflow**: Use `/save-draft` for quick saves, then update with full details
4. **Real-time Updates**: Add worker audits as detailed inspection progresses
5. **Action Item Tracking**: Automatically create action items for non-compliant workers

## Frontend Integration

The API perfectly matches your frontend form structure:

- **Mode Selection**: Two distinct modes (Quick Check vs Detailed Audit)
- **Quick Check**: Group photo, worker counts, average PPE compliance
- **Detailed Audit**: Individual worker tracking with detailed PPE items
- **Real-time Statistics**: Live compliance rate calculations
- **Progress Tracking**: Visual progress indicators and compliance percentages

## Key Features

1. **Dual Mode Support**: Both quick spot checks and detailed worker-by-worker audits
2. **Real-time Compliance**: Automatic calculation of compliance rates and percentages
3. **PPE Item Tracking**: Detailed tracking of individual PPE items and conditions
4. **Photo Documentation**: Required photos for both modes with different purposes
5. **Action Item Management**: Automatic creation and tracking of corrective actions
6. **Comprehensive Analytics**: Statistics by area, auditor, and trends over time
7. **Draft Support**: Save incomplete checks for later completion
8. **Worker Management**: Add/update individual worker audits in detailed mode

## Analytics Available

- **Overall Statistics**: Total checks, compliance rates, worker counts
- **Mode Analysis**: Performance metrics by inspection mode (quick vs detailed)
- **Area Performance**: Compliance statistics by work area/zone
- **Auditor Performance**: Individual auditor statistics and trends
- **Compliance Trends**: Performance trends over time with daily/monthly views
- **Action Item Tracking**: Pending and completed corrective actions

## Special Features

1. **Automatic Compliance Calculation**: Real-time calculation of compliance rates and percentages
2. **Condition Assessment**: Track physical condition of PPE items
3. **Worker Photo Documentation**: Individual worker photos in detailed mode
4. **Flexible PPE Tracking**: Support for different PPE items and requirements
5. **Priority-based Action Items**: Automatic priority assignment based on compliance
6. **Trend Analysis**: Historical compliance data with trend visualization
7. **Multi-mode Statistics**: Separate analytics for quick checks vs detailed audits

This comprehensive API provides a complete solution for PPE compliance monitoring with dual-mode support, real-time compliance tracking, detailed worker audits, and advanced analytics perfect for construction site safety management.
