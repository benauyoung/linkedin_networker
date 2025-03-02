# EVENT CONNECT Architecture Documentation

This document outlines the architectural design of the EVENT CONNECT application.

## Application Overview

EVENT CONNECT is a full-stack web application designed to facilitate networking at professional events through QR code registration and attendee management. The application follows a client-server architecture with a React frontend and Node.js/Express backend, using MongoDB for data persistence.

## System Architecture

### High-Level Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Frontend   │────▶│   Backend   │────▶│  Database   │
│  (React)    │     │ (Node.js/   │     │ (MongoDB)   │
│             │◀────│  Express)   │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Optional    │
                    │ Email       │
                    │ Service     │
                    └─────────────┘
```

### Frontend Architecture

The frontend is built with React and follows a component-based architecture:

```
┌─────────────────────────────────────────────┐
│                  App                        │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌─────────────┐        ┌─────────────────┐
│ Routes      │        │ Context         │
└──────┬──────┘        │ (State Mgmt)    │
       │               └─────────────────┘
       ▼
┌─────────────────────────────────────────────┐
│                                             │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │Navigation │  │ Home      │  │EventList │ │
│  │Component  │  │Component  │  │Component │ │
│  └───────────┘  └───────────┘  └──────────┘ │
│                                             │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │EventForm  │  │EventDetail│  │Registration│ │
│  │Component  │  │Component  │  │Component  │ │
│  └───────────┘  └───────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### Key Components

1. **Navigation Component**: Provides global navigation throughout the application
2. **Home Component**: Displays the main landing page with event cards
3. **EventList Component**: Renders a list of all events
4. **EventForm Component**: Handles event creation with form validation
5. **EventDetail Component**: Shows detailed information about a specific event, including QR code
6. **RegistrationForm Component**: Allows attendees to register for an event

### Backend Architecture

The backend is built with Node.js and Express, structured around API endpoints that serve the frontend:

```
┌─────────────────────────────────────────────┐
│               Express Server                │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌─────────────┐        ┌─────────────────┐
│ API Routes  │        │ Database        │
└──────┬──────┘        │ Connection      │
       │               └────────┬────────┘
       │                        │
       │                        ▼
       │               ┌─────────────────┐
       │               │ In-Memory DB    │
       │               │ Fallback        │
       │               └─────────────────┘
       ▼
┌─────────────────────────────────────────────┐
│                                             │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │Event      │  │Attendee   │  │Email     │ │
│  │Controller │  │Controller │  │Service   │ │
│  └───────────┘  └───────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### API Endpoints

1. **Event Endpoints**:
   - `GET /events`: List all events
   - `GET /events?id=<id>`: Get an event by ID
   - `GET /events?eventCode=<code>`: Get an event by code
   - `POST /events`: Create a new event
   - `POST /complete-event`: Mark an event as completed

2. **Attendee Endpoints**:
   - `GET /attendees?eventId=<id>`: Get attendees for an event
   - `POST /attendees`: Register a new attendee

### Database Architecture

The application uses MongoDB with a collection-based structure:

```
┌─────────────────────────────────────────────┐
│              MongoDB Database               │
└─────────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌─────────────┐        ┌─────────────────┐
│ Events      │        │ Attendees       │
│ Collection  │        │ Collection      │
└─────────────┘        └─────────────────┘
```

#### Schema Design

1. **Event Schema**:
```javascript
{
  name: String,              // Required
  date: Date,                // Required
  location: String,          // Required
  description: String,       // Optional
  eventCode: String,         // Unique code for event registration
  isCompleted: Boolean,      // Whether event is completed
  createdAt: Date            // Automatically set
}
```

2. **Attendee Schema**:
```javascript
{
  name: String,              // Required
  email: String,             // Required
  linkedinUrl: String,       // LinkedIn profile URL
  eventId: String,           // Reference to event (ID or code)
  registeredAt: Date         // Automatically set
}
```

### In-Memory Database Fallback

A key architectural feature is the in-memory database fallback system:

```
┌─────────────────┐     ┌──────────────────┐
│ MongoDB Atlas   │     │ Connection        │
│ Connection      │────▶│ Success?         │
└─────────────────┘     └────────┬─────────┘
                                 │
                     ┌───────────┴───────────┐
                     │                       │
                     ▼                       ▼
          ┌─────────────────┐     ┌─────────────────┐
          │ Use MongoDB     │     │ Fall back to    │
          │ Atlas           │     │ in-memory       │
          └─────────────────┘     │ MongoDB         │
                                  └─────────────────┘
                                          │
                                          ▼
                                  ┌─────────────────┐
                                  │ Show "Demo Mode"│
                                  │ banner to user  │
                                  └─────────────────┘
```

This architecture provides:
1. **Resilience**: The application can function even when the primary database is unavailable
2. **Demo Capability**: Presentations can occur without requiring a live database connection
3. **Development Flexibility**: Developers can work without setting up MongoDB locally

## Data Flow

### Event Creation Flow

```
User Input → Frontend Form → API Request → Event Controller → MongoDB → Response → UI Update with QR Code
```

### Registration Flow

```
QR Code Scan → Registration Page → Form Submission → API Request → Attendee Controller → MongoDB → Confirmation Display
```

### Attendee Listing Flow

```
Event Selection → API Request → Event Controller → MongoDB → Attendee Data → UI Display
```

## QR Code Implementation

The QR code system is a critical component that enables the core functionality:

```
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│ Event Creation │ → │ QR Code        │ → │ URL Generation │
│ Completed      │   │ Generation     │   │ with Event Code│
└────────────────┘   └────────────────┘   └────────────────┘
                                                  │
┌────────────────┐   ┌────────────────┐          │
│ Registration   │ ← │ User Scans     │ ←────────┘
│ Form Loading   │   │ QR Code        │
└────────────────┘   └────────────────┘
```

The QR code encodes a URL that includes:
- Base application URL
- Registration route
- Event code as a parameter

When scanned, this directs users to the pre-populated registration form specifically for that event.

## Security Considerations

1. **Data Validation**: All user inputs are validated on both client and server side
2. **Sanitization**: Input data is sanitized to prevent injection attacks
3. **Error Handling**: Errors are caught and handled gracefully without exposing sensitive information
4. **Environment Variables**: Sensitive configuration is stored in environment variables

## Performance Optimizations

1. **Database Connection Pooling**: Reuses database connections for better performance
2. **Lazy Loading**: Components and routes are loaded only when needed
3. **Optimized MongoDB Queries**: Proper indexing and query optimization
4. **React Component Optimization**: Efficient rendering and state management

## Deployment Architecture

### Vercel Deployment (Recommended)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  GitHub     │────▶│   Vercel    │────▶│  MongoDB    │
│  Repository │     │ (Serverless)│     │  Atlas      │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

This deployment model provides:
1. **Serverless Architecture**: Scales automatically based on demand
2. **Global CDN**: Low-latency access worldwide
3. **Automatic Deployments**: CI/CD pipeline from GitHub
4. **Environment Variable Management**: Secure storage of configuration

## Future Architectural Considerations

1. **Authentication**: Adding user authentication for event creators
2. **Caching Layer**: Redis or similar for improved performance
3. **Microservices**: Breaking the backend into distinct microservices for better scalability
4. **Real-time Updates**: WebSocket integration for live attendee updates
5. **Analytics System**: Tracking event statistics and attendee engagement
