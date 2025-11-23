require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blog_platform',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Categories list
const categories = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Business'];

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'blog-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/admin/login');
  next();
};

// Routes
app.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM posts ORDER BY created_at DESC';
    let params = [];
    
    if (search && category) {
      query = 'SELECT * FROM posts WHERE (title LIKE ? OR content LIKE ?) AND category = ? ORDER BY created_at DESC';
      params = [`%${search}%`, `%${search}%`, category];
    } else if (search) {
      query = 'SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC';
      params = [`%${search}%`, `%${search}%`];
    } else if (category) {
      query = 'SELECT * FROM posts WHERE category = ? ORDER BY created_at DESC';
      params = [category];
    }
    
    const [posts] = await pool.query(query, params);
    
    // Parse tags from JSON string
    posts.forEach(post => {
      post.tags = post.tags ? JSON.parse(post.tags) : [];
    });
    
    res.render('index', { posts, categories, search, category });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.render('index', { posts: [], categories, search: '', category: '' });
  }
});

app.get('/post/:id', async (req, res) => {
  try {
    const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) return res.status(404).send('Post not found');
    
    const post = posts[0];
    post.tags = post.tags ? JSON.parse(post.tags) : [];
    
    const [comments] = await pool.query('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC', [post.id]);
    
    res.render('post', { post, comments });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Server error');
  }
});

app.post('/post/:id/comment', async (req, res) => {
  try {
    const { name, content } = req.body;
    await pool.query(
      'INSERT INTO comments (post_id, name, content) VALUES (?, ?, ?)',
      [req.params.id, name, content]
    );
    res.redirect(`/post/${req.params.id}`);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.redirect(`/post/${req.params.id}`);
  }
});

// Admin routes
app.get('/admin/login', (req, res) => {
  res.render('admin/login', { error: null });
});

app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length > 0 && bcrypt.compareSync(password, users[0].password)) {
      req.session.userId = users[0].id;
      req.session.role = users[0].role;
      return res.redirect('/admin/dashboard');
    }
    
    res.render('admin/login', { error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', { error: 'Server error' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin/dashboard', requireAuth, async (req, res) => {
  try {
    const [posts] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    const [comments] = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    const [users] = await pool.query('SELECT id, username, role, created_at FROM users');
    
    posts.forEach(post => {
      post.tags = post.tags ? JSON.parse(post.tags) : [];
    });
    
    res.render('admin/dashboard', { posts, comments, users });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/admin/posts/new', requireAuth, (req, res) => {
  res.render('admin/post-form', { post: null, categories });
});

app.post('/admin/posts', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];
    
    await pool.query(
      'INSERT INTO posts (title, content, category, tags, image, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        title,
        content,
        category,
        JSON.stringify(tagsArray),
        req.file ? `/uploads/${req.file.filename}` : null,
        req.session.userId
      ]
    );
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Server error');
  }
});

app.get('/admin/posts/:id/edit', requireAuth, async (req, res) => {
  try {
    const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) return res.status(404).send('Post not found');
    
    const post = posts[0];
    post.tags = post.tags ? JSON.parse(post.tags) : [];
    
    res.render('admin/post-form', { post, categories });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Server error');
  }
});

app.put('/admin/posts/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];
    
    let query = 'UPDATE posts SET title = ?, content = ?, category = ?, tags = ? WHERE id = ?';
    let params = [title, content, category, JSON.stringify(tagsArray), req.params.id];
    
    if (req.file) {
      query = 'UPDATE posts SET title = ?, content = ?, category = ?, tags = ?, image = ? WHERE id = ?';
      params = [title, content, category, JSON.stringify(tagsArray), `/uploads/${req.file.filename}`, req.params.id];
    }
    
    await pool.query(query, params);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).send('Server error');
  }
});

app.delete('/admin/posts/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Server error');
  }
});

app.delete('/admin/comments/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.json({ success: false });
  }
});

// Start server
app.listen(PORT, async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✓ Database connected successfully');
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log('✓ Admin login: username=admin, password=admin');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.log('Please make sure MySQL is running and database is created.');
    console.log('Run the database.sql file to set up the database.');
  }
});
