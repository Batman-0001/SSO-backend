# HSE Management Backend

A comprehensive backend API for Health, Safety, and Environment (HSE) management system built with Node.js, Express, and MongoDB.

## Features

- **Safety Observations**: Create, read, update, and delete safety observations
- **Image Upload**: Cloudinary integration for photo and signature uploads
- **User Authentication**: JWT-based authentication with role-based access control
- **Data Validation**: Comprehensive input validation and error handling
- **Statistics**: Safety observation analytics and reporting

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for image storage
- Express Validator for input validation
- Multer for file uploads

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hse_management

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server
PORT=5000
NODE_ENV=development
```

### 3. Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from the dashboard
3. Update the `.env` file with your Cloudinary credentials

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "employeeId": "EMP001",
  "role": "employee",
  "department": "Safety",
  "phone": "+1234567890"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

### Induction Training

#### Create Induction Training

```
POST /api/induction-training
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "trainingDate": "2024-01-15",
  "duration": 120,
  "contractor": "ABC Construction Ltd",
  "trainerName": "John Smith",
  "attendanceCount": 25,
  "attendees": [
    {
      "name": "Mike Johnson",
      "empId": "EMP001",
      "contractor": "ABC Construction Ltd"
    },
    {
      "name": "Sarah Wilson",
      "empId": "EMP002",
      "contractor": "ABC Construction Ltd"
    }
  ],
  "notes": "Safety protocols and emergency procedures covered",
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All Induction Training Records

```
GET /api/induction-training?page=1&limit=10&contractor=ABC&status=completed
Authorization: Bearer <token>
```

#### Get Single Induction Training Record

```
GET /api/induction-training/:id
Authorization: Bearer <token>
```

#### Update Induction Training Record

```
PUT /api/induction-training/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Training completed successfully"
}
```

#### Get Induction Training Statistics

```
GET /api/induction-training/stats/overview?projectId=P123
Authorization: Bearer <token>
```

### CSV Upload for Bulk Attendee Data

#### Upload CSV File

```
POST /api/csv-upload/attendees
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: csv (file)
```

#### Validate Attendee Data

```
POST /api/csv-upload/validate-attendees
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendees": [
    {
      "name": "John Doe",
      "empId": "EMP001",
      "contractor": "ABC Construction Ltd"
    }
  ]
}
```

#### Download CSV Template

```
GET /api/csv-upload/template
Authorization: Bearer <token>
```

### Daily Training Talk

#### Create Daily Training

```
POST /api/daily-training
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "date": "2024-01-15",
  "topic": "PPE Usage and Safety",
  "duration": 30,
  "trainer": "John Smith",
  "attendeesCount": 15,
  "keyPoints": [
    "Proper helmet fitting and inspection",
    "Safety harness usage guidelines",
    "Emergency procedures review"
  ],
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All Daily Training Records

```
GET /api/daily-training?page=1&limit=10&topic=PPE&trainer=John&status=completed
Authorization: Bearer <token>
```

#### Get Single Daily Training Record

```
GET /api/daily-training/:id
Authorization: Bearer <token>
```

#### Update Daily Training Record

```
PUT /api/daily-training/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "keyPoints": [
    "Updated key point 1",
    "Updated key point 2"
  ]
}
```

#### Get Daily Training Statistics

```
GET /api/daily-training/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Popular Training Topics

```
GET /api/daily-training/topics/popular?projectId=P123&limit=10
Authorization: Bearer <token>
```

### PEP Talk

#### Create PEP Talk

```
POST /api/pep-talk
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "date": "2024-01-15",
  "topic": "Environmental Protection and Energy Conservation",
  "duration": 45,
  "trainer": "John Smith",
  "attendeesCount": 20,
  "keyPoints": [
    "Energy conservation techniques",
    "Environmental impact reduction",
    "Sustainable practices in construction"
  ],
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All PEP Talk Records

```
GET /api/pep-talk?page=1&limit=10&topic=Environmental&trainer=John&status=completed
Authorization: Bearer <token>
```

#### Get Single PEP Talk Record

```
GET /api/pep-talk/:id
Authorization: Bearer <token>
```

#### Update PEP Talk Record

```
PUT /api/pep-talk/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "keyPoints": [
    "Updated key point 1",
    "Updated key point 2"
  ]
}
```

#### Get PEP Talk Statistics

```
GET /api/pep-talk/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Popular PEP Talk Topics

```
GET /api/pep-talk/topics/popular?projectId=P123&limit=10
Authorization: Bearer <token>
```

### Special Technical Training

#### Create Special Training

```
POST /api/special-training
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "date": "2024-01-15",
  "topic": "Advanced Scaffolding Techniques",
  "duration": 120,
  "trainer": "John Smith",
  "attendeesCount": 12,
  "keyPoints": [
    "Advanced scaffolding assembly techniques",
    "Safety protocols for high-rise construction",
    "Load calculation and weight distribution"
  ],
  "certificationsIssued": true,
  "permitRequired": true,
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All Special Training Records

```
GET /api/special-training?page=1&limit=10&topic=Scaffolding&certificationsIssued=true&permitRequired=true
Authorization: Bearer <token>
```

#### Get Single Special Training Record

```
GET /api/special-training/:id
Authorization: Bearer <token>
```

#### Update Special Training Record

```
PUT /api/special-training/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "certificationsIssued": true,
  "permitRequired": false,
  "keyPoints": [
    "Updated key point 1",
    "Updated key point 2"
  ]
}
```

#### Get Special Training Statistics

```
GET /api/special-training/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Popular Special Training Topics

```
GET /api/special-training/topics/popular?projectId=P123&limit=10
Authorization: Bearer <token>
```

#### Get Certification Training Summary

```
GET /api/special-training/certifications/summary?projectId=P123
Authorization: Bearer <token>
```

### Safety Advisory Warning

#### Create Safety Advisory Warning

```
POST /api/safety-advisory-warning
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "date": "2024-01-15",
  "warningTitle": "High Winds Expected - Crane Operations Suspended",
  "severity": "high",
  "affectedArea": "Zone A, All crane operations",
  "description": "Weather forecast indicates high winds exceeding 40 mph expected from 2 PM to 6 PM today. All crane operations must be suspended during this period.",
  "validityFrom": "2024-01-15",
  "validityTo": "2024-01-15",
  "actionsRequired": "1. Secure all crane loads immediately\n2. Lower crane booms to safe position\n3. Notify all crane operators\n4. Resume operations only after wind speed drops below 25 mph",
  "owner": "Site Safety Manager",
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All Safety Advisory Warnings

```
GET /api/safety-advisory-warning?page=1&limit=10&severity=high&status=active&affectedArea=Zone
Authorization: Bearer <token>
```

#### Get Single Safety Advisory Warning

```
GET /api/safety-advisory-warning/:id
Authorization: Bearer <token>
```

#### Update Safety Advisory Warning

```
PUT /api/safety-advisory-warning/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "severity": "medium",
  "validityTo": "2024-01-16"
}
```

#### Acknowledge Safety Advisory Warning

```
POST /api/safety-advisory-warning/:id/acknowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Acknowledged and actions taken"
}
```

#### Get Safety Advisory Warning Statistics

```
GET /api/safety-advisory-warning/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Currently Active Warnings

```
GET /api/safety-advisory-warning/active/current?projectId=P123
Authorization: Bearer <token>
```

### Stop Work Order

#### Create Stop Work Order

```
POST /api/stop-work-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "dateTime": "2024-01-15T14:30:00Z",
  "areaStopped": "Zone B - Excavation Area",
  "activityStopped": "Excavation and foundation work",
  "reasonCategory": "unsafe_condition",
  "reasonDescription": "Unstable soil conditions detected with visible cracks in excavation walls. Risk of collapse imminent.",
  "issuedBy": "John Smith (EMP345)",
  "duration": "Until safety measures implemented",
  "immediateActions": "1. Evacuate all personnel from excavation area\n2. Install temporary shoring\n3. Conduct soil stability assessment\n4. Implement additional safety measures",
  "photos": ["https://cloudinary.com/image1.jpg"],
  "sicSignature": "data:image/png;base64,..."
}
```

#### Get All Stop Work Orders

```
GET /api/stop-work-order?page=1&limit=10&reasonCategory=unsafe_condition&status=active&areaStopped=Zone
Authorization: Bearer <token>
```

#### Get Single Stop Work Order

```
GET /api/stop-work-order/:id
Authorization: Bearer <token>
```

#### Update Stop Work Order

```
PUT /api/stop-work-order/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "resolvedBy": "Safety Manager",
  "resolutionNotes": "Additional shoring installed and soil stabilized"
}
```

#### Get Stop Work Order Statistics

```
GET /api/stop-work-order/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Currently Active Stop Work Orders

```
GET /api/stop-work-order/active/current?projectId=P123
Authorization: Bearer <token>
```

#### Get Reason Categories with Counts

```
GET /api/stop-work-order/reasons/categories?projectId=P123
Authorization: Bearer <token>
```

### First-Aid Case

#### Create First-Aid Case

```
POST /api/first-aid
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "dateTime": "2024-01-15T14:30:00Z",
  "victimName": "John Smith",
  "victimEmpId": "EMP123",
  "injuryType": "Cut on hand",
  "cause": "Slipped while carrying materials and cut hand on sharp edge",
  "treatmentGiven": "Cleaned wound with antiseptic, applied bandage, advised to see doctor if signs of infection",
  "transportToHospital": false,
  "hospitalName": "",
  "hospitalDetails": "",
  "witnessNames": ["Mike Johnson", "Sarah Wilson"],
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All First-Aid Cases

```
GET /api/first-aid?page=1&limit=10&injuryType=Cut&status=reported&transportToHospital=false&victimEmpId=EMP123
Authorization: Bearer <token>
```

#### Get Single First-Aid Case

```
GET /api/first-aid/:id
Authorization: Bearer <token>
```

#### Update First-Aid Case

```
PUT /api/first-aid/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "investigated",
  "investigationNotes": "Incident investigated, additional safety measures implemented",
  "followUpRequired": true,
  "followUpDate": "2024-01-20",
  "followUpNotes": "Check victim's recovery status"
}
```

#### Get First-Aid Statistics

```
GET /api/first-aid/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Popular Injury Types

```
GET /api/first-aid/injury-types/popular?projectId=P123&limit=10
Authorization: Bearer <token>
```

#### Get Due Follow-ups

```
GET /api/first-aid/follow-up/due?projectId=P123
Authorization: Bearer <token>
```

### Near Miss

#### Create Near Miss Report

```
POST /api/near-miss
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "dateTime": "2024-01-15T14:30:00Z",
  "location": "Zone A - Construction Site",
  "situation": "Worker almost fell from scaffolding while not wearing safety harness. Lost balance while reaching for materials.",
  "potentialConsequence": "Serious injury or fatality from fall from height. Could have resulted in broken bones, head injury, or death.",
  "preventiveActions": "1. Ensure all workers wear safety harnesses at all times\n2. Install guardrails on all scaffolding\n3. Conduct daily safety briefings\n4. Implement buddy system for high-risk work",
  "reportedBy": "John Smith (EMP345)",
  "severity": "high",
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All Near Miss Reports

```
GET /api/near-miss?page=1&limit=10&severity=high&status=reported&location=Zone
Authorization: Bearer <token>
```

#### Get Single Near Miss Report

```
GET /api/near-miss/:id
Authorization: Bearer <token>
```

#### Update Near Miss Report

```
PUT /api/near-miss/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "action_taken",
  "actionsTaken": "Safety harnesses made mandatory, guardrails installed",
  "actionOwner": "Safety Manager",
  "actionDeadline": "2024-01-20",
  "severity": "critical"
}
```

#### Get Near Miss Statistics

```
GET /api/near-miss/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Overdue Actions

```
GET /api/near-miss/actions/overdue?projectId=P123
Authorization: Bearer <token>
```

#### Get Popular Lessons Learned

```
GET /api/near-miss/lessons/popular?projectId=P123&limit=10
Authorization: Bearer <token>
```

#### Get Frequent Locations

```
GET /api/near-miss/locations/frequent?projectId=P123&limit=10
Authorization: Bearer <token>
```

### Dangerous Occurrence

#### Create Dangerous Occurrence Report

```
POST /api/dangerous-occurrence
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "dateTime": "2024-01-15T14:30:00Z",
  "location": "Zone A - Construction Site",
  "situation": "Crane boom collapsed during lifting operation, narrowly missing workers below. No injuries but significant property damage.",
  "potentialConsequence": "Multiple fatalities, serious injuries, major property damage, project shutdown, regulatory investigation",
  "preventiveActions": "1. Immediate crane inspection and certification\n2. Enhanced safety protocols for lifting operations\n3. Additional training for crane operators\n4. Regular equipment maintenance schedule",
  "reportedBy": "John Smith (EMP345)",
  "investigationRequired": true,
  "severity": "critical",
  "photos": ["https://cloudinary.com/image1.jpg"]
}
```

#### Get All Dangerous Occurrence Reports

```
GET /api/dangerous-occurrence?page=1&limit=10&severity=critical&status=reported&investigationRequired=true&headOfficeNotified=true
Authorization: Bearer <token>
```

#### Get Single Dangerous Occurrence Report

```
GET /api/dangerous-occurrence/:id
Authorization: Bearer <token>
```

#### Update Dangerous Occurrence Report

```
PUT /api/dangerous-occurrence/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "under_investigation",
  "investigator": "Safety Manager",
  "investigationNotes": "Formal investigation initiated",
  "severity": "critical"
}
```

#### Complete Investigation

```
PUT /api/dangerous-occurrence/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "investigation_complete",
  "investigationFindings": "Crane boom failure due to metal fatigue in critical load-bearing component",
  "rootCause": "Inadequate maintenance schedule and insufficient inspection protocols",
  "correctiveActions": "Implement weekly crane inspections, mandatory certification renewal, enhanced operator training"
}
```

#### Get Dangerous Occurrence Statistics

```
GET /api/dangerous-occurrence/stats/overview?projectId=P123
Authorization: Bearer <token>
```

#### Get Active Investigations

```
GET /api/dangerous-occurrence/investigations/active?projectId=P123
Authorization: Bearer <token>
```

#### Get Overdue Actions

```
GET /api/dangerous-occurrence/actions/overdue?projectId=P123
Authorization: Bearer <token>
```

#### Get Pending Regulatory Reports

```
GET /api/dangerous-occurrence/regulatory/pending?projectId=P123
Authorization: Bearer <token>
```

### Safety Observations

#### Create Safety Observation

```
POST /api/safety-observations
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "P123",
  "type": "unsafe_act",
  "dateTime": "2024-01-15T10:30:00Z",
  "location": "Zone A - Crane 3",
  "observedBy": "John Smith (EMP345)",
  "observedPerson": "Mike Johnson",
  "severity": "High",
  "description": "Worker not wearing safety helmet while operating crane",
  "correctiveAction": "Immediate stop work, provide safety helmet",
  "actionOwner": "site_incharge",
  "targetClosureDate": "2024-01-20",
  "photos": ["https://cloudinary.com/image1.jpg"],
  "signature": "data:image/png;base64,..."
}
```

#### Get All Safety Observations

```
GET /api/safety-observations?page=1&limit=10&severity=High&status=open
Authorization: Bearer <token>
```

#### Get Single Safety Observation

```
GET /api/safety-observations/:id
Authorization: Bearer <token>
```

#### Update Safety Observation

```
PUT /api/safety-observations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "assignedTo": "Safety Manager",
  "closureNotes": "Action taken and verified"
}
```

#### Get Safety Statistics

```
GET /api/safety-observations/stats/overview?projectId=P123
Authorization: Bearer <token>
```

### File Upload

#### Upload Single Image

```
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: image (file)
```

#### Upload Multiple Images

```
POST /api/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: images (files, max 6)
```

#### Upload Signature

```
POST /api/upload/signature
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: signature (file)
```

#### Delete Image

```
DELETE /api/upload/:publicId
Authorization: Bearer <token>
```

## Data Models

### Safety Observation Schema

```javascript
{
  projectId: String (required),
  type: String (enum: ['unsafe_act', 'unsafe_condition']),
  dateTime: Date (required),
  location: String (required),
  observedBy: String (required),
  observedPerson: String,
  severity: String (enum: ['Low', 'Medium', 'High', 'Critical']),
  description: String (required, min 10 chars),
  correctiveAction: String,
  actionOwner: String (enum: ['site_incharge', 'contractor_rep', 'other']),
  targetClosureDate: Date,
  photos: [String], // Cloudinary URLs (max 6),
  signature: String, // Base64 or Cloudinary URL
  status: String (enum: ['open', 'in_progress', 'closed', 'cancelled']),
  assignedTo: String,
  closureDate: Date,
  closureNotes: String,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, min 6 chars),
  employeeId: String (required, unique),
  role: String (enum: ['admin', 'manager', 'supervisor', 'employee', 'contractor']),
  department: String,
  phone: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules

### Safety Observation Validation

- **Required fields**: projectId, type, dateTime, location, observedBy, severity, description, actionOwner
- **Description**: Minimum 10 characters
- **Corrective Action**: Required for Medium/High/Critical severity
- **Photos**: Maximum 6 images
- **Target Closure Date**: Must be in the future

### File Upload Validation

- **File Types**: Only image files allowed
- **File Size**: Maximum 10MB per file
- **Multiple Images**: Maximum 6 files per request
- **Image Processing**: Automatic resizing and optimization via Cloudinary

## Error Handling

The API returns consistent error responses:

```javascript
{
  "message": "Error description",
  "errors": [ // For validation errors
    {
      "field": "fieldName",
      "msg": "Error message"
    }
  ]
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for security headers
- Input validation and sanitization
- File type and size restrictions

## Development

### Scripts

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
npm test       # Run tests
```

### Project Structure

```
backend/
├── config/
│   └── cloudinary.js
├── middleware/
│   └── auth.js
├── models/
│   ├── SafetyObservation.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── safetyObservations.js
│   └── upload.js
├── server.js
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
