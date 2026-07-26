import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'king-shalom-data') : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'contacts.json');
const DB_FILE = path.join(DATA_DIR, 'news.db');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const DASHBOARD_FILE = path.join(__dirname, 'dashboard.html');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SESSION_TTL_SECONDS = Number(process.env.ADMIN_SESSION_TTL_SECONDS || 60 * 60 * 8);
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('base64url');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ensureNewsFile = () => {
  if (!fs.existsSync(NEWS_FILE)) {
    fs.writeFileSync(NEWS_FILE, JSON.stringify([], null, 2));
  }
};

const loadNewsFromFile = () => {
  ensureNewsFile();
  return JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
};

const saveNewsToFile = (items) => {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(items, null, 2));
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const ADMIN_OWNER_EMAIL = normalizeEmail(process.env.ADMIN_OWNER_EMAIL);
const ADMIN_EDITOR_EMAIL = normalizeEmail(process.env.ADMIN_EDITOR_EMAIL);
const allowedAdminEmails = new Set([ADMIN_OWNER_EMAIL, ADMIN_EDITOR_EMAIL].filter(Boolean));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD_RESET_URL = IS_VERCEL && process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/admin-reset-password.html`
  : process.env.ADMIN_PASSWORD_RESET_URL || 'http://localhost:5173/admin-reset-password.html';
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const hasSupabaseNewsConfig = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const hasAllowedAdminEmails = allowedAdminEmails.size === 2;
const hasAdminAuthConfig = Boolean(hasSupabaseConfig && hasAllowedAdminEmails && SESSION_SECRET);

const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const newsSupabase = hasSupabaseNewsConfig
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const mapNewsRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  author: row.author,
  date: row.date,
  imageUrl: row.image_url || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

if (!hasSupabaseConfig) {
  console.warn('[security] SUPABASE_URL and SUPABASE_ANON_KEY must be set for admin authentication.');
}

if (!hasAllowedAdminEmails) {
  console.warn('[security] ADMIN_OWNER_EMAIL and ADMIN_EDITOR_EMAIL must both be set to exactly two allowed admin users.');
}

if (IS_VERCEL && !hasSupabaseNewsConfig) {
  console.warn('[storage] SUPABASE_SERVICE_ROLE_KEY must be set for durable news storage on Vercel.');
}

if (IS_PRODUCTION && !hasAdminAuthConfig) {
  console.error('[security] Admin authentication is disabled in production until Supabase and allowed admin emails are configured.');
}

const toBase64Url = (value) => Buffer.from(value, 'utf8').toString('base64url');

const signValue = (value) => crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');

const timingSafeEqualStrings = (a, b) => {
  const bufferA = Buffer.from(a || '', 'utf8');
  const bufferB = Buffer.from(b || '', 'utf8');

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

const createAdminToken = (email) => {
  const now = Math.floor(Date.now() / 1000);
  const normalizedEmail = normalizeEmail(email);
  const payload = {
    sub: normalizedEmail,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    nonce: crypto.randomBytes(10).toString('base64url'),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const verifyAdminToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signValue(encodedPayload);
  if (!timingSafeEqualStrings(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    return allowedAdminEmails.has(normalizeEmail(payload.sub)) && Number(payload.exp) > now;
  } catch {
    return false;
  }
};

const readBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
};

const requireAdminAuth = (req, res, next) => {
  if (!hasAdminAuthConfig) {
    return res.status(503).json({ success: false, message: 'Admin auth is not configured on this server.' });
  }

  const token = readBearerToken(req);
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  return next();
};

const requireNewsTableColumns = () => {
  if (!db) {
    return;
  }

  db.all('PRAGMA table_info(news)', (err, columns) => {
    if (err) {
      console.error('Error inspecting news table:', err.message);
      return;
    }

    const hasImageUrl = columns.some((column) => column.name === 'imageUrl');
    if (!hasImageUrl) {
      db.run('ALTER TABLE news ADD COLUMN imageUrl TEXT DEFAULT ""', (alterErr) => {
        if (alterErr) {
          console.error('Error adding imageUrl column:', alterErr.message);
        }
      });
    }
  });
};

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: process.env.JSON_LIMIT || '15mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_LIMIT || '15mb' }));

let db = null;
let sqliteAvailable = false;

const initializeSQLiteDatabase = () => {
  if (!sqliteAvailable || !db) {
    return;
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      imageUrl TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating news table:', err.message);
    } else {
      console.log('News table initialized');
      requireNewsTableColumns();
    }
  });
};

const initializeNewsStorage = async () => {
  if (IS_VERCEL) {
    console.log(hasSupabaseNewsConfig
      ? 'Using Supabase storage for news on Vercel runtime'
      : 'Supabase news storage is not configured on Vercel runtime');
    return;
  }

  try {
    const sqliteModule = await import('sqlite3');
    const sqlite3 = sqliteModule.default;
    db = new sqlite3.Database(DB_FILE, (err) => {
      if (err) {
        console.error('Database error:', err.message);
        ensureNewsFile();
      } else {
        sqliteAvailable = true;
        console.log('Connected to SQLite database');
        initializeSQLiteDatabase();
      }
    });
  } catch (error) {
    console.warn('SQLite unavailable, using JSON file storage for news:', error.message);
    ensureNewsFile();
  }
};

await initializeNewsStorage();

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

const loadMessages = () => {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const saveMessage = (message) => {
  const messages = loadMessages();
  messages.unshift(message);
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
};

const sendEmail = async (message) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_EMAIL) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to: CONTACT_EMAIL,
    subject: `New inquiry from ${message.name}`,
    text: `Name: ${message.name}\nEmail: ${message.email}\nPhone: ${message.phone}\nService: ${message.service}\n\nMessage:\n${message.message}`,
  });

  return true;
};

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide your name, email, and message.' });
  }

  const submission = {
    id: Date.now().toString(),
    name,
    email,
    phone: phone || 'Not provided',
    service: service || 'General inquiry',
    message,
    createdAt: new Date().toISOString(),
  };

  saveMessage(submission);

  try {
    await sendEmail(submission);
  } catch (error) {
    console.error('Email delivery failed:', error.message);
  }

  res.json({ success: true, message: 'Your request has been received and stored for review.' });
});

app.get('/api/contact/messages', requireAdminAuth, (req, res) => {
  res.json(loadMessages());
});

// ===== NEWS API ENDPOINTS =====

// GET all news
app.get('/api/news', async (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
  });

  if (IS_VERCEL) {
    if (!newsSupabase) {
      return res.status(503).json({ success: false, message: 'News storage is not configured.' });
    }

    const { data, error } = await newsSupabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, data: data.map(mapNewsRow) });
  }

  if (!sqliteAvailable || !db) {
    const items = loadNewsFromFile().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, data: items });
  }

  db.all('SELECT * FROM news ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// POST new news
app.post('/api/news', requireAdminAuth, async (req, res) => {

  const { title, description, category, author, date, imageUrl } = req.body;
  
  if (!title || !description || !category || !author || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (IS_VERCEL) {
    if (!newsSupabase) {
      return res.status(503).json({ success: false, message: 'News storage is not configured.' });
    }

    const { data, error } = await newsSupabase
      .from('news')
      .insert({ title, description, category, author, date, image_url: imageUrl || '' })
      .select('id')
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: 'News added', id: data.id });
  }

  if (!sqliteAvailable || !db) {
    const items = loadNewsFromFile();
    const now = new Date().toISOString();
    const nextId = items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;
    const record = {
      id: nextId,
      title,
      description,
      category,
      author,
      date,
      imageUrl: imageUrl || '',
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(record);
    saveNewsToFile(items);
    return res.json({ success: true, message: 'News added', id: nextId });
  }

  db.run(
    'INSERT INTO news (title, description, category, author, date, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, category, author, date, imageUrl || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: 'News added', id: this.lastID });
    }
  );
});

// PUT update news
app.put('/api/news/:id', requireAdminAuth, async (req, res) => {

  const { id } = req.params;
  const { title, description, category, author, date, imageUrl } = req.body;
  
  if (!title || !description || !category || !author || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (IS_VERCEL) {
    if (!newsSupabase) {
      return res.status(503).json({ success: false, message: 'News storage is not configured.' });
    }

    const { data, error } = await newsSupabase
      .from('news')
      .update({
        title,
        description,
        category,
        author,
        date,
        image_url: imageUrl || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    return res.json({ success: true, message: 'News updated' });
  }

  if (!sqliteAvailable || !db) {
    const items = loadNewsFromFile();
    const targetId = String(id);
    const index = items.findIndex((item) => String(item.id) === targetId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    items[index] = {
      ...items[index],
      title,
      description,
      category,
      author,
      date,
      imageUrl: imageUrl || '',
      updatedAt: new Date().toISOString(),
    };

    saveNewsToFile(items);
    return res.json({ success: true, message: 'News updated' });
  }

  db.run(
    'UPDATE news SET title=?, description=?, category=?, author=?, date=?, imageUrl=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?',
    [title, description, category, author, date, imageUrl || '', id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: 'News updated' });
    }
  );
});

// DELETE news
app.delete('/api/news/:id', requireAdminAuth, async (req, res) => {

  const { id } = req.params;

  if (IS_VERCEL) {
    if (!newsSupabase) {
      return res.status(503).json({ success: false, message: 'News storage is not configured.' });
    }

    const { data, error } = await newsSupabase
      .from('news')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    if (!data) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    return res.json({ success: true, message: 'News deleted' });
  }

  if (!sqliteAvailable || !db) {
    const items = loadNewsFromFile();
    const filtered = items.filter((item) => String(item.id) !== String(id));

    if (filtered.length === items.length) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    saveNewsToFile(filtered);
    return res.json({ success: true, message: 'News deleted' });
  }

  db.run('DELETE FROM news WHERE id=?', [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: 'News deleted' });
  });
});

// ===== ADMIN AUTH =====

app.post('/api/admin/login', (req, res) => {
  if (!hasAdminAuthConfig || !supabase) {
    return res.status(503).json({ success: false, message: 'Admin login is not configured.' });
  }

  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  if (!allowedAdminEmails.has(email)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  supabase.auth
    .signInWithPassword({ email, password })
    .then(({ data, error }) => {
      if (error || !data?.user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const userEmail = normalizeEmail(data.user.email);
      if (!allowedAdminEmails.has(userEmail)) {
        return res.status(403).json({ success: false, message: 'This user is not allowed to access admin.' });
      }

      const token = createAdminToken(userEmail);
      return res.json({ success: true, token, expiresIn: SESSION_TTL_SECONDS });
    })
    .catch((error) => {
      console.error('Supabase login error:', error.message);
      return res.status(500).json({ success: false, message: 'Unexpected login error' });
    });
});

app.post('/api/admin/forgot-password', async (req, res) => {
  if (!hasAdminAuthConfig || !supabase) {
    return res.status(503).json({ success: false, message: 'Admin password recovery is not configured.' });
  }

  const email = normalizeEmail(req.body?.email);
  const genericResponse = {
    success: true,
    message: 'If this email belongs to an administrator, a password reset link has been sent.',
  };

  if (!email || !allowedAdminEmails.has(email)) {
    return res.json(genericResponse);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: ADMIN_PASSWORD_RESET_URL,
  });

  if (error) {
    console.error('Supabase password recovery error:', error.message);
  }

  return res.json(genericResponse);
});

app.post('/api/admin/reset-password', async (req, res) => {
  if (!hasAdminAuthConfig) {
    return res.status(503).json({ success: false, message: 'Admin password recovery is not configured.' });
  }

  const accessToken = String(req.body?.accessToken || '');
  const refreshToken = String(req.body?.refreshToken || '');
  const password = String(req.body?.password || '');

  if (!accessToken || !refreshToken) {
    return res.status(401).json({ success: false, message: 'This password reset link is invalid or has expired.' });
  }

  if (password.length < 12) {
    return res.status(400).json({ success: false, message: 'Use a password with at least 12 characters.' });
  }

  const recoveryClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data: sessionData, error: sessionError } = await recoveryClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  const recoveredEmail = normalizeEmail(sessionData?.user?.email);

  if (sessionError || !recoveredEmail || !allowedAdminEmails.has(recoveredEmail)) {
    return res.status(401).json({ success: false, message: 'This password reset link is invalid or has expired.' });
  }

  const { error: updateError } = await recoveryClient.auth.updateUser({ password });
  if (updateError) {
    console.error('Supabase password update error:', updateError.message);
    return res.status(400).json({ success: false, message: 'The password could not be updated. Request a new reset link.' });
  }

  await recoveryClient.auth.signOut();
  return res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
});

app.get('/dashboard', requireAdminAuth, (req, res) => {
  res.sendFile(DASHBOARD_FILE);
});

app.use(express.static(__dirname));

app.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (req.path.startsWith('/api/')) {
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        message: 'Uploaded image is too large. Please choose a smaller image file.',
      });
    }

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Unexpected server error',
    });
  }

  return next(err);
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Endpoint not found.' });
  }
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`King's Shalom server running on http://localhost:${PORT}`);
  });
}

export default app;
