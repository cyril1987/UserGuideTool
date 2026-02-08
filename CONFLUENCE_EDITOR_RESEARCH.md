# Confluence Editor Research & Feature Recommendations for UserGuideTool

## Executive Summary

This document maps Confluence Editor's full feature set against the UserGuideTool's current capabilities, and recommends features worth adding — prioritized by impact and implementation complexity.

---

## 1. Current UserGuideTool vs Confluence: Feature Comparison

### Legend
- **Have** = Already implemented in UserGuideTool
- **Gap** = Not yet implemented, recommended to add
- **N/A** = Not applicable or not worth adding for this tool

---

### A. Text Formatting

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Bold / Italic / Underline | Yes | Yes | **Have** |
| Strikethrough | Yes | Yes | **Have** |
| Subscript / Superscript | Yes | No | **Gap** |
| Text Color | Yes | Yes | **Have** |
| Text Highlight / Background Color | Yes | Yes | **Have** |
| Inline Code | Yes | No | **Gap** |
| Headings H1-H6 | H1-H6 | H1-H4 | **Gap** (missing H5, H6) |
| Alignment (Left/Center/Right) | Yes | No | **Gap** |
| Indentation (Increase/Decrease) | Yes | No | **Gap** |

### B. Lists

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Bullet List | Yes | Yes | **Have** |
| Numbered List | Yes | Yes | **Have** |
| Nested Lists | Yes | Partial | **Gap** (indent/outdent controls) |
| Task / Checklist Items | Yes (with @mention assignment) | No | **Gap** |

### C. Block Elements

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Blockquote | Yes | Yes | **Have** |
| Code Block (syntax highlight) | Yes (80+ languages) | Basic | **Gap** (no syntax highlighting) |
| Panels (Info/Tip/Warning/Note/Success) | Yes (5 types, 20 colors) | Yes (4 types: Tip/Did You Know/Warning/Info) | **Partial** (add Success, custom colors) |
| Expand / Collapse Sections | Yes | No | **Gap** |
| Horizontal Divider | Yes | Yes | **Have** |
| Table | Yes | Yes | **Have** |
| Status Lozenge / Badge | Yes (6 colors) | No | **Gap** |
| Date Picker | Yes | No | **Gap** |

### D. Table Features

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Insert Table | Yes | Yes | **Have** |
| Add/Remove Rows & Columns | Yes | Yes | **Have** |
| Header Row Toggle | Yes | Yes | **Have** |
| Merge / Split Cells | Yes | Yes | **Have** |
| Column Resize | Yes | Yes | **Have** |
| Column Sorting | Yes | No | **Gap** |
| Numbered Column | Yes | No | **Gap** |
| Drag-and-Drop Row/Column Reorder | Yes | No | **Gap** |
| Sticky Header on Scroll | Yes | No | **Gap** |
| Header Column Toggle | Yes | No | **Gap** |
| Table Caption | No | No | **Gap** (opportunity to surpass Confluence) |

### E. Media & Files

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Image Upload | Yes | Yes | **Have** |
| Image Resize | Yes | Yes | **Have** |
| Image Alt Text | Yes | No | **Gap** |
| Image Link / Click Action | Yes | No | **Gap** |
| Image Alignment (float left/right/center) | Yes | No | **Gap** |
| Image Caption | Yes | No | **Gap** |
| Video Embed (YouTube/Vimeo) | Yes | No | **Gap** |
| File Attachment | Yes | No | **Gap** |
| Gallery / Image Grid | Yes (Gallery macro) | No | **Gap** |
| PDF Embed | Yes | No | **Gap** |

### F. Links & Navigation

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Hyperlinks | Yes | Yes | **Have** |
| Anchor Links (within page) | Yes | Yes (TOC auto-generates) | **Have** |
| Table of Contents (reader view) | Yes | Yes | **Have** |
| Table of Contents (in editor) | Macro | No | **Gap** |
| Breadcrumbs | Yes | No | **Gap** |
| Page Tree / Guide Navigation | Yes | No | **Gap** |
| Smart Links (URL preview cards) | Yes | No | **Gap** |

### G. Layout & Structure

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Multi-Column Layouts (2-col, 3-col) | Yes | No | **Gap** |
| Section Containers | Yes | No | **Gap** |
| Tabs / Tabbed Content | Via Marketplace | No | **Gap** |
| Accordion / FAQ Sections | Via Expand macro | No | **Gap** |

### H. Inline Elements

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Emoji Picker | Yes | Yes | **Have** |
| Icon Picker | Custom emoji | Yes | **Have** |
| Mention (@user) | Yes | No | **N/A** (single-admin tool) |
| Date Insertion | Yes | No | **Gap** |
| Status Badge / Lozenge | Yes | No | **Gap** |
| Placeholder Text | Yes | No | **Gap** |

### I. Editor UX Features

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Visual WYSIWYG Editor | Yes | Yes | **Have** |
| HTML Source Mode | No (ADF only) | Yes | **Have** (advantage!) |
| Undo / Redo | Yes | Yes | **Have** |
| Keyboard Shortcuts | Yes | Partial | **Gap** (expand shortcut coverage) |
| Slash Commands (`/` menu) | Yes | No | **Gap** |
| Block Drag-and-Drop Reorder | Yes | Up/Down buttons | **Gap** |
| Floating Toolbar (on text select) | Yes | Block toolbar on hover | **Gap** (add formatting on selection) |
| Word / Character Count | Yes | No | **Gap** |
| Find and Replace | Browser-only | No | **Gap** |
| Markdown Shortcuts (auto-convert) | Yes (`#`, `*`, `>`, `---`, `1.`) | No | **Gap** |
| Auto-save | Yes | Yes | **Have** |
| Preview Mode | Yes | Yes | **Have** |
| Full-Screen / Focus Mode | No | No | **Gap** (opportunity) |

### J. Collaboration & Versioning

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Version History | Yes (full diff view) | No | **Gap** |
| Restore Previous Versions | Yes | No | **Gap** |
| Compare Versions (diff) | Yes | No | **Gap** |
| Inline Comments | Yes | No | **Gap** |
| Page-Level Comments | Yes | No | **Gap** |
| Real-Time Collaborative Editing | Yes (Synchrony) | No | **N/A** (single-admin) |

### K. Templates & Content Generation

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| Page Templates | Yes (70+) | No | **Gap** |
| Template Variables / Placeholders | Yes | No | **Gap** |
| Duplicate / Clone Guide | Yes | No | **Gap** |

### L. Export & Publishing

| Feature | Confluence | UserGuideTool | Status |
|---------|-----------|---------------|--------|
| PDF Export | Yes | No | **Gap** |
| Word Export | Yes | No | **Gap** |
| Print-Friendly View | Yes | No | **Gap** |

---

## 2. Prioritized Feature Recommendations

### Priority 1 — High Impact, Moderate Effort (Recommended First)

These features significantly improve the editing experience and are commonly expected in modern editors.

#### 1.1 Slash Command Menu (`/` to insert)
- **What**: Type `/` anywhere to open a searchable command palette for inserting any block or element
- **Why**: This is the #1 UX pattern from Confluence, Notion, and modern editors. Dramatically speeds up content creation.
- **Elements to include**: Heading 1-6, Bullet List, Numbered List, Task List, Table, Code Block, Callout (Tip/Warning/Info/Success), Expand/Collapse, Divider, Image, Video Embed, Status Badge, Date, Columns Layout
- **Complexity**: Medium

#### 1.2 Expand / Collapse Sections
- **What**: Collapsible content sections with a clickable header/title
- **Why**: Essential for FAQs, long guides, step-by-step instructions. One of Confluence's most-used macros.
- **Implementation**: `<details><summary>` HTML elements with custom styling
- **Complexity**: Low

#### 1.3 Multi-Column Layouts
- **What**: Split content into 2 or 3 columns within a section
- **Why**: Critical for comparison content, side-by-side instructions, feature grids
- **Presets**: 50/50, 33/33/33, 30/70, 70/30
- **Complexity**: Medium

#### 1.4 Code Block with Syntax Highlighting
- **What**: Code blocks with language selector and syntax highlighting (using highlight.js or Prism.js)
- **Why**: Technical guides need proper code formatting. Currently code blocks have no highlighting.
- **Languages**: JavaScript, Python, HTML, CSS, SQL, Bash, JSON, TypeScript, Java, C#, PHP, Ruby, Go, Rust, YAML, XML, Markdown
- **Features**: Language selector dropdown, copy-to-clipboard button, line numbers toggle, filename/title label
- **Complexity**: Medium (can use highlight.js library)

#### 1.5 Markdown Shortcuts (Auto-Convert)
- **What**: Typing Markdown-style shortcuts auto-converts to formatted content
- **Why**: Power users expect this. Confluence, Notion, and Google Docs all support it.
- **Shortcuts**:
  - `# ` → H1, `## ` → H2, `### ` → H3, etc.
  - `* ` or `- ` → Bullet list
  - `1. ` → Numbered list
  - `[] ` or `[ ] ` → Task/checklist item
  - `> ` → Blockquote
  - `` ``` `` → Code block
  - `---` → Horizontal divider
  - `**text**` → Bold, `*text*` → Italic, `~~text~~` → Strikethrough
- **Complexity**: Medium

#### 1.6 Floating Format Toolbar (on Text Selection)
- **What**: When text is selected, show a floating bubble toolbar with Bold/Italic/Underline/Strikethrough/Link/Code/Color options
- **Why**: Much faster than reaching for the top toolbar. Standard in Confluence, Notion, Medium, Google Docs.
- **Complexity**: Medium

#### 1.7 Version History & Restore
- **What**: Save versioned snapshots of each guide. Allow viewing previous versions with diff highlighting and one-click restore.
- **Why**: Critical safety net for content editors. Prevents accidental data loss.
- **Implementation**: Add a `guide_versions` table storing content snapshots with timestamps. Show a version history panel with diff view.
- **Complexity**: Medium-High

---

### Priority 2 — Medium Impact, Low-Medium Effort

#### 2.1 Task / Checklist Items
- **What**: Interactive checkboxes that can be toggled in both edit and read mode
- **Why**: Great for onboarding guides, setup instructions, checklists
- **Implementation**: Styled `<input type="checkbox">` within list items
- **Complexity**: Low

#### 2.2 Status Badges / Lozenges
- **What**: Colored inline badges (e.g., `IN PROGRESS`, `DONE`, `DEPRECATED`, `NEW`, `BETA`)
- **Why**: Visual status indicators for feature documentation, changelogs, API docs
- **Colors**: Grey, Blue, Green, Yellow, Red, Purple (matching Confluence)
- **Complexity**: Low

#### 2.3 Text Alignment (Left / Center / Right / Justify)
- **What**: Paragraph-level text alignment controls
- **Why**: Basic formatting expectation, especially for headings and image captions
- **Complexity**: Low

#### 2.4 Video Embed
- **What**: Paste a YouTube/Vimeo URL and embed the video player inline
- **Why**: Video tutorials are common in user guides
- **Implementation**: Parse URL, generate `<iframe>` embed with responsive wrapper
- **Complexity**: Low

#### 2.5 Image Enhancements
- **What**: Add to existing image handling:
  - Alt text field (accessibility)
  - Caption text below image
  - Alignment: float left, center, float right
  - Click to open full-size (lightbox)
  - Image border/shadow options
- **Complexity**: Low-Medium per feature

#### 2.6 Inline Code Formatting
- **What**: Wrap selected text in `<code>` inline (like `this`)
- **Why**: Essential for technical documentation
- **Shortcut**: Ctrl+E (matching Confluence)
- **Complexity**: Low

#### 2.7 Subscript / Superscript
- **What**: Text formatting for mathematical/scientific notation
- **Complexity**: Low

#### 2.8 Word / Character Count
- **What**: Live word and character count displayed at the bottom of the editor
- **Complexity**: Low

#### 2.9 Find and Replace
- **What**: In-editor search with find (Ctrl+F) and replace (Ctrl+H) functionality
- **Why**: Essential for editing large guides
- **Complexity**: Medium

#### 2.10 Indent / Outdent Controls
- **What**: Increase/decrease indentation for paragraphs and list items (Tab / Shift+Tab)
- **Complexity**: Low

---

### Priority 3 — Nice-to-Have, Medium-High Effort

#### 3.1 Tabbed Content Sections
- **What**: Horizontal tabs that switch between content panels
- **Why**: Great for showing platform-specific instructions (Windows/Mac/Linux), language variants, or grouped content
- **Note**: Confluence doesn't have this natively (requires marketplace), so this would be a differentiator
- **Complexity**: Medium

#### 3.2 Guide Templates
- **What**: Pre-built templates for common guide types:
  - Getting Started Guide
  - API Documentation
  - Troubleshooting Guide
  - FAQ / Knowledge Base
  - Release Notes / Changelog
  - How-To Tutorial
  - Onboarding Checklist
- **Why**: Speeds up content creation, ensures consistency
- **Complexity**: Medium

#### 3.3 Table of Contents in Editor
- **What**: Show a floating/sidebar TOC in the editor that updates as headings change, with click-to-jump
- **Complexity**: Medium

#### 3.4 Smart Link Previews
- **What**: When pasting a URL, auto-fetch the page title, description, and favicon to display as a rich link card
- **Why**: Makes external references much more visually informative
- **Complexity**: Medium (requires server-side URL metadata fetching)

#### 3.5 PDF Export
- **What**: Export any guide as a formatted PDF
- **Why**: Users often need offline/printable versions of documentation
- **Implementation**: Use Puppeteer or html-pdf-node on the server
- **Complexity**: Medium

#### 3.6 Keyboard Shortcut Expansion
- **What**: Add comprehensive keyboard shortcuts:
  - `Ctrl+Shift+8` → Bullet list
  - `Ctrl+Shift+7` → Numbered list
  - `Ctrl+Shift+9` → Blockquote
  - `Ctrl+Alt+1-6` → Heading levels
  - `Ctrl+E` → Inline code
  - `Ctrl+K` → Insert link
  - `Ctrl+Shift+M` → Insert table
  - `Tab` / `Shift+Tab` → Indent/outdent
  - `Ctrl+/` → Show keyboard shortcut help panel
- **Complexity**: Low-Medium

#### 3.7 Drag-and-Drop Block Reorder
- **What**: Drag blocks by a handle to reorder them (instead of Up/Down buttons)
- **Why**: More intuitive and matches modern editors like Notion and Confluence
- **Complexity**: Medium-High

#### 3.8 Duplicate / Clone Guide
- **What**: One-click duplicate an entire guide as a starting point for a new one
- **Complexity**: Low

#### 3.9 Table Sorting
- **What**: Click column headers to sort table rows in the reader view
- **Complexity**: Medium

#### 3.10 Print-Friendly View
- **What**: CSS print stylesheet for clean printing directly from the browser
- **Complexity**: Low

---

### Priority 4 — Advanced Features (Future Roadmap)

#### 4.1 Inline Comments / Annotations
- **What**: Select text and attach a comment/note (visible as highlighted text with a comment sidebar)
- **Why**: Useful for review workflows, editor notes
- **Complexity**: High

#### 4.2 Multi-Guide Page Tree / Navigation
- **What**: Hierarchical guide organization with parent/child pages, drag-and-drop reorder
- **Why**: Enables building a full documentation site with structured navigation
- **Complexity**: High (DB schema changes + UI)

#### 4.3 Content Reuse (Include / Excerpt)
- **What**: Mark a section as reusable, include it in other guides (like Confluence's Excerpt/Include macros)
- **Why**: Keeps shared content in sync across multiple guides
- **Complexity**: High

#### 4.4 Breadcrumb Navigation
- **What**: Show hierarchical path in guide viewer (Home > Category > Guide)
- **Requires**: Guide categorization or page hierarchy
- **Complexity**: Medium

#### 4.5 Custom Blocks / Block Extensions
- **What**: Plugin system for creating custom block types (API response blocks, terminal blocks, comparison blocks, etc.)
- **Complexity**: High

#### 4.6 Gallery / Image Grid
- **What**: Auto-layout multiple images in a responsive grid with lightbox viewing
- **Complexity**: Medium

#### 4.7 Import from Markdown / Word
- **What**: Import existing content from .md or .docx files
- **Complexity**: Medium-High

---

## 3. Technical Architecture Notes (from Confluence)

### What Confluence Uses (for reference)
- **Editor Engine**: ProseMirror (schema-based, transaction-driven document model)
- **Document Format**: ADF (Atlassian Document Format) — structured JSON
- **Collaboration**: Synchrony (proprietary CRDT-based real-time sync)
- **Extension System**: Plugin-based architecture with `EditorPresetBuilder`

### Recommendations for UserGuideTool Architecture
The current contenteditable + vanilla JS approach is working well and keeps the tool lightweight. For the recommended features above, **no framework migration is needed**. However, consider:

1. **Keep contenteditable**: It works, it's lightweight, and you already have a solid foundation
2. **Add highlight.js for code blocks**: Lightweight, no-dependency syntax highlighter
3. **Use `<details><summary>` for expand/collapse**: Native HTML, zero JS needed for basic functionality
4. **CSS Grid/Flexbox for column layouts**: Already using modern CSS
5. **Consider a thin abstraction layer for blocks**: A simple block registry pattern would make adding new block types easier without needing a full framework migration

---

## 4. Feature Implementation Roadmap (Suggested Order)

### Phase 1 — Core Editor Enhancements
1. Slash command menu (`/`)
2. Expand/Collapse sections
3. Inline code formatting
4. Markdown auto-convert shortcuts
5. Text alignment controls
6. Subscript / Superscript

### Phase 2 — Rich Content Blocks
7. Code block syntax highlighting
8. Multi-column layouts
9. Status badges / lozenges
10. Task / checklist items
11. Video embed (YouTube/Vimeo)

### Phase 3 — Editor UX Improvements
12. Floating format toolbar on text selection
13. Find and replace
14. Word / character count
15. Expanded keyboard shortcuts
16. Image enhancements (alt text, caption, lightbox)
17. Indent / Outdent controls

### Phase 4 — Content Management
18. Version history & restore
19. Guide templates
20. Duplicate / Clone guide
21. PDF export
22. Print-friendly view

### Phase 5 — Advanced Features
23. Tabbed content sections
24. Smart link previews
25. Table sorting (reader view)
26. Drag-and-drop block reorder
27. Table of Contents in editor
28. Inline comments / annotations
29. Multi-guide page tree / navigation

---

## 5. Features Where UserGuideTool ALREADY Surpasses Confluence

1. **HTML Source Mode** — Confluence removed direct HTML editing in the Cloud editor. UserGuideTool's dual-mode editor is an advantage for power users.
2. **Lightweight & Self-Hosted** — No cloud dependency, no subscription, instant setup.
3. **Custom Icon Picker** — Built-in SVG icon library with search.
4. **Intelligent Search** — Synonym expansion, stemming, fuzzy matching, and section-level extraction are more advanced than basic Confluence search for a single-site context.
5. **No Macro Complexity** — Confluence requires learning its macro system. UserGuideTool's toolbar-based insertion is more intuitive.

---

*Research completed: February 2026*
*Based on: Atlassian Confluence Cloud Editor (2025-2026), powered by ProseMirror + ADF*
