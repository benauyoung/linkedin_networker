# LinkedIn Networker Deployment Guide

This document provides detailed instructions for deploying the LinkedIn Networker application to various hosting platforms.

## Table of Contents
- [Preparing Your Application for Deployment](#preparing-your-application-for-deployment)
- [Frontend Deployment Options](#frontend-deployment-options)
- [Backend Deployment Options](#backend-deployment-options)
- [Database Setup with MongoDB Atlas](#database-setup-with-mongodb-atlas)
- [Environment Variables](#environment-variables)
- [Continuous Integration and Deployment](#continuous-integration-and-deployment)
- [Troubleshooting](#troubleshooting)

## Preparing Your Application for Deployment

Before deploying your application, follow these steps:

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Test Your Application Locally**
   ```bash
   # Start the backend server
   cd backend
   npm start
   
   # In a new terminal, serve the frontend build
   cd frontend
   npx serve -s build
   ```

3. **Update Environment Variables**
   - Create a production `.env` file with your production settings
   - Ensure MongoDB connection string is set for your production database

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. **Create a Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Deploy from Command Line**
   ```bash
   cd frontend
   vercel login
   vercel
   ```

4. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. **Set Environment Variables**
   - Go to your project settings in Vercel dashboard
   - Add environment variables (if needed for the frontend)

### Option 2: Netlify

1. **Create a Netlify Account**
   - Sign up at [netlify.com](https://netlify.com)

2. **Deploy from the Netlify Dashboard**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Drag and drop your `frontend/build` folder or connect to your Git repository

3. **Configure Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`

4. **Set Environment Variables**
   - Go to Site settings > Build & deploy > Environment
   - Add your environment variables

### Option 3: GitHub Pages

1. **Install gh-pages Package**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://your-username.github.io/repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

## Backend Deployment Options

### Option 1: Vercel Serverless Functions (Recommended)

1. **Create a `vercel.json` File**
   Create a file in your project root:
   ```json
   {
     "version": 2,
     "buildCommand": "npm run vercel-build",
     "outputDirectory": "frontend/build",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api" },
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "env": {
       "CI": "false",
       "DISABLE_ESLINT_PLUGIN": "true",
       "NODE_ENV": "production"
     },
     "functions": {
       "api/*.js": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

   **Important Function Settings:**
   - `memory`: Allocates 1024MB of memory to functions (needed for MongoDB connections)
   - `maxDuration`: Sets a 10-second timeout for functions (allows time for MongoDB connections)

2. **Optimizing API Routes for Serverless**
   When using MongoDB with serverless functions, optimize your connection handling:
   
   ```javascript
   // Example of optimized MongoDB connection in serverless
   // See api/_utils/mongodb.js for the complete implementation
   
   // Use connection pooling
   if (cachedDb && mongoose.connection.readyState === 1) {
     return { db: cachedDb, models... };
   }
   
   // Add timeouts to prevent hanging connections
   try {
     await Promise.race([
       mongoose.connect(process.env.MONGODB_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         serverSelectionTimeoutMS: 5000,
         socketTimeoutMS: 45000
       }),
       new Promise((_, reject) => 
         setTimeout(() => reject(new Error('Connection timeout')), 10000)
       )
     ]);
   } catch (error) {
     // Handle connection errors
   }
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

### Option 2: Render

1. **Create a Render Account**
   - Sign up at [render.com](https://render.com)

2. **Create a New Web Service**
   - Connect your GitHub repository
   - Select "Node" as the environment
   - Set the build command: `cd backend && npm install`
   - Set the start command: `cd backend && node server.js`

3. **Set Environment Variables**
   - Go to your service dashboard > Environment
   - Add all the variables from your backend `.env` file

### Option 3: Heroku

1. **Create a Heroku Account**
   - Sign up at [heroku.com](https://heroku.com)

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

3. **Create a Procfile in Project Root**
   ```
   web: cd backend && node server.js
   ```

4. **Update package.json in Project Root**
   ```json
   {
     "scripts": {
       "start": "cd backend && node server.js",
       "heroku-postbuild": "cd frontend && npm install && npm run build"
     }
   }
   ```

5. **Deploy to Heroku**
   ```bash
   heroku login
   git init
   heroku git:remote -a your-app-name
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku master
   ```

6. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   # Set other environment variables as needed
   ```

## Database Setup with MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a Cluster**
   - Click "Build a Cluster"
   - Choose a cloud provider and region
   - Choose the free tier option

3. **Set Up Database Access**
   - Create a database user with a secure password
   - Choose "Password" as the authentication method
   - Select "Read and write to any database" for permissions

4. **Configure Network Access**
   - Add an IP address
   - Choose "Allow access from anywhere" for development
   - For production with Vercel, use the following settings:
     - Obtain Vercel's IP addresses from [Vercel's documentation](https://vercel.com/docs/concepts/edge-network/regions)
     - Alternatively, add `0.0.0.0/0` to allow all connections 
       (Note: This is less secure but may be needed for serverless functions with dynamic IPs)

5. **Get Connection String**
   - Click on "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password

6. **Optimize Connection String for Serverless**
   - Add the following parameters to your connection string for better performance:
   ```
   MONGODB_URI=mongodb+srv://username:<password>@cluster0.mongodb.net/linkedin-networker?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=45000
   ```
   - `connectTimeoutMS=30000`: Gives more time to establish initial connection
   - `socketTimeoutMS=45000`: Gives more time for operations before timeout

7. **Update Your Application**
   - Add the optimized connection string to your backend `.env` file

## Environment Variables

### Frontend Environment Variables
Create a `.env` file in the frontend directory with the following:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Backend Environment Variables
Create a `.env` file in the backend directory with the following:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
FRONTEND_URL=https://your-frontend-url.com
```

## Continuous Integration and Deployment

### GitHub Actions

1. **Create a Workflow File**
   Create a file at `.github/workflows/main.yml`:
   ```yaml
   name: LinkedIn Networker CI/CD

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Use Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '16'
         - name: Install frontend dependencies
           run: cd frontend && npm ci
         - name: Build frontend
           run: cd frontend && npm run build
         - name: Install backend dependencies
           run: cd backend && npm ci
         - name: Run backend tests
           run: cd backend && npm test
   ```

## Troubleshooting

### Common Deployment Issues

1. **CORS Issues**
   - Ensure your backend is correctly set up to allow requests from your frontend domain
   - In server.js:
     ```javascript
     app.use(cors({
       origin: process.env.FRONTEND_URL,
       credentials: true
     }));
     ```

2. **Environment Variables Not Loading**
   - Double-check that all environment variables are correctly set in your hosting platform
   - Verify the variable names match what your application expects

3. **Database Connection Issues**
   - Check if your IP address is whitelisted in MongoDB Atlas
   - Verify your connection string and credentials
   - Test the connection locally before deploying
   - For serverless functions, ensure your MongoDB connection is optimized with:
     - Connection pooling/caching
     - Appropriate timeouts
     - Error handling for connection failures
     - Fallback mechanisms (like in-memory MongoDB)

4. **Vercel Serverless Function Timeouts**
   - If functions are timing out, check:
     - MongoDB connection code for proper timeout handling
     - Vercel function settings (`maxDuration` and `memory` in vercel.json)
     - MongoDB Atlas network settings to ensure Vercel can connect

5. **Build Errors**
   - Review your build logs for any errors
   - Ensure all dependencies are correctly installed
   - Check for compatibility issues between packages

### Getting Help

If you encounter issues not covered here, please:
1. Check the error logs in your hosting platform
2. Review the specific documentation for your hosting provider
3. Search for similar issues on Stack Overflow
4. Reach out to the hosting provider's support team
