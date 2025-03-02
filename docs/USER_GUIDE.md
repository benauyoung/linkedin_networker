# EVENT CONNECT User Guide

This comprehensive guide will help you understand how to use EVENT CONNECT to create and manage professional networking events.

## Table of Contents
- [Getting Started](#getting-started)
- [Creating an Event](#creating-an-event)
- [Managing Events](#managing-events)
- [Event Registration](#event-registration)
- [Viewing Attendees](#viewing-attendees)
- [Completing an Event](#completing-an-event)
- [Troubleshooting](#troubleshooting)

## Getting Started

EVENT CONNECT is a web application designed to streamline the process of organizing and managing networking events. Here's how to get started:

1. **Access the Application**:
   - Open your web browser and navigate to [EVENT CONNECT](https://linkedin-networker-g0nohien6-bens-projects-6fbea0fe.vercel.app)
   - No login is required to use the application

2. **Main Dashboard**:
   - When you first open the application, you'll see the home page displaying upcoming events
   - The navigation bar at the top provides access to different sections of the application

## Creating an Event

1. **Navigate to Create Event Page**:
   - Click on the "Create Event" button in the navigation bar

2. **Fill in Event Details**:
   - **Event Name**: Enter a descriptive name for your event (required)
   - **Date**: Select the date and time of your event (required)
   - **Location**: Enter the physical or virtual location (required)
   - **Description**: Provide additional details about your event (optional)

3. **Submit the Form**:
   - Click the "Create Event" button at the bottom of the form
   - If successful, you'll be redirected to the event details page

4. **Event Code and QR Code**:
   - Each event is automatically assigned a unique event code
   - A QR code is generated that links to the registration page for your event
   - Attendees can scan this QR code to register for your event

## Managing Events

1. **View All Events**:
   - The home page displays all your events in a card format
   - Each card shows key information: event name, date, location, and status

2. **Event Details**:
   - Click on an event card to view its details
   - The details page shows all information about the event, including the QR code

3. **Event Actions**:
   - From the event details page, you can:
     - View the registration page
     - View the list of attendees
     - Complete the event
     - Access the QR code for sharing

## Event Registration

1. **Registration Methods**:
   - **QR Code**: Attendees can scan the QR code with their smartphone
   - **Direct Link**: Alternatively, you can share the registration link directly

2. **Registration Form**:
   - Attendees will see a registration form with your event details
   - They need to provide:
     - Name (required)
     - Email (required)
     - LinkedIn URL (optional but recommended)

3. **Confirmation**:
   - After successful registration, attendees will see a confirmation message
   - The system prevents duplicate registrations based on email addresses

## Viewing Attendees

1. **Access Attendee List**:
   - From the event details page, click the "View List" button
   - A modal will open showing all registered attendees

2. **Attendee Information**:
   - The list displays each attendee's name and email
   - For privacy reasons, LinkedIn URLs are only displayed on the post-event attendee page

## Completing an Event

1. **Mark Event as Completed**:
   - After your event has concluded, navigate to the event details page
   - Click the "Complete Event" button
   - Confirm your action in the dialog that appears

2. **Post-Completion Actions**:
   - The event status changes to "Completed"
   - If email functionality is enabled, a follow-up email is sent to all attendees

## Troubleshooting

### QR Code Issues

**Problem**: QR code not linking to the registration page

**Solution**:
1. Make sure you're using the latest version of the application
2. Try accessing the registration page directly by clicking the "Registration Page" button
3. Verify that the event code is correct in the URL
4. If using a smartphone to scan, ensure it has a reliable internet connection

### Registration Issues

**Problem**: Attendees unable to register for the event

**Solution**:
1. Check if the event is still active (not completed)
2. Ensure all required fields are filled in the registration form
3. Verify that the attendee hasn't already registered with the same email
4. Try using a different browser or device if persistent issues occur

### Demo Mode

**Banner Message**: "Demo Mode Active: Unable to connect to the server. Your data will not be saved."

**Explanation**:
- This means the application couldn't connect to the MongoDB database
- The application is running with an in-memory database as a fallback
- All features will work, but data will not be saved when you close the browser
- This is useful for demonstrations or when experiencing temporary database connectivity issues

## Best Practices

1. **Event Creation**:
   - Create events at least a week in advance
   - Provide detailed descriptions to help attendees understand the event purpose
   - Include specific location details with directions if applicable

2. **QR Code Distribution**:
   - Display the QR code prominently at your event entrance
   - Include it in pre-event emails and promotional materials
   - Print the QR code at a sufficient size for easy scanning

3. **During the Event**:
   - Have a dedicated registration station with the QR code displayed
   - Assist attendees who may have difficulty with the registration process
   - Consider having a backup registration method for those without smartphones

4. **After the Event**:
   - Complete the event promptly to send follow-up emails
   - Encourage attendees to connect with each other through the attendee list
   - Gather feedback for future events
