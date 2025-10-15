# Stop Work Order API Documentation

## Overview

The Stop Work Order (SWO) API provides comprehensive endpoints for managing critical safety stop work orders with support for draft saving, reason categorization, digital signatures, resolution tracking, and comprehensive statistics.

## Base URL

```
/api/stop-work-order
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Stop Work Order

**POST** `/api/stop-work-order`

Creates a new stop work order with full details.

**Request Body:**

```json
{
  "projectId": "P123",
  "module": "stop_work_order",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "areaStopped": "Zone B - Excavation Area",
  "activityStopped": "Excavation and foundation work",
  "reasonCategory": "unsafe_condition",
  "reasonDescription": "Unsafe excavation conditions detected - soil instability and inadequate shoring observed in the excavation pit. Risk of cave-in identified.",
  "issuedBy": "John Smith (EMP345)",
  "duration": "Until safety measures implemented",
  "immediateActions": "1. Evacuate all personnel from excavation area\n2. Barricade the area with warning signs\n3. Contact site engineer for assessment\n4. Implement proper shoring before resuming work",
  "photos": ["cloudinary-url-1", "cloudinary-url-2"],
  "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "status": "active"
}
```

**Response:**

```json
{
  "message": "Stop Work Order issued successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "stop_work_order",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "areaStopped": "Zone B - Excavation Area",
    "activityStopped": "Excavation and foundation work",
    "reasonCategory": "unsafe_condition",
    "reasonDescription": "Unsafe excavation conditions detected...",
    "issuedBy": "John Smith (EMP345)",
    "duration": "Until safety measures implemented",
    "immediateActions": "1. Evacuate all personnel...",
    "photos": ["cloudinary-url-1", "cloudinary-url-2"],
    "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "active",
    "resolvedBy": "",
    "resolvedAt": null,
    "resolutionNotes": "",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T14:30:00.000Z",
    "updatedAt": "2025-01-15T14:30:00.000Z"
  },
  "status": "active"
}
```

**Draft Response:**

```json
{
  "message": "Stop Work Order saved as draft",
  "data": {
    "_id": "...",
    "status": "draft"
    // ... other fields
  },
  "status": "draft"
}
```

### 2. Save Draft Stop Work Order

**POST** `/api/stop-work-order/save-draft`

Saves a stop work order as draft with minimal validation.

**Request Body:**

```json
{
  "projectId": "P123",
  "dateTime": "2025-01-15T14:30:00.000Z",
  "areaStopped": "Zone B - Excavation Area",
  "activityStopped": "Excavation and foundation work",
  "reasonCategory": "unsafe_condition",
  "reasonDescription": "Unsafe excavation conditions detected...",
  "issuedBy": "John Smith (EMP345)",
  "duration": "Until safety measures implemented",
  "immediateActions": "1. Evacuate all personnel...",
  "photos": [],
  "sicSignature": ""
}
```

**Response:**

```json
{
  "message": "Stop Work Order saved as draft",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "areaStopped": "Zone B - Excavation Area",
    "activityStopped": "Excavation and foundation work",
    "reasonCategory": "unsafe_condition",
    "reasonDescription": "Unsafe excavation conditions detected...",
    "issuedBy": "John Smith (EMP345)",
    "duration": "Until safety measures implemented",
    "immediateActions": "1. Evacuate all personnel...",
    "photos": [],
    "sicSignature": "",
    "status": "draft",
    "resolvedBy": "",
    "resolvedAt": null,
    "resolutionNotes": "",
    "createdBy": "user-id",
    "createdAt": "2025-01-15T14:30:00.000Z"
  }
}
```

### 3. Get All Stop Work Orders

**GET** `/api/stop-work-order`

Retrieves all stop work orders with filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `projectId` (optional): Filter by project ID
- `reasonCategory` (optional): Filter by reason category
- `status` (optional): Filter by status (default: "active")
- `areaStopped` (optional): Filter by area stopped (partial match)
- `sortBy` (optional): Sort field (default: "dateTime")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "projectId": "P123",
      "module": "stop_work_order",
      "dateTime": "2025-01-15T14:30:00.000Z",
      "areaStopped": "Zone B - Excavation Area",
      "activityStopped": "Excavation and foundation work",
      "reasonCategory": "unsafe_condition",
      "reasonDescription": "Unsafe excavation conditions detected...",
      "issuedBy": "John Smith (EMP345)",
      "duration": "Until safety measures implemented",
      "immediateActions": "1. Evacuate all personnel...",
      "photos": ["cloudinary-url-1"],
      "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "status": "active",
      "resolvedBy": "",
      "resolvedAt": null,
      "resolutionNotes": "",
      "createdBy": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "employeeId": "EMP123"
      },
      "createdAt": "2025-01-15T14:30:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 4. Get Stop Work Order by ID

**GET** `/api/stop-work-order/:id`

Retrieves a specific stop work order.

**Response:**

```json
{
  "data": {
    "_id": "...",
    "projectId": "P123",
    "module": "stop_work_order",
    "dateTime": "2025-01-15T14:30:00.000Z",
    "areaStopped": "Zone B - Excavation Area",
    "activityStopped": "Excavation and foundation work",
    "reasonCategory": "unsafe_condition",
    "reasonDescription": "Unsafe excavation conditions detected...",
    "issuedBy": "John Smith (EMP345)",
    "duration": "Until safety measures implemented",
    "immediateActions": "1. Evacuate all personnel...",
    "photos": ["cloudinary-url-1"],
    "sicSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "active",
    "resolvedBy": "",
    "resolvedAt": null,
    "resolutionNotes": "",
    "createdBy": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "employeeId": "EMP123"
    },
    "createdAt": "2025-01-15T14:30:00.000Z",
    "updatedAt": "2025-01-15T14:30:00.000Z"
  }
}
```

### 5. Update Stop Work Order

**PUT** `/api/stop-work-order/:id`

Updates an existing stop work order.

**Request Body:**

```json
{
  "status": "resolved",
  "reasonCategory": "unsafe_condition",
  "areaStopped": "Zone B - Excavation Area",
  "activityStopped": "Updated activity description",
  "reasonDescription": "Updated reason description",
  "immediateActions": "Updated immediate actions",
  "resolvedBy": "Safety Manager - Jane Doe",
  "resolutionNotes": "Proper shoring implemented, area cleared for work resumption"
}
```

**Response:**

```json
{
  "message": "Stop Work Order updated successfully",
  "data": {
    "_id": "...",
    "projectId": "P123",
    "areaStopped": "Zone B - Excavation Area",
    "activityStopped": "Updated activity description",
    "reasonDescription": "Updated reason description",
    "immediateActions": "Updated immediate actions",
    "status": "resolved",
    "resolvedBy": "Safety Manager - Jane Doe",
    "resolvedAt": "2025-01-15T16:00:00.000Z",
    "resolutionNotes": "Proper shoring implemented, area cleared for work resumption",
    "updatedBy": "user-id",
    "updatedAt": "2025-01-15T16:00:00.000Z"
  }
}
```

### 6. Delete Stop Work Order

**DELETE** `/api/stop-work-order/:id`

Deletes a stop work order. Only admins or the creator can delete orders.

**Response:**

```json
{
  "message": "Stop Work Order deleted successfully"
}
```

### 7. Get Stop Work Order Statistics

**GET** `/api/stop-work-order/stats/overview`

Retrieves comprehensive stop work order statistics.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": {
    "total": 75,
    "draft": 5,
    "active": 15,
    "resolved": 50,
    "cancelled": 5,
    "unsafeCondition": 25,
    "unsafeAct": 20,
    "equipmentFailure": 10,
    "weather": 8,
    "regulatory": 7,
    "other": 5
  }
}
```

### 8. Get Currently Active Stop Work Orders

**GET** `/api/stop-work-order/active/current`

Retrieves currently active stop work orders.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "dateTime": "2025-01-15T14:30:00.000Z",
      "areaStopped": "Zone B - Excavation Area",
      "activityStopped": "Excavation and foundation work",
      "reasonCategory": "unsafe_condition",
      "reasonDescription": "Unsafe excavation conditions detected...",
      "issuedBy": "John Smith (EMP345)",
      "status": "active",
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

### 9. Get Reason Categories with Statistics

**GET** `/api/stop-work-order/reasons/categories`

Retrieves stop work order reason categories with counts.

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "data": [
    {
      "_id": "unsafe_condition",
      "count": 25,
      "active": 5,
      "resolved": 18,
      "cancelled": 2
    },
    {
      "_id": "unsafe_act",
      "count": 20,
      "active": 3,
      "resolved": 16,
      "cancelled": 1
    }
  ]
}
```

## Data Models

### Stop Work Order Status

- `draft`: SWO saved but not yet issued
- `active`: SWO is currently active and work is stopped
- `resolved`: SWO has been resolved and work can resume
- `cancelled`: SWO was cancelled

### Reason Categories

- `unsafe_condition`: Unsafe working conditions detected
- `unsafe_act`: Unsafe acts or behaviors observed
- `equipment_failure`: Equipment malfunction or failure
- `weather`: Adverse weather conditions
- `regulatory`: Regulatory non-compliance
- `other`: Other reasons not covered above

### Digital Signature

- `sicSignature`: Base64 encoded signature image or Cloudinary URL
- Required for non-draft status
- Used for Site In-Charge authorization

### Resolution Tracking

- `resolvedBy`: Person who resolved the SWO
- `resolvedAt`: Timestamp when SWO was resolved
- `resolutionNotes`: Notes about how the issue was resolved

## Validation Rules

### Required Fields (All Statuses)

- `projectId`: String, not empty
- `dateTime`: Valid ISO8601 date
- `areaStopped`: String, not empty
- `activityStopped`: String, not empty
- `reasonCategory`: One of: unsafe_condition, unsafe_act, equipment_failure, weather, regulatory, other
- `reasonDescription`: String, not empty
- `issuedBy`: String, not empty
- `immediateActions`: String, not empty

### Conditional Validation

- `sicSignature`: Required for non-draft status
- `resolvedBy`: Required when status is resolved

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Area stopped is required",
      "param": "areaStopped",
      "location": "body"
    }
  ]
}
```

### 404 Not Found

```json
{
  "message": "Stop Work Order not found"
}
```

### 403 Forbidden

```json
{
  "message": "Not authorized to delete this Stop Work Order"
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

- `dateTime` → `dateTime` (DateTime field)
- `areaStopped` → `areaStopped` (String field)
- `activityStopped` → `activityStopped` (String field)
- `reasonCategory` → `reasonCategory` (Enum field)
- `reasonDescription` → `reasonDescription` (String field)
- `issuedBy` → `issuedBy` (String field)
- `duration` → `duration` (String field, optional)
- `immediateActions` → `immediateActions` (String field)
- `photos` → `photos` (Array of Cloudinary URLs)
- `sicSignature` → `sicSignature` (Base64 signature or Cloudinary URL)

### Usage Examples

#### Save Draft

```javascript
// Use /save-draft endpoint for "Save Draft" button
const saveDraft = async (formData) => {
  const response = await fetch("/api/stop-work-order/save-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      dateTime: formData.dateTime,
      areaStopped: formData.areaStopped,
      activityStopped: formData.activityStopped,
      reasonCategory: formData.reasonCategory,
      reasonDescription: formData.reasonDescription,
      issuedBy: formData.issuedBy,
      duration: formData.duration || "",
      immediateActions: formData.immediateActions,
      photos: formData.photos,
      sicSignature: formData.sicSignature || "",
    }),
  });
};
```

#### Submit Complete

```javascript
// Use main POST endpoint for "Issue SWO" button
const submitSWO = async (formData) => {
  const response = await fetch("/api/stop-work-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId: "P123",
      dateTime: formData.dateTime,
      areaStopped: formData.areaStopped,
      activityStopped: formData.activityStopped,
      reasonCategory: formData.reasonCategory,
      reasonDescription: formData.reasonDescription,
      issuedBy: formData.issuedBy,
      duration: formData.duration || "",
      immediateActions: formData.immediateActions,
      photos: formData.photos,
      sicSignature: formData.sicSignature,
      status: "active",
    }),
  });
};
```

#### Resolve SWO

```javascript
// Update SWO to resolved status
const resolveSWO = async (swoId, resolvedBy, resolutionNotes) => {
  const response = await fetch(`/api/stop-work-order/${swoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "resolved",
      resolvedBy,
      resolutionNotes,
    }),
  });
};
```

## Notes

- Stop Work Orders are critical safety measures that require immediate action
- Digital signature is mandatory for issuing active SWOs
- All timestamps are in ISO8601 format
- Photos should be uploaded to Cloudinary and URLs provided
- The API supports both draft saving and full issuance workflows
- Resolution tracking provides audit trail for compliance
- Active SWOs can be monitored in real-time for safety management
- Reason categorization helps identify patterns and improve safety measures
