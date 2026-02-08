const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initialize();
  }
  return db;
}

function initialize() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS guide_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guide_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE
    );
  `);

  // Set default admin password if not exists (default: "admin123")
  const existing = db.prepare('SELECT value FROM config WHERE key = ?').get('admin_password');
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run('admin_password', hash);
  }
}

// --- Guide operations ---

function getAllGuides() {
  return getDb().prepare('SELECT id, title, slug, created_at, updated_at FROM guides ORDER BY updated_at DESC').all();
}

function getAllGuidesWithContent() {
  return getDb().prepare('SELECT id, title, slug, content, updated_at FROM guides ORDER BY updated_at DESC').all();
}

function getGuideBySlug(slug) {
  return getDb().prepare('SELECT * FROM guides WHERE slug = ?').get(slug);
}

function createGuide(title, slug) {
  const result = getDb().prepare('INSERT INTO guides (title, slug, content) VALUES (?, ?, ?)').run(title, slug, '');
  return result.lastInsertRowid;
}

function updateGuide(slug, title, content) {
  return getDb().prepare('UPDATE guides SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?').run(title, content, slug);
}

function deleteGuide(slug) {
  return getDb().prepare('DELETE FROM guides WHERE slug = ?').run(slug);
}

// --- Auth ---

function verifyPassword(password) {
  const row = getDb().prepare('SELECT value FROM config WHERE key = ?').get('admin_password');
  if (!row) return false;
  return bcrypt.compareSync(password, row.value);
}

function changePassword(newPassword) {
  const hash = bcrypt.hashSync(newPassword, 10);
  return getDb().prepare('UPDATE config SET value = ? WHERE key = ?').run(hash, 'admin_password');
}

function searchGuides(query) {
  const pattern = `%${query}%`;
  return getDb().prepare(
    `SELECT id, title, slug, content, updated_at FROM guides
     WHERE title LIKE ? OR content LIKE ?
     ORDER BY
       CASE WHEN title LIKE ? THEN 0 ELSE 1 END,
       updated_at DESC`
  ).all(pattern, pattern, pattern);
}

// Smart search: fetch guides matching any of the given LIKE patterns
function searchGuidesMulti(patterns) {
  if (!patterns || patterns.length === 0) return [];

  const conditions = patterns.map(() => '(title LIKE ? OR content LIKE ?)').join(' OR ');
  const params = [];
  for (const p of patterns) {
    params.push(p, p);
  }

  return getDb().prepare(
    `SELECT id, title, slug, content, updated_at FROM guides
     WHERE ${conditions}
     ORDER BY updated_at DESC`
  ).all(...params);
}

// --- Version history ---

function saveVersion(guideId, title, content) {
  getDb().prepare('INSERT INTO guide_versions (guide_id, title, content) VALUES (?, ?, ?)').run(guideId, title, content);
  // Keep only the last 50 versions per guide
  getDb().prepare(`
    DELETE FROM guide_versions
    WHERE guide_id = ? AND id NOT IN (
      SELECT id FROM guide_versions WHERE guide_id = ? ORDER BY created_at DESC LIMIT 50
    )
  `).run(guideId, guideId);
}

function getVersions(guideId) {
  return getDb().prepare('SELECT id, title, created_at FROM guide_versions WHERE guide_id = ? ORDER BY created_at DESC').all(guideId);
}

function getVersion(versionId) {
  return getDb().prepare('SELECT * FROM guide_versions WHERE id = ?').get(versionId);
}

module.exports = {
  getDb,
  getAllGuides,
  getAllGuidesWithContent,
  getGuideBySlug,
  createGuide,
  updateGuide,
  deleteGuide,
  verifyPassword,
  changePassword,
  searchGuides,
  searchGuidesMulti,
  saveVersion,
  getVersions,
  getVersion,
};
