# Deployment Guide - Blogging Platform

## Option 1: Deploy to Render (Recommended - Free Tier Available)

### Step 1: Create a Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account

### Step 2: Create a MySQL Database
1. In Render Dashboard, click **"New +"** → **"PostgreSQL"** or use external MySQL service
2. For MySQL, use **Railway** or **PlanetScale** (free tier):
   - Go to [railway.app](https://railway.app) or [planetscale.com](https://planetscale.com)
   - Create a new MySQL database
   - Copy the connection details

### Step 3: Deploy the Web Service
1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `blogging-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 4: Add Environment Variables
In Render, go to **Environment** tab and add:
```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=blog_platform
DB_PORT=3306
SESSION_SECRET=your-random-secret-key-here
PORT=3000
```

### Step 5: Setup Database
1. Connect to your MySQL database using a client (MySQL Workbench, DBeaver, etc.)
2. Run the `database.sql` file to create tables and admin user
3. Or use Railway/PlanetScale web console to run the SQL

### Step 6: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Access your app at the provided URL

---

## Option 2: Deploy to Railway (Easiest - Free Tier)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository

### Step 3: Add MySQL Database
1. In your project, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway will automatically create a MySQL database

### Step 4: Add Environment Variables
1. Click on your web service
2. Go to **"Variables"** tab
3. Add these variables (Railway will auto-fill database variables):
```
SESSION_SECRET=your-random-secret-key-here
```

### Step 5: Setup Database
1. Click on MySQL service → **"Data"** tab
2. Click **"Query"** and paste contents of `database.sql`
3. Execute the query

### Step 6: Deploy
- Railway automatically deploys on push
- Access your app at the provided URL

---

## Option 3: Deploy to Vercel + PlanetScale

### Step 1: Setup PlanetScale Database
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Run `database.sql` in the console
4. Get connection string

### Step 2: Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

---

## Post-Deployment Checklist

✅ Database is created and tables exist
✅ Admin user is created (username: admin, password: admin)
✅ Environment variables are set correctly
✅ App is accessible via the deployment URL
✅ Can login to admin panel at `/admin/login`
✅ Can create and view blog posts

---

## Troubleshooting

### Database Connection Issues
- Verify all DB environment variables are correct
- Check if database allows external connections
- Ensure database is in the same region as your app

### Admin Login Not Working
- Run `fix_admin.sql` to reset admin password
- Check if bcryptjs is installed correctly

### File Upload Issues
- Ensure `public/uploads` directory exists
- Check file permissions on the server

---

## Important Notes

⚠️ **Change the default admin password** after first login!
⚠️ **Use a strong SESSION_SECRET** in production
⚠️ **Never commit .env file** to GitHub
⚠️ **Enable HTTPS** in production (most platforms do this automatically)

---

## Support

If you encounter issues:
1. Check deployment logs in your platform dashboard
2. Verify environment variables
3. Test database connection
4. Check if all dependencies are installed
