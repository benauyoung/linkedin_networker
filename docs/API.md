# LinkedIn Networker API Documentation

This document provides comprehensive documentation for the LinkedIn Networker API endpoints.

## Base URL

When running locally:
```
http://localhost:5000/api
```

In production, replace with your deployed backend URL.

## Authentication

Currently, the API does not require authentication tokens. Future versions may implement JWT authentication.

## API Endpoints

### Events

#### Get All Events

```
GET /api/events
```

Retrieves a list of all events.

**Response**:
```json
[
  {
    "_id": "60d21b4967d0d8992e610c85",
    "name": "Tech Networking Mixer",
    "date": "2025-04-15T18:00:00.000Z",
    "location": "San Francisco, CA",
    "description": "Connect with tech professionals in the Bay Area",
    "organizer": "organizer@example.com",
    "createdAt": "2025-03-01T12:00:00.000Z"
  },
  {
    "_id": "60d21b4967d0d8992e610c86",
    "name": "Finance Industry Meetup",
    "date": "2025-04-20T17:30:00.000Z",
    "location": "New York, NY",
    "description": "Networking event for finance professionals",
    "organizer": "organizer@example.com",
    "createdAt": "2025-03-02T09:15:00.000Z"
  }
]
```

**Error Responses**:
```json
{
  "error": "Error listing events",
  "message": "Detailed error message"
}
```

#### Get Event by ID

```
GET /api/events/:id
```

Retrieves a specific event by its ID.

**Parameters**:
- `id`: The MongoDB _id of the event

**Response**:
```json
{
  "_id": "60d21b4967d0d8992e610c85",
  "name": "Tech Networking Mixer",
  "date": "2025-04-15T18:00:00.000Z",
  "location": "San Francisco, CA",
  "description": "Connect with tech professionals in the Bay Area",
  "organizer": "organizer@example.com",
  "createdAt": "2025-03-01T12:00:00.000Z",
  "attendees": [
    {
      "_id": "60d21c1c67d0d8992e610c87",
      "name": "John Doe",
      "email": "john@example.com",
      "linkedinUrl": "https://linkedin.com/in/johndoe"
    }
  ]
}
```

**Error Responses**:
```json
{
  "error": "Event not found"
}
```

```json
{
  "error": "Error finding event",
  "message": "Detailed error message"
}
```

#### Get Event by Code

```
GET /api/events?code=EVTCON123
```

Retrieves a specific event by its unique code.

**Parameters**:
- `code`: The unique event code

**Response**: Same as Get Event by ID

**Error Responses**: Same as Get Event by ID

#### Create Event

```
POST /api/events
```

Creates a new event.

**Request Body**:
```json
{
  "name": "Marketing Professionals Meetup",
  "date": "2025-05-10T19:00:00.000Z",
  "location": "Chicago, IL",
  "description": "Networking for marketing professionals",
  "organizer": "organizer@example.com"
}
```

**Response**:
```json
{
  "_id": "60d21b4967d0d8992e610c87",
  "name": "Marketing Professionals Meetup",
  "date": "2025-05-10T19:00:00.000Z",
  "location": "Chicago, IL",
  "description": "Networking for marketing professionals",
  "organizer": "organizer@example.com",
  "eventCode": "EVTCON123",
  "createdAt": "2025-03-02T10:30:00.000Z"
}
```

**Error Responses**:

For missing required fields:
```json
{
  "error": "Missing required fields",
  "requiredFields": ["name", "date", "location"] 
}
```

For database connection issues:
```json
{
  "error": "Database connection failed",
  "message": "Connection refused"
}
```

For other errors:
```json
{
  "error": "Failed to create event",
  "message": "Detailed error message"
}
```

#### Update Event

```
PUT /api/events/:id
```

Updates an existing event.

**Parameters**:
- `id`: The MongoDB _id of the event

**Request Body**:
```json
{
  "name": "Marketing Professionals Meetup - UPDATED",
  "date": "2025-05-11T19:00:00.000Z",
  "location": "Chicago, IL",
  "description": "Networking for marketing professionals",
  "organizer": "organizer@example.com"
}
```

**Response**:
```json
{
  "_id": "60d21b4967d0d8992e610c87",
  "name": "Marketing Professionals Meetup - UPDATED",
  "date": "2025-05-11T19:00:00.000Z",
  "location": "Chicago, IL",
  "description": "Networking for marketing professionals",
  "organizer": "organizer@example.com",
  "updatedAt": "2025-03-02T11:45:00.000Z"
}
```

#### Delete Event

```
DELETE /api/events/:id
```

Deletes an event.

**Parameters**:
- `id`: The MongoDB _id of the event

**Response**:
```json
{
  "message": "Event deleted successfully"
}
```

### Attendees

#### Get All Attendees

```
GET /api/attendees
```

Retrieves a list of all attendees across all events.

**Response**:
```json
[
  {
    "_id": "60d21c1c67d0d8992e610c87",
    "name": "John Doe",
    "email": "john@example.com",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "eventId": "60d21b4967d0d8992e610c85",
    "registeredAt": "2025-03-01T14:20:00.000Z"
  },
  {
    "_id": "60d21c1c67d0d8992e610c88",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "linkedinUrl": "https://linkedin.com/in/janesmith",
    "eventId": "60d21b4967d0d8992e610c85",
    "registeredAt": "2025-03-01T15:10:00.000Z"
  }
]
```

#### Get Attendees by Event ID

```
GET /api/attendees/event/:eventId
```

Retrieves all attendees for a specific event.

**Parameters**:
- `eventId`: The MongoDB _id of the event

**Response**:
```json
[
  {
    "_id": "60d21c1c67d0d8992e610c87",
    "name": "John Doe",
    "email": "john@example.com",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "eventId": "60d21b4967d0d8992e610c85",
    "registeredAt": "2025-03-01T14:20:00.000Z"
  },
  {
    "_id": "60d21c1c67d0d8992e610c88",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "linkedinUrl": "https://linkedin.com/in/janesmith",
    "eventId": "60d21b4967d0d8992e610c85",
    "registeredAt": "2025-03-01T15:10:00.000Z"
  }
]
```

#### Register Attendee

```
POST /api/attendees
```

Registers a new attendee for an event.

**Request Body**:
```json
{
  "name": "Michael Johnson",
  "email": "michael@example.com",
  "linkedinUrl": "https://linkedin.com/in/michaeljohnson",
  "eventId": "60d21b4967d0d8992e610c85"
}
```

**Response**:
```json
{
  "_id": "60d21c1c67d0d8992e610c89",
  "name": "Michael Johnson",
  "email": "michael@example.com",
  "linkedinUrl": "https://linkedin.com/in/michaeljohnson",
  "eventId": "60d21b4967d0d8992e610c85",
  "registeredAt": "2025-03-02T09:45:00.000Z"
}
```

**Error Response** (if already registered):
```json
{
  "status": "error",
  "message": "You have already registered for this event"
}
```

#### Update Attendee

```
PUT /api/attendees/:id
```

Updates an attendee's information.

**Parameters**:
- `id`: The MongoDB _id of the attendee

**Request Body**:
```json
{
  "name": "Michael Johnson",
  "email": "michael.updated@example.com",
  "linkedinUrl": "https://linkedin.com/in/michaeljohnson"
}
```

**Response**:
```json
{
  "_id": "60d21c1c67d0d8992e610c89",
  "name": "Michael Johnson",
  "email": "michael.updated@example.com",
  "linkedinUrl": "https://linkedin.com/in/michaeljohnson",
  "eventId": "60d21b4967d0d8992e610c85",
  "updatedAt": "2025-03-02T10:15:00.000Z"
}
```

#### Delete Attendee

```
DELETE /api/attendees/:id
```

Removes an attendee from an event.

**Parameters**:
- `id`: The MongoDB _id of the attendee

**Response**:
```json
{
  "message": "Attendee removed successfully"
}
```

### Email Notifications

#### Send Event Summary

```
POST /api/email/send-summary/:eventId
```

Sends an email summary with attendee information to all event participants.

**Parameters**:
- `eventId`: The MongoDB _id of the event

**Response**:
```json
{
  "message": "Summary emails sent successfully to 25 attendees"
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: A resource was successfully created
- `400 Bad Request`: The request was invalid or cannot be served
- `404 Not Found`: The resource does not exist
- `500 Internal Server Error`: Server-side error
- `503 Service Unavailable`: Database connection issues

Error responses include detailed information:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

For database connection errors, a fallback to demo mode is available, which will be indicated in the response.

## MongoDB Connection

The application uses MongoDB for data storage with the following features:

1. **Connection Pooling**: Reuses database connections for better performance in serverless environments
2. **Timeouts**: Implements connection timeouts to prevent hanging requests
3. **Error Handling**: Comprehensive error handling for database operations
4. **Fallback Mode**: Falls back to in-memory MongoDB if Atlas connection fails

## Data Models

### Event Schema

```javascript
{
  name: String,              // Required
  date: Date,                // Required
  location: String,          // Required
  description: String,       // Optional
  organizer: String,         // Email of organizer
  eventCode: String,         // Unique code for event registration (auto-generated)
  qrCodeUrl: String,         // URL to QR code image (auto-generated)
  isCompleted: Boolean,      // Whether the event is completed (default: false)
  createdAt: Date,           // Automatically set
  updatedAt: Date            // Automatically updated
}
```

### Attendee Schema

```javascript
{
  name: String,              // Required
  email: String,             // Required
  linkedinUrl: String,       // Required
  eventId: String,           // Required (reference to Event)
  registeredAt: Date,        // Automatically set
  updatedAt: Date            // Automatically updated
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute per IP address
- 5 event creations per hour per IP address

Exceeding these limits will result in a `429 Too Many Requests` response.

## Future API Features

The following features are planned for future releases:

1. JWT Authentication
2. User accounts for event organizers
3. Analytics endpoints
4. Webhook integrations
5. LinkedIn API integration
