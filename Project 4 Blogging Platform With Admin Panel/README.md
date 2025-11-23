# Blogging Platform with Admin Panel

A dynamic blogging website with a full-featured admin panel for managing content.

## Features

### Public Features
- Browse and read blog posts
- Search posts by title/content
- Filter posts by category
- View individual post details
- Comment on posts
- Responsive design

### Admin Features
- Secure login system
- Dashboard with statistics
- Create/Edit/Delete blog posts
- Rich text editor (TinyMCE)
- Image upload for posts
- Category management
- Tags support
- Comment moderation
- User management

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database:
   - Make sure MySQL is installed and running
   - Create the database and tables by running:
   ```bash
   mysql -u root -p < database.sql
   ```
   Or import `database.sql` using phpMyAdmin or MySQL Workbench

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env` file:
   ```

4. Create uploads directory (if not exists):
```bash
mkdir public/uploads
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser to `http://localhost:3000`


## Tech Stack

- Node.js & Express
- MySQL database with mysql2
- EJS templating
- TinyMCE rich text editor
- Multer for file uploads
- bcryptjs for password hashing
- Express sessions for authentication
- dotenv for environment configuration

## Project Structure

```
├── server.js              # Main application file
├── package.json           # Dependencies
├── views/
│   ├── index.ejs         # Homepage
│   ├── post.ejs          # Single post view
│   └── admin/
│       ├── login.ejs     # Admin login
│       ├── dashboard.ejs # Admin dashboard
│       └── post-form.ejs # Create/Edit post form
└── public/
    ├── css/
    │   └── style.css     # Styles
    └── uploads/          # Uploaded images
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:
- **Railway** (Recommended): Easiest with built-in MySQL
- **Render**: Free tier with external MySQL
- **Vercel + PlanetScale**: Serverless option

### Admin Credentials (Default)
- Username: `admin`
- Password: `admin`

⚠️ **Important**: Change the default password after first login!

## Future Enhancements

- User registration
- Post drafts
- Social sharing
- Email notifications
- SEO optimization
- Analytics dashboard
