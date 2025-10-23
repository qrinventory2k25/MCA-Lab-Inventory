# Render Deployment Guide

This guide will help you deploy your College QR Inventory System to Render.com with separate backend and frontend services.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Supabase Project**: Set up your Supabase project with database and storage
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

### 1.2 Database Setup
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql` from your project
3. Paste and run the SQL to create the necessary tables and storage bucket

### 1.3 Get API Keys
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

## Step 2: Render Deployment

### 2.1 Deploy Backend Service

1. **Connect Repository**:
   - Go to [render.com](https://render.com) and sign in
   - Click **New** → **Web Service**
   - Connect your GitHub repository

2. **Configure Backend Service**:
   - **Name**: `attachmentparser-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server`
   - **Plan**: Free (or upgrade as needed)

3. **Environment Variables**:
   Add the following environment variables in Render:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SESSION_SECRET=your-random-session-secret
   FRONTEND_URL=https://your-frontend-app.onrender.com
   API_URL=https://your-backend-app.onrender.com
   ```

4. **Deploy**: Click **Create Web Service** and wait for deployment

### 2.2 Deploy Frontend Service

1. **Create Static Site**:
   - In Render dashboard, click **New** → **Static Site**
   - Connect the same GitHub repository

2. **Configure Frontend Service**:
   - **Name**: `attachmentparser-frontend` (or your preferred name)
   - **Build Command**: `npm install && npm run build:client`
   - **Publish Directory**: `dist/public`

3. **Environment Variables**:
   Add the following environment variables:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Deploy**: Click **Create Static Site** and wait for deployment

## Step 3: Update Configuration

### 3.1 Update CORS Settings
After both services are deployed, update the backend CORS configuration:

1. Go to your backend service in Render
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. Update the `API_URL` environment variable with your actual backend URL
4. Redeploy the backend service

### 3.2 Update QR Code URLs
The QR codes will automatically use the correct API URL based on the environment variables.

## Step 4: Testing Deployment

### 4.1 Test Backend API
1. Visit your backend URL: `https://your-backend-app.onrender.com/api/systems`
2. You should see an empty array `[]` (no systems yet)
3. Test a POST request to create a system

### 4.2 Test Frontend
1. Visit your frontend URL: `https://your-frontend-app.onrender.com`
2. Try adding a new system
3. Verify QR codes are generated and displayed

### 4.3 Test QR Code Generation
1. Add a system through the frontend
2. Download the QR code
3. Scan it with a QR code scanner to verify it contains the correct data

## Step 5: Custom Domain (Optional)

### 5.1 Backend Custom Domain
1. In your backend service settings, go to **Custom Domains**
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed by Render

### 5.2 Frontend Custom Domain
1. In your frontend service settings, go to **Custom Domains**
2. Add your custom domain (e.g., `yourdomain.com`)
3. Update DNS records as instructed by Render

### 5.3 Update Environment Variables
After setting up custom domains, update:
- `FRONTEND_URL` in backend service
- `VITE_API_URL` in frontend service
- `API_URL` in backend service

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` in backend matches your frontend domain exactly
   - Check that CORS middleware is properly configured

2. **Environment Variables Not Loading**:
   - Verify all environment variables are set in Render dashboard
   - Check for typos in variable names
   - Redeploy services after changing environment variables

3. **Build Failures**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify build commands are correct

4. **QR Code Generation Issues**:
   - Check Supabase storage bucket permissions
   - Verify `SUPABASE_SERVICE_ROLE_KEY` has proper permissions
   - Check backend logs for QR generation errors

5. **Database Connection Issues**:
   - Verify Supabase URL and keys are correct
   - Check if database tables exist
   - Ensure Supabase project is not paused

### Debugging Steps

1. **Check Logs**:
   - Backend: Go to your backend service → **Logs**
   - Frontend: Check browser console for errors

2. **Test API Endpoints**:
   - Use tools like Postman or curl to test backend endpoints
   - Verify responses match expected format

3. **Verify Environment Variables**:
   - Use Render's environment variable editor
   - Check that all required variables are set

## Production Checklist

- [ ] Backend service deployed and accessible
- [ ] Frontend service deployed and accessible
- [ ] Supabase database connected and tables created
- [ ] Supabase storage bucket created and accessible
- [ ] CORS configured correctly
- [ ] Environment variables set correctly
- [ ] QR code generation working
- [ ] Frontend can communicate with backend
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active (automatic with Render)

## Monitoring and Maintenance

1. **Monitor Performance**:
   - Use Render's built-in monitoring
   - Set up alerts for service downtime

2. **Regular Updates**:
   - Keep dependencies updated
   - Monitor Supabase usage limits
   - Review and rotate API keys periodically

3. **Backup Strategy**:
   - Supabase provides automatic backups
   - Consider exporting data regularly
   - Keep QR codes backed up in Supabase storage

## Support

If you encounter issues:
1. Check Render's documentation: [render.com/docs](https://render.com/docs)
2. Check Supabase's documentation: [supabase.com/docs](https://supabase.com/docs)
3. Review the project's GitHub issues
4. Check the troubleshooting section above

---

**Note**: Replace `your-backend-app.onrender.com`, `your-frontend-app.onrender.com`, and `your-project-id.supabase.co` with your actual URLs and project IDs throughout this guide.
