# EVENT CONNECT API Documentation

This document provides comprehensive documentation for the EVENT CONNECT API endpoints.

## Base URL

When using the serverless deployment:
```
https://linkedin-networker-g0nohien6-bens-projects-6fbea0fe.vercel.app
```

For local development:
```
http://localhost:3000
```

## API Endpoints

### Events

#### Get All Events

```
GET /events
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
    "eventCode": "TECH123",
    "isCompleted": false,
    "createdAt": "2025-03-01T12:00:00.000Z"
  },
  {
    "_id": "60d21b4967d0d8992e610c86",
    "name": "Finance Industry Meetup",
    "date": "2025-04-20T17:30:00.000Z",
    "location": "New York, NY",
    "description": "Networking event for finance professionals",
    "eventCode": "FIN456",
    "isCompleted": false,
    "createdAt": "2025-03-02T09:15:00.000Z"
  }
]
```

#### Get Event by ID or Event Code

```
GET /events?id=60d21b4967d0d8992e610c85
```

OR

```
GET /events?eventCode=TECH123
```

Retrieves a specific event by its MongoDB ID or event code.

**Response**:
```json
{
  "_id": "60d21b4967d0d8992e610c85",
  "name": "Tech Networking Mixer",
  "date": "2025-04-15T18:00:00.000Z",
  "location": "San Francisco, CA",
  "description": "Connect with tech professionals in the Bay Area",
  "eventCode": "TECH123",
  "isCompleted": false,
  "createdAt": "2025-03-01T12:00:00.000Z"
}
```

#### Create Event

```
POST /events
```

Creates a new event.

**Request Body**:
```json
{
  "name": "AI Conference Networking",
  "date": "2025-05-10T15:00:00.000Z",
  "location": "Online",
  "description": "Virtual networking for AI professionals"
}
```

**Response**:
```json
{
  "_id": "60d21b4967d0d8992e610c87",
  "name": "AI Conference Networking",
  "date": "2025-05-10T15:00:00.000Z",
  "location": "Online",
  "description": "Virtual networking for AI professionals",
  "eventCode": "AI789",
  "isCompleted": false,
  "createdAt": "2025-03-03T14:30:00.000Z"
}
```

### Attendees

#### Get Attendees for an Event

```
GET /attendees?eventId=60d21b4967d0d8992e610c85
```

Retrieves all attendees for a specific event. The eventId can be either the MongoDB ID or the event code.

**Response**:
```json
[
  {
    "_id": "60d21c6367d0d8992e610c88",
    "name": "John Doe",
    "email": "john@example.com",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "eventId": "TECH123",
    "registeredAt": "2025-03-10T09:30:00.000Z"
  },
  {
    "_id": "60d21c6367d0d8992e610c89",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "linkedinUrl": "https://linkedin.com/in/janesmith",
    "eventId": "TECH123",
    "registeredAt": "2025-03-10T10:15:00.000Z"
  }
]
```

#### Register Attendee

```
POST /attendees
```

Registers a new attendee for an event.

**Request Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "linkedinUrl": "https://linkedin.com/in/alexjohnson",
  "eventId": "TECH123"
}
```

**Response**:
```json
{
  "_id": "60d21c6367d0d8992e610c90",
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "linkedinUrl": "https://linkedin.com/in/alexjohnson",
  "eventId": "TECH123",
  "registeredAt": "2025-03-10T11:45:00.000Z"
}
```

### Complete Event

#### Mark Event as Completed

```
POST /complete-event
```

Marks an event as completed and optionally sends follow-up emails to attendees.

**Request Body**:
```json
{
  "eventId": "60d21b4967d0d8992e610c85"
}
```

**Response**:
```json
{
  "message": "Event marked as completed successfully",
  "eventId": "60d21b4967d0d8992e610c85",
  "attendeeCount": 2,
  "emailsSent": true
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include a descriptive message:

```json
{
  "error": "Event not found",
  "message": "The requested event does not exist"
}
```

## Database Fallback Mechanism

The API includes an in-memory database fallback if the MongoDB connection fails. This ensures your application continues to function even if the database connection is temporarily unavailable:

1. The system first attempts to connect to MongoDB
2. If the connection fails, it automatically switches to an in-memory MongoDB
3. Users see a "Demo Mode" banner when the fallback is active
4. All functionality continues to work, but data is not persisted

This mechanism is especially useful for presentations, demos, and handling temporary connectivity issues.
