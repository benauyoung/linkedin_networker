# Deploying EVENT CONNECT to Vercel

This guide will walk you through deploying your EVENT CONNECT application on Vercel with MongoDB Atlas for database storage.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)

## Setting up MongoDB Atlas

1. **Create a MongoDB Atlas Cluster**:
   - Log in to MongoDB Atlas
   - Create a new project (or use an existing one)
   - Create a new cluster (the free tier is sufficient for getting started)
   - Choose your preferred cloud provider and region

2. **Configure Network Access**:
   - Go to Network Access in the Security section
   - Add a new IP address
   - Select "Allow Access from Anywhere" (for simplicity) or add Vercel's IP addresses
   - Click "Confirm"

3. **Create a Database User**:
   - Go to Database Access in the Security section
   - Add a new database user
   - Create a username and strong password
   - Give this user "Read and Write to Any Database" permissions
   - Remember these credentials as you'll need them for your connection string

4. **Get Your Connection String**:
   - Go to Clusters, and click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as the driver and the appropriate version
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `myFirstDatabase` with your preferred database name (e.g., `eventconnect`)

## Deploying to Vercel

1. **Prepare Your Repository**:
   - Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
   - Ensure you have the correct `vercel.json` configuration file in your project root

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository
   - Select the repository that contains your EVENT CONNECT application

3. **Configure Project**:
   - Set the framework preset to "Other"
   - In the "Environment Variables" section, add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
   - Keep all other default settings
   - Click "Deploy"

4. **Verify Deployment**:
   - Once deployment is complete, Vercel will provide you with a URL
   - Visit `your-vercel-url/api` to verify the API is running
   - Test creating an event by sending a POST request to `your-vercel-url/api/events`

## Troubleshooting

If you encounter issues with your deployment, check the following:

1. **Database Connection**:
   - Verify your MongoDB Atlas connection string is correct
   - Check that you've allowed access from anywhere in the Network Access settings
   - Ensure your database user has the correct permissions

2. **API Errors**:
   - Check Vercel's function logs for detailed error messages
   - Verify your API endpoints are correctly configured
   - Make sure your frontend is sending requests to the correct URLs

3. **CORS Issues**:
   - If your frontend can't communicate with the API, check the CORS headers
   - Add your frontend domain to the allowed origins list in the API

## Updating Your Deployment

To update your application after making changes:

1. Push your changes to your Git repository
2. Vercel will automatically detect the changes and redeploy your application

## Development Mode

For local development, you can continue to use:

```bash
npm run dev # Run frontend development server
npm start   # Run API server locally
```

The local API will use the in-memory MongoDB database by default, unless a `MONGODB_URI` environment variable is set.
