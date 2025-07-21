const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { parseMarkdown, markdownToCards } = require('../utils/markdown');
const router = express.Router();

// GET /api/files - List files with optional filtering (JSON API)
router.get('/files-json', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const filters = {
      tag: req.query.tag,
      status: req.query.status,
      folder: req.query.folder
    };
    
    const files = await database.getAllFiles(filters);
    
    res.json({
      success: true,
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files'
    });
  }
});

// GET /api/file/:id/data - Get specific file data (JSON API)
router.get('/file/:id/data', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const file = await database.getFileById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Read file content
    let content = '';
    try {
      content = await fs.readFile(file.fullPath, 'utf8');
    } catch (error) {
      console.warn('Could not read file content:', error.message);
    }
    
    const { frontMatter, body } = parseMarkdown(content);
    const cards = markdownToCards(body);
    
    res.json({
      success: true,
      file: {
        ...file,
        frontMatter,
        cards,
        rawContent: content
      }
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file'
    });
  }
});

// GET /api/file/:id/raw - Get raw markdown content for editing
router.get('/file/:id/raw', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const file = await database.getFileById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const content = await fs.readFile(file.fullPath, 'utf8');
    
    res.json({
      success: true,
      content: content
    });
  } catch (error) {
    console.error('Error fetching raw file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file content'
    });
  }
});

// PUT /api/file/:id - Save edited content
router.put('/file/:id', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const file = await database.getFileById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Content must be a string'
      });
    }
    
    // Write file content
    await fs.writeFile(file.fullPath, content, 'utf8');
    
    // Update file metadata
    const { frontMatter } = parseMarkdown(content);
    await database.upsertFile({
      ...file,
      frontMatter,
      size: Buffer.byteLength(content, 'utf8'),
      updatedAt: new Date().toISOString()
    });
    
    // Return HTML for the updated file view
    const cards = markdownToCards(content.split('---')[2] || content);
    const toolbar = `
      <div class="toolbar">
        <button class="btn" 
                hx-get="/api/file/${file.id}/edit" 
                hx-target="#preview" 
                hx-swap="innerHTML">
          ✏️ Edit
        </button>
        <button class="btn btn-sm">📄 Split</button>
        <button class="btn btn-sm">📜 History</button>
      </div>
    `;
    
    let html = toolbar;
    cards.forEach(card => {
      if (card.type === 'header') {
        html += `
          <div class="card card-header">
            <h${card.level}>${card.title}</h${card.level}>
            ${card.content.length > 0 ? `<div>${card.content.join('<br>')}</div>` : ''}
          </div>
        `;
      } else {
        html += `
          <div class="card card-content">
            <div>${card.content.join('<br>')}</div>
          </div>
        `;
      }
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).send(`
      <div class="card">
        <h3 style="color: var(--color-error);">Error Saving File</h3>
        <p>Could not save file. Please try again.</p>
      </div>
    `);
  }
});

// POST /api/new - Create new file
router.post('/new', async (req, res) => {
  try {
    const { title, content = '', path: filePath } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    // Generate filename from title
    const filename = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-') + '.md';
    
    const fullPath = path.join(filePath || 'meta/todo', filename);
    
    // Create content with front matter
    const fileContent = `---
title: ${title}
created: ${new Date().toISOString()}
status: Draft
---

${content}`;
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Write file
    await fs.writeFile(fullPath, fileContent, 'utf8');
    
    // Add to database
    const database = req.app.locals.database;
    const fileId = crypto.createHash('md5').update(fullPath).digest('hex');
    
    await database.upsertFile({
      id: fileId,
      filename: filename,
      fullPath: fullPath,
      relativePath: path.relative(process.cwd(), fullPath),
      size: Buffer.byteLength(fileContent, 'utf8'),
      type: 'markdown',
      frontMatter: { title, status: 'Draft' },
      needsAttention: false
    });
    
    // Return HTML response for the new file
    const html = `
      <div class="card">
        <h1>${title}</h1>
        <p class="text-secondary">File created successfully!</p>
        <div class="toolbar">
          <button class="btn" 
                  hx-get="/api/file/${fileId}" 
                  hx-target="#preview" 
                  hx-swap="innerHTML">
            👁️ View File
          </button>
          <button class="btn" 
                  hx-get="/api/file/${fileId}/edit" 
                  hx-target="#preview" 
                  hx-swap="innerHTML">
            ✏️ Edit File
          </button>
        </div>
      </div>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).send(`
      <div class="card">
        <h3 style="color: var(--color-error);">Error Creating File</h3>
        <p>Could not create file. Please try again.</p>
      </div>
    `);
  }
});

module.exports = router; 