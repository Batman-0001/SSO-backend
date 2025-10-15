# Site Inspection API Documentation

## Overview

The Site Inspection API provides endpoints for managing comprehensive site inspections with categories, checklist items, inspection results, and advanced analytics. This system supports dynamic inspection workflows with real-time progress tracking and action item management.

## Base URL

```
/api/site-inspection
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### ================================

### INSPECTION CATEGORIES

### ================================

### 1. Create Inspection Category

**POST** `/api/site-inspection/categories`

Creates a new inspection category with checklist items.

**Request Body:**

```json
{
  "id": "electrical_safety",
  "title": "Electrical Safety Inspection",
  "description": "Comprehensive electrical safety inspection checklist",
  "icon": "⚡",
  "projectId": "P123",
  "checklistItems": [
    {
      "id": "elec_001",
      "item": "Check electrical panels for proper labeling",
      "category": "Electrical Panels",
      "requiresPhoto": true,
      "requiresAction": true,
      "critical": true
    },
    {
      "id": "elec_002",
      "item": "Verify GFCI protection in wet areas",
      "category": "Safety Devices",
      "requiresPhoto": false,
      "requiresAction": false,
      "critical": false
    }
  ]
}
```

**Response:**

```json
{
  "message": "Inspection category created successfully",
  "data": {
    "_id": "...",
    "id": "electrical_safety",
    "title": "Electrical Safety Inspection",
    "description": "Comprehensive electrical safety inspection checklist",
    "icon": "⚡",
    "projectId": "P123",
    "checklistItems": [
      {
        "id": "elec_001",
        "item": "Check electrical panels for proper labeling",
        "category": "Electrical Panels",
        "requiresPhoto": true,
        "requiresAction": true,
        "critical": true
      }
    ],
    "isActive": true,
    "createdBy": "...",
    "createdAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 2. Get All Inspection Categories

**GET** `/api/site-inspection/categories`

Retrieves all inspection categories with optional search filtering.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `search` (optional): Search in title and description

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "id": "electrical_safety",
      "title": "Electrical Safety Inspection",
      "description": "Comprehensive electrical safety inspection checklist",
      "icon": "⚡",
      "projectId": "P123",
      "checklistItemsCount": 15,
      "criticalItemsCount": 3,
      "photoRequiredItemsCount": 8,
      "isActive": true
    }
  ]
}
```

### 3. Get Single Inspection Category

**GET** `/api/site-inspection/categories/:id`

Retrieves a specific inspection category with all checklist items.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "id": "electrical_safety",
    "title": "Electrical Safety Inspection",
    "description": "Comprehensive electrical safety inspection checklist",
    "icon": "⚡",
    "projectId": "P123",
    "checklistItems": [
      {
        "id": "elec_001",
        "item": "Check electrical panels for proper labeling",
        "category": "Electrical Panels",
        "requiresPhoto": true,
        "requiresAction": true,
        "critical": true
      }
    ],
    "createdBy": {
      "_id": "...",
      "name": "Safety Officer",
      "email": "safety@company.com",
      "employeeId": "EMP001"
    }
  }
}
```

### ================================

### INSPECTION RESULTS

### ================================

### 4. Create Inspection Result

**POST** `/api/site-inspection/results`

Creates a new inspection result with item results.

**Request Body:**

```json
{
  "projectId": "P123",
  "categoryId": "electrical_safety",
  "categoryTitle": "Electrical Safety Inspection",
  "location": "Building A - Electrical Room",
  "inspectorName": "John Smith",
  "inspectorId": "EMP001",
  "itemResults": [
    {
      "itemId": "elec_001",
      "status": "pass",
      "notes": "All panels properly labeled and accessible",
      "photos": ["cloudinary-url-1"],
      "actionRequired": false
    },
    {
      "itemId": "elec_002",
      "status": "fail",
      "notes": "GFCI not functioning in wet area",
      "photos": ["cloudinary-url-2", "cloudinary-url-3"],
      "actionRequired": true
    }
  ],
  "photos": ["cloudinary-url-overall"],
  "notes": "Overall electrical safety inspection completed",
  "weatherConditions": "Clear, 25°C",
  "overallStatus": "completed"
}
```

**Response:**

```json
{
  "message": "Inspection result submitted successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "categoryId": "electrical_safety",
    "categoryTitle": "Electrical Safety Inspection",
    "location": "Building A - Electrical Room",
    "inspectorName": "John Smith",
    "inspectorId": "EMP001",
    "inspectionDate": "2025-01-15T14:30:00.000Z",
    "itemResults": [
      {
        "itemId": "elec_001",
        "status": "pass",
        "notes": "All panels properly labeled and accessible",
        "photos": ["cloudinary-url-1"],
        "actionRequired": false
      }
    ],
    "overallStatus": "needs_action",
    "passCount": 12,
    "failCount": 3,
    "naCount": 0,
    "totalItems": 15,
    "passPercentage": 80,
    "criticalFailures": 1,
    "actionItems": [],
    "createdAt": "2025-01-15T14:35:00.000Z"
  }
}
```

### 5. Save Draft

**POST** `/api/site-inspection/results/save-draft`

Saves an inspection result as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "categoryId": "electrical_safety",
  "categoryTitle": "Electrical Safety Inspection",
  "location": "Building A - Electrical Room",
  "inspectorName": "John Smith",
  "inspectorId": "EMP001",
  "itemResults": [],
  "photos": [],
  "notes": "",
  "weatherConditions": ""
}
```

**Response:**

```json
{
  "message": "Draft saved successfully",
  "data": {
    "_id": "...",
    "overallStatus": "draft"
    // ... other fields
  }
}
```

### 6. Get All Inspection Results

**GET** `/api/site-inspection/results`

Retrieves all inspection results with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `categoryId` (optional): Filter by category ID
- `inspectorName` (optional): Filter by inspector name (partial match)
- `overallStatus` (optional): Filter by overall status
- `location` (optional): Filter by location (partial match)
- `sortBy` (optional): Sort field (default: "inspectionDate")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "categoryId": "electrical_safety",
      "categoryTitle": "Electrical Safety Inspection",
      "location": "Building A - Electrical Room",
      "inspectorName": "John Smith",
      "inspectionDate": "2025-01-15T14:30:00.000Z",
      "overallStatus": "needs_action",
      "passCount": 12,
      "failCount": 3,
      "passPercentage": 80
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 7. Get Single Inspection Result

**GET** `/api/site-inspection/results/:id`

Retrieves a specific inspection result with all details.

### 8. Update Inspection Result

**PUT** `/api/site-inspection/results/:id`

Updates an existing inspection result.

### 9. Update Specific Item Result

**PUT** `/api/site-inspection/results/:id/item/:itemId`

Updates a specific item result within an inspection.

**Request Body:**

```json
{
  "status": "pass",
  "notes": "Issue resolved after maintenance",
  "photos": ["cloudinary-url-fixed"],
  "actionRequired": false
}
```

### 10. Add Action Item

**POST** `/api/site-inspection/results/:id/action-items`

Adds an action item to an inspection result.

**Request Body:**

```json
{
  "itemId": "elec_002",
  "description": "Replace faulty GFCI outlet in wet area",
  "priority": "high",
  "assignedTo": "Electrician Team",
  "dueDate": "2025-01-20T00:00:00.000Z"
}
```

### 11. Delete Inspection Result

**DELETE** `/api/site-inspection/results/:id`

Deletes an inspection result. Only admin users or the creator can delete results.

### ================================

### STATISTICS AND ANALYTICS

### ================================

### 12. Get Statistics Overview

**GET** `/api/site-inspection/stats/overview`

Retrieves comprehensive inspection statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID
- `categoryId` (optional): Filter by category ID

**Response:**

```json
{
  "data": {
    "total": 150,
    "draft": 10,
    "inProgress": 20,
    "completed": 90,
    "needsAction": 25,
    "closed": 5,
    "totalPass": 1200,
    "totalFail": 300,
    "totalNA": 150,
    "totalItems": 1650,
    "avgPassPercentage": 85,
    "criticalFailures": 45
  }
}
```

### 13. Get Statistics by Category

**GET** `/api/site-inspection/stats/categories`

Retrieves statistics grouped by inspection category.

**Response:**

```json
{
  "data": [
    {
      "_id": {
        "categoryId": "electrical_safety",
        "categoryTitle": "Electrical Safety Inspection"
      },
      "count": 25,
      "totalPass": 200,
      "totalFail": 50,
      "totalNA": 25,
      "totalItems": 275,
      "avgPassPercentage": 80,
      "criticalFailures": 8
    }
  ]
}
```

### 14. Get Statistics by Inspector

**GET** `/api/site-inspection/stats/inspectors`

Retrieves statistics grouped by inspector.

**Response:**

```json
{
  "data": [
    {
      "_id": "John Smith",
      "count": 45,
      "totalPass": 360,
      "totalFail": 90,
      "totalNA": 45,
      "totalItems": 495,
      "avgPassPercentage": 82
    }
  ]
}
```

## Data Validation

### Inspection Category Validation:

- `id`: Unique category identifier (required)
- `title`: Category title (required)
- `description`: Category description (required)
- `icon`: Category icon (required)
- `projectId`: Project identifier (required)
- `checklistItems`: Array with at least one item (required)
- Each checklist item must have unique `id` and `item` description

### Inspection Result Validation:

- `projectId`: Project identifier (required)
- `categoryId`: Category identifier (required)
- `categoryTitle`: Category title (required)
- `location`: Inspection location (required)
- `inspectorName`: Inspector name (required)
- `itemResults`: Array with at least one item result (required for submission)
- Each item result must have valid `status` (pass, fail, na)

### Conditional Validation:

- Draft inspections only require basic information (projectId, categoryId, categoryTitle, location, inspectorName)
- Completed inspections require all item results to be filled
- Photos are required for failed items marked with `requiresPhoto`
- Action items are automatically created for failed critical items

## Status Values

### Inspection Result Status:

- `draft`: Inspection is being prepared
- `in_progress`: Inspection is currently being conducted
- `completed`: Inspection completed successfully
- `needs_action`: Inspection completed but requires corrective actions
- `closed`: All actions completed and inspection closed

### Item Status:

- `pass`: Item passed inspection
- `fail`: Item failed inspection
- `na`: Item not applicable for this inspection

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

1. **Category Management**: Create inspection categories first, then use them for inspections
2. **Photo Upload**: Use the existing `/api/upload` endpoint to upload photos to Cloudinary first
3. **Draft Workflow**: Use `/save-draft` for quick saves, then update with full details
4. **Real-time Updates**: Update individual item results as inspection progresses
5. **Action Item Tracking**: Automatically create action items for failed critical items

## Frontend Integration

The API perfectly matches your frontend form structure:

- **Category Selection**: Dynamic category loading with search functionality
- **Progress Tracking**: Real-time progress updates with item-by-item navigation
- **Status Selection**: Pass/Fail/N/A radio buttons with conditional validation
- **Photo Requirements**: Conditional photo upload based on item requirements
- **Action Items**: Automatic action item creation for critical failures
- **Statistics Display**: Real-time statistics in header (Pass/Fail/N/A counts)

## Key Features

1. **Dynamic Categories**: Flexible inspection categories with customizable checklist items
2. **Real-time Progress**: Item-by-item inspection with progress tracking
3. **Conditional Validation**: Photo requirements and action items based on item properties
4. **Comprehensive Analytics**: Statistics by category, inspector, and overall performance
5. **Action Item Management**: Automatic creation and tracking of corrective actions
6. **Draft Support**: Save incomplete inspections for later completion
7. **Photo Documentation**: Required photos for critical items and failures
8. **Search and Filtering**: Advanced filtering and search capabilities

## Analytics Available

- **Overall Statistics**: Total inspections, pass/fail rates, completion percentages
- **Category Analysis**: Performance metrics by inspection type
- **Inspector Performance**: Individual inspector statistics and trends
- **Critical Failures**: Tracking of critical safety issues
- **Action Item Tracking**: Pending and completed corrective actions
- **Trend Analysis**: Performance trends over time

## Special Features

1. **Automatic Statistics Calculation**: Real-time calculation of pass/fail percentages
2. **Critical Item Tracking**: Special handling for critical safety items
3. **Action Item Automation**: Automatic creation of action items for failures
4. **Photo Validation**: Conditional photo requirements based on item properties
5. **Progress Indicators**: Visual progress tracking with completion percentages
6. **Quick Navigation**: Item-by-item navigation with status indicators

This comprehensive API provides a complete solution for site inspection management with advanced analytics, real-time progress tracking, and automated action item management perfect for construction site safety inspections.
