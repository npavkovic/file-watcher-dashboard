# 📚 How the File Watcher Dashboard Works

## 🎯 What This Program Does

The File Watcher Dashboard is like having a smart assistant that:
1. **Watches** folders on your computer for new files
2. **Organizes** those files automatically using AI
3. **Shows** you a beautiful web interface to browse and edit them
4. **Remembers** everything in a simple database

Think of it as a smart filing cabinet that sorts your documents as soon as you drop them in!

---

## 🏗️ The Big Picture

```
📁 Your Folders → 👀 File Watcher → 🤖 AI Classifier → 📊 Database → 🌐 Web Interface
```

Here's what happens when you save a file:

1. **Chokidar** (file watcher) notices the new file
2. **AI** reads it and decides what type of file it is
3. **Database** stores information about the file
4. **Web interface** shows it in your dashboard
5. **You** can view, edit, or organize it further

---

## 🔍 Core Components

### 1. 👀 File Watcher (`src/watcher/ingest.js`)

This is like a security guard that never sleeps, watching your folders 24/7.

```javascript
// Watches multiple directories at once
this.watcher = chokidar.watch(this.watchedPaths, {
  ignored: /(^|[\/\\])\../, // Ignore hidden files
  persistent: true,
  ignoreInitial: false
});

// When something happens...
this.watcher
  .on('add', (filepath) => this.handleFileAdd(filepath))      // New file!
  .on('change', (filepath) => this.handleFileChange(filepath)) // File changed!
  .on('unlink', (filepath) => this.handleFileUnlink(filepath)) // File deleted!
```

**What it does:**
- Monitors folders you specify in `watcher.paths.json`
- Detects when files are added, changed, or deleted
- Calls different functions based on what happened
- Can restart itself when you add/remove watched folders

### 2. 🤖 AI Classifier (`src/services/aiProvider.js`)

This is your smart assistant that reads files and decides where they belong.

```javascript
async classifyFile(frontMatter, bodyPreview, categories) {
  const prompt = `Classify this file based on its content. Choose ONE category ID.

Available categories:
${categoryOptions}

File front matter: ${JSON.stringify(frontMatter)}
Content preview: ${bodyPreview.substring(0, 500)}

Respond with just the category ID (e.g., "blog_idea").`;

  const response = await this.client.chat.completions.create({
    model: this.model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 50,
    temperature: 0.1
  });
}
```

**What it does:**
- Reads the beginning of your files
- Sends the content to AI (OpenAI, Groq, etc.)
- Gets back a category like "blog_idea" or "meeting_notes"
- Handles rate limits and errors gracefully
- Can be disabled to save money

### 3. 📊 Database (`src/database.js`)

Think of this as a smart filing cabinet that remembers everything about your files.

```javascript
async upsertFile(fileData) {
  const files = this.db.data.files || [];
  const existingIndex = files.findIndex(file => file.id === fileData.id);
  
  if (existingIndex >= 0) {
    // Update existing file
    files[existingIndex] = { ...files[existingIndex], ...fileData };
  } else {
    // Add new file
    files.push({
      ...fileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}
```

**What it stores:**
- File location and name
- When it was created/modified
- What category AI thinks it belongs to
- Any tags or metadata
- Whether it needs your attention

### 4. 🌐 Web Interface (`src/web/index.html`)

This is your dashboard - what you see in your browser.

```html
<div class="layout">
  <!-- Left side: List of files -->
  <div class="sidebar">
    <div id="file-list" 
         hx-get="/api/files" 
         hx-trigger="load">
      Loading files...
    </div>
  </div>

  <!-- Right side: File content -->
  <main class="preview">
    <div id="preview">
      Select a file to view...
    </div>
  </main>
</div>
```

**What it does:**
- Shows a clean, modern interface
- Lists all your files in the sidebar
- Displays file content in cards when you click
- Lets you edit files directly in the browser
- Updates automatically when files change

---

## 🔄 The Complete Workflow

### When You Add a New File

```mermaid
graph LR
A[📄 New File] --> B[👀 Watcher Detects]
B --> C[📖 Read Content]
C --> D[🤖 AI Classifies]
D --> E[📊 Save to Database]
E --> F[🌐 Update Interface]
```

Here's the step-by-step process:

1. **You save a file** (like `my-notes.md`) in a watched folder
2. **Chokidar notices** and calls `handleFileAdd()`
3. **System reads the file** and extracts front matter (title, tags, etc.)
4. **AI looks at the content** and decides it's a "meeting_notes" type file
5. **Database stores** all the information
6. **Web interface updates** to show your new file
7. **You see it** in your dashboard sidebar

### When You View a File

```javascript
// API gets file from database
const file = await database.getFileById(req.params.id);

// Reads actual file content
const content = await fs.readFile(file.fullPath, 'utf8');

// Splits content into cards based on headings
const cards = markdownToCards(content);

// Sends HTML back to your browser
res.send(renderFileCards(cards));
```

### When You Edit a File

```javascript
// Browser sends new content to server
app.put('/api/file/:id', async (req, res) => {
  const { content } = req.body;
  
  // Saves to actual file
  await fs.writeFile(file.fullPath, content, 'utf8');
  
  // Updates database with new info
  await database.upsertFile({
    ...file,
    updatedAt: new Date().toISOString()
  });
});
```

---

## 🛠️ Key Technologies Explained

### HTMX - The Magic Behind the Interface

Instead of refreshing the whole page, HTMX updates just parts of it:

```html
<!-- When you click this button... -->
<button hx-get="/api/file/123" 
        hx-target="#preview" 
        hx-swap="innerHTML">
  View File
</button>

<!-- ...it loads content into this div -->
<div id="preview">
  Content appears here!
</div>
```

**Why this is cool:**
- Page feels instant and responsive
- No complex JavaScript frameworks needed
- Server sends back just HTML snippets
- Works even with JavaScript disabled

### LowDB - The Simple Database

Instead of complex databases, we use JSON files:

```javascript
// Your data is stored like this:
{
  "files": [
    {
      "id": "abc123",
      "filename": "my-notes.md",
      "fullPath": "/Users/you/notes/my-notes.md",
      "frontMatter": { "title": "Meeting Notes" },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "settings": {}
}
```

**Benefits:**
- Easy to backup (just copy the JSON file)
- No database server to install
- Human-readable format
- Works great for thousands of files

### Markdown Processing

Files are split into "cards" based on headings:

```javascript
function markdownToCards(content) {
  const lines = content.split('\n');
  
  for (let line of lines) {
    // Check for headers like "# My Title"
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      // Start a new card
      currentCard = {
        type: 'header',
        level: headerMatch[1].length,
        title: headerMatch[2]
      };
    }
  }
}
```

This turns:
```markdown
# Project Ideas
Some intro text

## Idea 1: File Watcher
This could be useful...

## Idea 2: Todo App
Another good idea...
```

Into separate cards you can see individually.

---

## 📁 File Organization System

### Filing Rules (`meta/filing-rules.yaml`)

This file tells the AI how to organize your files:

```yaml
classification:
  categories:
    blog_idea:
      name: "Blog Idea"
      description: "Short proposal for a blog post"
      destination: "meta/blog-ideas/"
    meeting_notes:
      name: "Meeting Notes"
      description: "Notes from meetings or calls"
      destination: "work/meetings/"
```

### How Classification Works

1. **AI reads your file** and sees content like "Meeting with John about project X"
2. **Compares with categories** and thinks "this sounds like meeting notes"
3. **Returns category ID** like `meeting_notes`
4. **System can move file** to the right folder automatically
5. **You can override** the AI decision if needed

---

## 🔌 API Structure

The program has two types of APIs:

### JSON APIs (for machines)
```
GET  /api/files-json         → List all files as JSON
GET  /api/file/123/data      → Get file details as JSON
PUT  /api/file/123           → Save file content
POST /api/new                → Create new file
```

### HTML APIs (for the web interface)
```
GET  /api/files              → HTML list of files for sidebar
GET  /api/file/123           → HTML cards showing file content
GET  /api/file/123/edit      → HTML form for editing
GET  /api/new-file-form      → HTML modal for creating files
```

**Why both?**
- JSON APIs are for other programs or mobile apps
- HTML APIs make the web interface fast and simple
- Same data, different formats

---

## 🚀 Performance & Efficiency

### File Watching Optimization

```javascript
// Only watch for real changes, not temporary files
this.watcher = chokidar.watch(paths, {
  ignored: /(^|[\/\\])\../,     // Skip hidden files
  awaitWriteFinish: {           // Wait for file to finish writing
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});
```

### AI Rate Limiting

```javascript
// Don't spam the AI service
if (this.requestCount >= this.maxRequests) {
  return { category: 'default', reasoning: 'Rate limit exceeded' };
}
```

### Database Efficiency

```javascript
// Only update what changed
if (existingIndex >= 0) {
  files[existingIndex] = { ...files[existingIndex], ...fileData };
} else {
  files.push(newFile);
}
```

---

## 🔧 Configuration Made Simple

### Environment Variables (`.env`)

```bash
# AI Settings
OPENAI_API_KEY=your-key-here
AI_MODEL=gpt-4o-mini
AI_MAX_REQUESTS_PER_MINUTE=10

# Server Settings
PORT=3000
NODE_ENV=development
```

### Watched Paths (`watcher.paths.json`)

```json
[
  "/Users/you/Documents/notes",
  "/Users/you/Dropbox/ideas",
  "/Users/you/work-files"
]
```

### Filing Rules (`meta/filing-rules.yaml`)

```yaml
classification:
  model: "gpt-4o-mini"
  categories:
    your_custom_category:
      name: "Your Custom Category"
      description: "Files that match your criteria"
      destination: "sorted/custom/"
```

---

## 🎨 The User Experience

### What You See

1. **Clean sidebar** with all your files organized by folder
2. **Preview pane** showing file content split into readable cards
3. **Edit button** that turns content into a text editor
4. **Save button** that updates the file instantly
5. **Status indicators** showing which files need attention

### What Happens Behind the Scenes

1. **HTMX sends requests** to load content without page refresh
2. **Server reads files** and converts markdown to HTML cards
3. **Database tracks** what you've viewed and edited
4. **File watcher updates** the interface when files change
5. **AI processes** new files automatically in the background

---

## 🧩 Extending the System

### Adding New File Types

```javascript
// In src/utils/markdown.js
function parseFileContent(content, fileType) {
  switch(fileType) {
    case '.md':
      return parseMarkdown(content);
    case '.txt':
      return parsePlainText(content);
    case '.json':
      return parseJSON(content);
    // Add your own types here!
  }
}
```

### Custom AI Providers

```javascript
// In src/services/aiProvider.js
case 'your_custom_ai':
  this.client = new YourCustomAI({
    apiKey: process.env.YOUR_API_KEY,
    baseURL: 'https://your-ai-service.com/api'
  });
  break;
```

### New API Endpoints

```javascript
// In src/api/custom.js
router.get('/api/your-endpoint', async (req, res) => {
  // Your custom logic here
  res.json({ success: true, data: yourData });
});
```

---

## 🚨 Error Handling & Recovery

### Graceful Failures

```javascript
try {
  const result = await aiProvider.classifyFile(frontMatter, content, categories);
} catch (error) {
  console.error('AI classification failed:', error.message);
  // Fall back to default classification
  return { category: 'default', reasoning: 'AI service unavailable' };
}
```

### File System Issues

```javascript
try {
  await fs.readFile(filePath, 'utf8');
} catch (error) {
  if (error.code === 'ENOENT') {
    // File was deleted, remove from database
    await database.deleteFile(fileId);
  }
}
```

### Database Recovery

```javascript
// If database is corrupted, recreate it
if (!this.db.data) {
  this.db.data = { files: [], settings: {} };
  await this.db.write();
}
```

---

## 🎯 Summary

This File Watcher Dashboard is essentially:

1. **A smart folder monitor** that notices when you add/change files
2. **An AI assistant** that reads and categorizes your content
3. **A simple database** that remembers everything
4. **A beautiful web interface** that makes it easy to browse and edit
5. **A flexible system** you can customize for your workflow

The magic is in how these pieces work together seamlessly - you just save files naturally, and the system organizes and presents them beautifully without any extra effort from you!

**🔑 Key Insight:** The program bridges the gap between your file system (folders and files) and a rich, organized, searchable interface. It's like having a personal librarian that automatically catalogs and organizes everything you write! 