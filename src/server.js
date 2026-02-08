const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const db = require('./database');

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

// Search API
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.json({ results: [] });

  const guides = db.searchGuides(q);
  const results = [];

  for (const guide of guides) {
    const sections = [];
    // Extract headings and surrounding text from HTML content
    const headingRegex = /<(h[1-4]|div\s+class="[^"]*(?:section-heading|sub-heading|sub2-heading)[^"]*")[^>]*>([\s\S]*?)<\/(?:h[1-4]|div)>/gi;
    let match;
    const lowerQ = q.toLowerCase();

    // Check title match
    const titleMatch = guide.title.toLowerCase().includes(lowerQ);

    // Strip HTML tags helper
    const stripHtml = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();

    // Extract all sections with their text content
    const allContent = stripHtml(guide.content);
    const contentChunks = guide.content.split(/<h[1-4][^>]*>|<div\s+class="[^"]*(?:section-heading|sub-heading|sub2-heading)/i);

    while ((match = headingRegex.exec(guide.content)) !== null) {
      const headingHtml = match[2];
      const headingText = stripHtml(headingHtml);
      if (!headingText) continue;

      // Get content after this heading until next heading
      const afterPos = match.index + match[0].length;
      const nextHeading = guide.content.indexOf('<h', afterPos);
      const nextDiv = guide.content.indexOf('<div class="section-heading', afterPos);
      let endPos = guide.content.length;
      if (nextHeading > 0 && nextHeading < endPos) endPos = nextHeading;
      if (nextDiv > 0 && nextDiv < endPos) endPos = nextDiv;
      const sectionContent = stripHtml(guide.content.substring(afterPos, Math.min(afterPos + 500, endPos)));

      const sectionLower = (headingText + ' ' + sectionContent).toLowerCase();
      if (sectionLower.includes(lowerQ)) {
        // Build snippet with highlight context
        const fullText = headingText + ' — ' + sectionContent;
        const idx = fullText.toLowerCase().indexOf(lowerQ);
        let snippet = '';
        if (idx >= 0) {
          const start = Math.max(0, idx - 60);
          const end = Math.min(fullText.length, idx + q.length + 60);
          snippet = (start > 0 ? '...' : '') + fullText.substring(start, end) + (end < fullText.length ? '...' : '');
        } else {
          snippet = sectionContent.substring(0, 120) + (sectionContent.length > 120 ? '...' : '');
        }

        // Create anchor ID from heading text
        const anchorId = headingText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);

        sections.push({
          heading: headingText,
          snippet,
          anchorId
        });
      }
    }

    // If title matches but no section matches, add guide-level result
    if (titleMatch || sections.length > 0) {
      results.push({
        title: guide.title,
        slug: guide.slug,
        updatedAt: guide.updated_at,
        titleMatch,
        sections: sections.slice(0, 5), // max 5 section results per guide
        summary: allContent.substring(0, 150) + (allContent.length > 150 ? '...' : '')
      });
    }
  }

  res.json({ results: results.slice(0, 10), query: q });
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

// Save guide
app.post('/admin/guide/:slug/save', requireAuth, (req, res) => {
  const { title, content } = req.body;
  const guide = db.getGuideBySlug(req.params.slug);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });

  db.updateGuide(req.params.slug, title, content);
  res.json({ success: true });
});

// Delete guide
app.post('/admin/guide/:slug/delete', requireAuth, (req, res) => {
  db.deleteGuide(req.params.slug);
  res.json({ success: true });
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
