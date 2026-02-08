const fs = require('fs');
const path = require('path');
const db = require('./database');

// Read the HTML content from the seed-content file
const contentPath = path.join(__dirname, 'seed-content.html');

let content;
try {
  content = fs.readFileSync(contentPath, 'utf8');
} catch (e) {
  console.error('seed-content.html not found, using inline content');
  content = '<p>Content file not found. Please ensure seed-content.html exists.</p>';
}

const title = 'Invoice Processing v1.0';
const slug = 'invoice-processing-v1';

// Check if guide already exists
const existing = db.getGuideBySlug(slug);
if (existing) {
  console.log(`Guide "${title}" already exists (slug: ${slug}). Updating content...`);
  db.updateGuide(slug, title, content);
  console.log('Guide updated successfully!');
} else {
  db.createGuide(title, slug);
  db.updateGuide(slug, title, content);
  console.log(`Guide "${title}" created successfully!`);
}

console.log(`View it at: http://localhost:3000/guide/${slug}`);
