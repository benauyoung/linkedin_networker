# LinkedIn Networker

A full-stack web application for LinkedIn networking events with QR codes. Built with React for the frontend, Node.js with Express for the backend, and MongoDB for the database.

## Features

- **Event Creation**: Organizers can create LinkedIn networking events with name, date, and location details
- **QR Code Generation**: Each event has a unique QR code for attendees to scan
- **Registration**: Attendees scan QR codes to access a registration page
- **Attendee Information**: Collects name, email, and LinkedIn profile from attendees
- **Post-Event Networking**: After the event, attendees receive emails with links to connect with other attendees
- **LinkedIn Integration**: Easily connect with individual or all attendees via LinkedIn

## Tech Stack

- **Frontend**: React, React Router, Bootstrap, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB (with in-memory fallback)
- **QR Code**: qrcode.js
- **Email**: Nodemailer

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running (or MongoDB Atlas account)
- Email account for sending emails (Gmail recommended)

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

### Option 1: Vercel + MongoDB Atlas (Easiest)
- **Frontend**: Deploy to Vercel (free tier available)
  - Connect your GitHub repository
  - Set build command to `cd frontend && npm run build`
  - Set output directory to `frontend/build`
- **Backend**: Vercel Serverless Functions
  - Move backend code to `/api` folder in your project
  - Configure with vercel.json
- **Database**: MongoDB Atlas (free tier available)
  - Create a free cluster
  - Update your MongoDB connection string in environment variables

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
   - The system automatically emails all attendees with a link to the attendee list

5. **Networking After the Event**:
   - Attendees click the link in the email
   - They can see the list of all attendees
   - Connect with individual attendees or all attendees at once via LinkedIn

## Documentation

- [User Guide](./docs/USER_GUIDE.md) - Detailed application usage instructions
- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [API Documentation](./docs/API.md) - API endpoints and usage

## License

MIT
