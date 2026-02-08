const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const db = require('./database');
const search = require('./search');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'user-guide-tool-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// --- Image upload config ---
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(12).toString('hex') + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// --- Auth middleware ---
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

// --- Helper: read and serve HTML templates ---
const fs = require('fs');

function renderTemplate(templateName, replacements = {}) {
  let html = fs.readFileSync(path.join(__dirname, '..', 'views', templateName), 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  return html;
}

// =====================
// PUBLIC ROUTES
// =====================

// Homepage — list all guides
app.get('/', (req, res) => {
  const guides = db.getAllGuides();
  const guideListHtml = guides.length > 0
    ? guides.map(g => `
        <a href="/guide/${g.slug}" class="guide-card-v2">
          <div class="gc-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3>${escapeHtml(g.title)}</h3>
          <div class="gc-meta">Updated: ${new Date(g.updated_at).toLocaleDateString()}</div>
          <div class="gc-arrow">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polyline points="9 18 15 12 9 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </a>
      `).join('')
    : `<div class="empty-state-v2">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <p>No guides created yet.</p>
        <p style="font-size:13px;">Create your first guide to get started.</p>
      </div>`;

  const html = renderTemplate('home.html', {
    guideList: guideListHtml,
    isAdmin: req.session && req.session.isAdmin ? 'true' : 'false'
  });
  res.send(html);
});

// View a guide
app.get('/guide/:slug', (req, res) => {
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).send(renderTemplate('404.html'));

  const html = renderTemplate('guide.html', {
    title: escapeHtml(guide.title),
    content: guide.content,
    slug: guide.slug,
    isAdmin: req.session && req.session.isAdmin ? 'true' : 'false'
  });
  res.send(html);
});

// Search API (intelligent: tokenization, stemming, synonyms, fuzzy matching)
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.json({ results: [] });

  // Build expanded search patterns (tokens + stems + synonyms)
  const patterns = search.buildSearchPatterns(q);
  if (patterns.length === 0) return res.json({ results: [] });

  // Pre-filter candidates from DB using expanded patterns
  let guides = db.searchGuidesMulti(patterns);

  // Deduplicate (a guide might match multiple patterns)
  const seen = new Set();
  let uniqueGuides = guides.filter(g => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });

  // If DB pre-filter found nothing, fetch all guides for fuzzy matching
  // (typos won't match LIKE patterns, but Levenshtein will catch them)
  if (uniqueGuides.length === 0) {
    uniqueGuides = db.getAllGuidesWithContent();
  }

  // Run intelligent scoring + ranking
  const results = search.smartSearch(uniqueGuides, q);

  // Generate direct answer for question-style queries
  const answer = search.generateAnswer(uniqueGuides, q, results);

  res.json({ results, query: q, answer: answer || null });
});

// =====================
// AUTH ROUTES
// =====================

app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/');
  res.send(renderTemplate('login.html', { error: '' }));
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (db.verifyPassword(password)) {
    req.session.isAdmin = true;
    res.redirect('/');
  } else {
    res.send(renderTemplate('login.html', { error: '<p class="error-msg">Incorrect password. Please try again.</p>' }));
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// =====================
// ADMIN ROUTES
// =====================

// Create new guide
app.get('/admin/guide/new', requireAuth, (req, res) => {
  res.send(renderTemplate('editor.html', {
    title: '',
    content: '',
    slug: '',
    isNew: 'true',
    pageTitle: 'Create New Guide'
  }));
});

app.post('/admin/guide/new', requireAuth, (req, res) => {
  const { title } = req.body;
  const slug = slugify(title);

  const existing = db.getGuideBySlug(slug);
  if (existing) {
    return res.status(400).json({ error: 'A guide with a similar title already exists' });
  }

  db.createGuide(title, slug);
  res.json({ success: true, slug });
});

// Edit guide
app.get('/admin/guide/:slug', requireAuth, (req, res) => {
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).send(renderTemplate('404.html'));

  res.send(renderTemplate('editor.html', {
    title: escapeHtml(guide.title),
    content: guide.content.replace(/`/g, '\\`').replace(/<\/script>/g, '<\\/script>'),
    slug: guide.slug,
    isNew: 'false',
    pageTitle: 'Edit Guide'
  }));
});

// Save guide (with version history)
app.post('/admin/guide/:slug/save', requireAuth, (req, res) => {
  const { title, content } = req.body;
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });

  // Save previous state as a version before overwriting
  if (guide.content) {
    db.saveVersion(guide.id, guide.title, guide.content);
  }

  db.updateGuide(req.params.slug, title, content);
  res.json({ success: true });
});

// Delete guide
app.post('/admin/guide/:slug/delete', requireAuth, (req, res) => {
  db.deleteGuide(req.params.slug);
  res.json({ success: true });
});

// Version history API
app.get('/admin/guide/:slug/versions', requireAuth, (req, res) => {
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  const versions = db.getVersions(guide.id);
  res.json({ versions });
});

app.get('/admin/guide/:slug/version/:id', requireAuth, (req, res) => {
  const version = db.getVersion(req.params.id);
  if (!version) return res.status(404).json({ error: 'Version not found' });
  res.json({ version });
});

app.post('/admin/guide/:slug/version/:id/restore', requireAuth, (req, res) => {
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  const version = db.getVersion(req.params.id);
  if (!version) return res.status(404).json({ error: 'Version not found' });

  // Save current state as a version before restoring
  if (guide.content) {
    db.saveVersion(guide.id, guide.title, guide.content);
  }

  db.updateGuide(req.params.slug, version.title, version.content);
  res.json({ success: true, title: version.title, content: version.content });
});

// Duplicate guide
app.post('/admin/guide/:slug/duplicate', requireAuth, (req, res) => {
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });

  const newTitle = guide.title + ' (Copy)';
  let newSlug = slugify(newTitle);
  let counter = 1;
  while (db.getGuideBySlug(newSlug)) {
    counter++;
    newSlug = slugify(newTitle) + '-' + counter;
  }

  db.createGuide(newTitle, newSlug);
  db.updateGuide(newSlug, newTitle, guide.content);
  res.json({ success: true, slug: newSlug });
});

// Print-friendly view
app.get('/guide/:slug/print', (req, res) => {
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).send(renderTemplate('404.html'));

  const html = renderTemplate('print.html', {
    title: escapeHtml(guide.title),
    content: guide.content,
    slug: guide.slug
  });
  res.send(html);
});

// Image upload
app.post('/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// =====================
// UTILITIES
// =====================

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, c => map[c]);
}

// =====================
// START SERVER
// =====================

app.listen(PORT, () => {
  console.log(`User Guide Tool running at http://localhost:${PORT}`);
  console.log(`Default admin password: admin123`);
});
