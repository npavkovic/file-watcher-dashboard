const express = require('express');
const path = require('path');
const router = express.Router();

// Helper function to render file list as HTML
function renderFileList(files) {
  if (!files || files.length === 0) {
    return `
      <div class="file-list">
        <p class="text-secondary text-sm">No files found. Add some directories to watch or create a new file.</p>
      </div>
    `;
  }

  // Group files by directory
  const filesByDir = {};
  files.forEach(file => {
    const dir = path.dirname(file.relativePath || file.fullPath || '');
    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push(file);
  });

  let html = '<ul class="file-list">';
  
  Object.keys(filesByDir).sort().forEach(dir => {
    const dirFiles = filesByDir[dir];
    
    // Add directory header if not root
    if (dir && dir !== '.') {
      const dirId = `dir-${dir.replace(/[^a-zA-Z0-9]/g, '-')}`;
      html += `
        <li class="file-item">
          <button class="folder-toggle" 
                  aria-expanded="true" 
                  data-target="${dirId}">
            <span class="folder-icon">▶</span>
            ${dir}
          </button>
          <ul id="${dirId}" class="file-list" style="margin-left: var(--space-4);">
      `;
    }
    
    // Add files
    dirFiles.forEach(file => {
      const fileName = path.basename(file.relativePath || file.fullPath || file.filename || 'unknown');
      const statusBadge = file.needsAttention ? 
        '<span class="status-badge needs-triage">!</span>' : '';
      
      html += `
        <li class="file-item">
          <a href="#" 
             class="file-link" 
             hx-get="/api/file/${file.id}" 
             hx-target="#preview" 
             hx-swap="innerHTML"
             data-file-id="${file.id}">
            ${fileName} ${statusBadge}
          </a>
        </li>
      `;
    });
    
    if (dir && dir !== '.') {
      html += '</ul></li>';
    }
  });
  
  html += '</ul>';
  return html;
}

// Helper function to render cards from file content
function renderFileCards(file) {
  if (!file.cards || file.cards.length === 0) {
    return `
      <div class="card">
        <h1>${file.frontMatter?.title || path.basename(file.filename || 'Untitled')}</h1>
        <p class="text-secondary">This file appears to be empty or has no structured content.</p>
      </div>
    `;
  }

  let html = '';
  
  file.cards.forEach(card => {
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

  return html;
}

// GET /api/files - Return HTML file list
router.get('/files', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const filters = {
      tag: req.query.tag,
      status: req.query.status,
      folder: req.query.folder
    };
    
    const files = await database.getAllFiles(filters);
    const html = renderFileList(files);
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering file list:', error);
    res.status(500).send(`
      <div class="card">
        <h3 style="color: var(--color-error);">Error Loading Files</h3>
        <p>Could not load file list. Please try again.</p>
      </div>
    `);
  }
});

// GET /api/file/:id - Return HTML cards for file  
router.get('/file/:id', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const filesRouter = require('./files');
    
    // Get file data using the existing API
    const mockReq = { params: req.params, app: req.app };
    const mockRes = {
      json: (data) => data,
      status: (code) => ({ json: (data) => ({ status: code, ...data }) })
    };
    
    // This is a bit hacky - ideally we'd refactor to share logic
    const file = await database.getFileById(req.params.id);
    if (!file) {
      return res.status(404).send(`
        <div class="card">
          <h3 style="color: var(--color-error);">File Not Found</h3>
          <p>The requested file could not be found.</p>
        </div>
      `);
    }

    // Read file content and parse
    const fs = require('fs').promises;
    let content = '';
    try {
      content = await fs.readFile(file.fullPath, 'utf8');
    } catch (error) {
      console.warn('Could not read file content:', error.message);
    }

         // Parse content (reuse logic from utils)
     const { parseMarkdown, markdownToCards } = require('../utils/markdown');
     const { frontMatter, body } = parseMarkdown(content);
    const cards = markdownToCards(body);

    const fileData = {
      ...file,
      frontMatter,
      cards,
      rawContent: content
    };

    // Render toolbar
    const toolbar = `
      <div class="toolbar">
        <button class="btn" 
                hx-get="/api/file/${file.id}/edit" 
                hx-target="#preview" 
                hx-swap="innerHTML">
          ✏️ Edit
        </button>
        <button class="btn btn-sm">
          📄 Split
        </button>
        <button class="btn btn-sm">
          📜 History
        </button>
        ${file.needsAttention ? `
          <span class="status-badge needs-triage">Needs Attention</span>
        ` : ''}
      </div>
    `;

    const html = toolbar + renderFileCards(fileData);
    res.send(html);
  } catch (error) {
    console.error('Error rendering file:', error);
    res.status(500).send(`
      <div class="card">
        <h3 style="color: var(--color-error);">Error Loading File</h3>
        <p>Could not load file content. Please try again.</p>
      </div>
    `);
  }
});

// GET /api/file/:id/edit - Return edit form
router.get('/file/:id/edit', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const file = await database.getFileById(req.params.id);
    
    if (!file) {
      return res.status(404).send(`
        <div class="card">
          <h3 style="color: var(--color-error);">File Not Found</h3>
          <p>The requested file could not be found.</p>
        </div>
      `);
    }

    const fs = require('fs').promises;
    const content = await fs.readFile(file.fullPath, 'utf8');

    const html = `
      <div class="card">
        <div class="toolbar">
          <button class="btn btn-primary" 
                  hx-put="/api/file/${file.id}" 
                  hx-include="#edit-form"
                  hx-target="#preview" 
                  hx-swap="innerHTML">
            💾 Save
          </button>
          <button class="btn" 
                  hx-get="/api/file/${file.id}" 
                  hx-target="#preview" 
                  hx-swap="innerHTML">
            ❌ Cancel
          </button>
        </div>
        
        <form id="edit-form">
          <div class="form-group">
            <label class="form-label" for="content">Content</label>
            <textarea class="form-textarea" 
                      name="content" 
                      id="content" 
                      rows="20"
                      style="font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
          </div>
        </form>
      </div>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error rendering edit form:', error);
    res.status(500).send(`
      <div class="card">
        <h3 style="color: var(--color-error);">Error Loading Editor</h3>
        <p>Could not load file for editing. Please try again.</p>
      </div>
    `);
  }
});

// GET /api/new-file-form - Return new file form modal
router.get('/new-file-form', (req, res) => {
  const html = `
    <div class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Create New File</h2>
        </div>
        
        <form id="new-file-form">
          <div class="form-group">
            <label class="form-label" for="title">Title</label>
            <input type="text" 
                   class="form-input" 
                   name="title" 
                   id="title" 
                   placeholder="Enter file title"
                   required>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="path">Directory</label>
            <input type="text" 
                   class="form-input" 
                   name="path" 
                   id="path" 
                   placeholder="meta/todo/"
                   value="meta/todo/">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="content">Initial Content (optional)</label>
            <textarea class="form-textarea" 
                      name="content" 
                      id="content" 
                      rows="5"
                      placeholder="Enter initial content..."></textarea>
          </div>
        </form>
        
        <div class="modal-actions">
          <button class="btn" onclick="this.closest('.modal').remove()">
            Cancel
          </button>
          <button class="btn btn-primary" 
                  hx-post="/api/new" 
                  hx-include="#new-file-form"
                  hx-target="#preview" 
                  hx-swap="innerHTML"
                  hx-on::after-request="this.closest('.modal').remove(); htmx.trigger('#file-list', 'load')">
            Create File
          </button>
        </div>
      </div>
    </div>
  `;
  
  res.send(html);
});

// GET /api/intake-view - Return intake files view
router.get('/intake-view', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const intakeFiles = await database.getIntakeFiles();
    
    let html = `
      <div class="card">
        <h1>Intake Files</h1>
        <p class="text-secondary">Files that need your attention</p>
        
        <div class="toolbar">
          <button class="btn btn-sm" 
                  hx-get="/api/intake" 
                  hx-target="#preview" 
                  hx-swap="innerHTML">
            🔄 Refresh
          </button>
        </div>
      </div>
    `;
    
    if (intakeFiles.length === 0) {
      html += `
        <div class="card">
          <p class="text-secondary">No files need attention right now. Great job!</p>
        </div>
      `;
    } else {
      intakeFiles.forEach(file => {
        const fileName = path.basename(file.relativePath || file.fullPath || 'unknown');
        html += `
          <div class="card">
            <h3>${fileName}</h3>
            <p class="text-secondary">${file.relativePath || file.fullPath}</p>
            <p><span class="status-badge needs-triage">Needs Triage</span></p>
            
            <div class="toolbar">
              <button class="btn btn-primary btn-sm" 
                      hx-post="/api/intake/${file.id}/accept" 
                      hx-target="#preview" 
                      hx-swap="innerHTML">
                ✅ Accept
              </button>
              <button class="btn btn-sm" 
                      hx-post="/api/intake/${file.id}/archive" 
                      hx-target="#preview" 
                      hx-swap="innerHTML">
                📁 Archive
              </button>
              <button class="btn btn-sm" 
                      hx-get="/api/file/${file.id}" 
                      hx-target="#preview" 
                      hx-swap="innerHTML">
                👁️ View
              </button>
            </div>
          </div>
        `;
      });
    }
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering intake:', error);
    res.status(500).send(`
      <div class="card">
        <h3 style="color: var(--color-error);">Error Loading Intake</h3>
        <p>Could not load intake files. Please try again.</p>
      </div>
    `);
  }
});

// GET /api/paths-view - Return paths management view
router.get('/paths-view', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const pathsFile = path.join(process.cwd(), 'watcher.paths.json');
    
    let paths = [];
    try {
      const data = await fs.readFile(pathsFile, 'utf8');
      paths = JSON.parse(data);
    } catch (error) {
      console.warn('Could not read paths file:', error.message);
    }
    
    let html = `
      <div class="card">
        <h1>Watched Paths</h1>
        <p class="text-secondary">Manage directories that are being monitored for changes</p>
        
        <div class="toolbar">
          <button class="btn btn-primary btn-sm" 
                  hx-get="/api/add-path-form" 
                  hx-target="body" 
                  hx-swap="beforeend">
            ➕ Add Path
          </button>
        </div>
      </div>
    `;
    
    if (paths.length === 0) {
      html += `
        <div class="card">
          <p class="text-secondary">No paths are currently being watched. Add some directories to get started.</p>
        </div>
      `;
    } else {
      paths.forEach(watchPath => {
        html += `
          <div class="card">
            <h3>${watchPath}</h3>
            <div class="toolbar">
              <button class="btn btn-sm" 
                      hx-delete="/api/paths" 
                      hx-vals='{"path": "${watchPath}"}'
                      hx-target="#preview" 
                      hx-swap="innerHTML"
                      hx-confirm="Remove this path from watching?">
                🗑️ Remove
              </button>
            </div>
          </div>
        `;
      });
    }
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering paths:', error);
    res.status(500).send(`
      <div class="card">
        <h3 style="color: var(--color-error);">Error Loading Paths</h3>
        <p>Could not load watched paths. Please try again.</p>
      </div>
    `);
  }
});

// GET /api/add-path-form - Return add path form modal
router.get('/add-path-form', (req, res) => {
  const html = `
    <div class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Add Watched Path</h2>
        </div>
        
        <form id="add-path-form">
          <div class="form-group">
            <label class="form-label" for="path">Directory Path</label>
            <input type="text" 
                   class="form-input" 
                   name="path" 
                   id="path" 
                   placeholder="/absolute/path/to/directory"
                   required>
            <small class="text-secondary">Must be an absolute path to an existing directory</small>
          </div>
        </form>
        
        <div class="modal-actions">
          <button class="btn" onclick="this.closest('.modal').remove()">
            Cancel
          </button>
          <button class="btn btn-primary" 
                  hx-post="/api/paths" 
                  hx-include="#add-path-form"
                  hx-target="#preview" 
                  hx-swap="innerHTML"
                  hx-on::after-request="this.closest('.modal').remove()">
            Add Path
          </button>
        </div>
      </div>
    </div>
  `;
  
  res.send(html);
});

module.exports = router; 