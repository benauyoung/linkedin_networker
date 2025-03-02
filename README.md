# EVENT CONNECT

A full-stack web application for professional networking events with QR codes. Built with React for the frontend, Node.js with Express for the backend, and MongoDB for the database.

## Features

- **Event Creation**: Organizers can create professional networking events with name, date, and location details
- **QR Code Generation**: Each event has a unique QR code for attendees to scan
- **Registration**: Attendees scan QR codes to access a registration page
- **Attendee Information**: Collects name, email, and LinkedIn profile from attendees
- **Post-Event Networking**: Access the list of attendees after the event for networking opportunities
- **LinkedIn Integration**: Easily connect with individual or all attendees via LinkedIn
- **Robust MongoDB Integration**: Optimized database connections for serverless environments with auto-fallback to in-memory database
- **Error Handling**: Comprehensive error handling with clear user feedback and fallback mechanisms

## Tech Stack

- **Frontend**: React, React Router, Bootstrap, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB (with in-memory fallback)
- **Deployment**: Vercel Serverless Functions
- **QR Code**: qrcode.react
- **Email**: Nodemailer (Optional Configuration)

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running (or MongoDB Atlas account)
- Email account for sending emails (Optional)

## Installation and Setup

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd event-registration-app/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Update the .env file with your MongoDB URI, email credentials, and other settings

4. Start the backend server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd event-registration-app/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

## Deployment Options

### Option 1: Vercel + MongoDB Atlas (Recommended)
- **Frontend & API**: Deploy to Vercel (free tier available)
  - Connect your GitHub repository
  - Set build command to `npm run vercel-build`
  - Set output directory to `frontend/build`
  - Add MongoDB connection string to environment variables
  - Optimize for serverless with proper function settings in vercel.json
- **Database**: MongoDB Atlas (free tier available)
  - Create a free cluster
  - Configure network access for Vercel's IP ranges
  - Use optimized connection string with proper timeout settings

### Option 2: Netlify + Render + MongoDB Atlas
- **Frontend**: Deploy to Netlify (free tier available)
- **Backend**: Deploy to Render (free tier available)
- **Database**: MongoDB Atlas (free tier available)

### Option 3: Heroku + MongoDB Atlas
- **Full Stack**: Deploy both frontend and backend to Heroku
- **Database**: MongoDB Atlas

Detailed deployment instructions are available in the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

## How to Use

1. **Create an Event**:
   - Navigate to the "Create Event" page
   - Fill in event details
   - Submit the form to create the event and generate a QR code

2. **Share QR Code**:
   - Display the QR code at your event
   - Attendees can scan the QR code with their smartphone

3. **Attendee Registration**:
   - Attendees scan the QR code and land on the registration page
   - They fill in their name, email, and LinkedIn profile information

4. **Complete the Event**:
   - After the event, mark it as completed
   - Access the full list of attendees for networking purposes

5. **Networking After the Event**:
   - View the list of all attendees
   - Connect with individual attendees or all attendees at once via LinkedIn

## Database Architecture

The application uses MongoDB with the following optimizations:

1. **Connection Pooling**: Efficiently reuses database connections
2. **Smart Timeout Handling**: Prevents hanging connections in serverless environments
3. **Fallback Mechanism**: Automatically switches to in-memory MongoDB if Atlas connection fails
4. **Error Handling**: Graceful error handling with appropriate user feedback

## Documentation

- [User Guide](./docs/USER_GUIDE.md) - Detailed application usage instructions
- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [API Documentation](./docs/API.md) - API endpoints and usage

## License

MIT
