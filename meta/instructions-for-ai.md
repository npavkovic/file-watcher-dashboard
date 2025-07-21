# Instructions for AI Assistants - File Watcher Dashboard

## 🚀 Quick Start
1. **Read `meta/README.md`** - Project overview and navigation
2. **Read `meta/logs/latest-handoff.md`** - Where we left off (if exists)
3. **Read `meta/todo.md`** - Current priorities and tasks
4. **Read `meta/context.md`** - Project purpose and architecture
5. **Check `requirements/tasks.md`** - Implementation task list

## 🎯 Project Purpose
The File Watcher Dashboard is an AI-enhanced file monitoring system that implements the INTAKE_FOLDER_HANDLING_SPEC.md specification. It watches configured directories, automatically classifies files using AI, and provides a web-based dashboard for browsing, searching, and managing files with intelligent metadata.

## 💬 Communication Style
- **Conservative approach**: Ask before implementing major changes
- **Implementation focus**: Follow tasks.md order systematically
- **Clear documentation**: Document decisions and implementation details
- **Progress tracking**: Update todo.md as tasks are completed
- **Test-driven**: Implement tests alongside features

## 🏗️ Development Workflow

### Starting Work
1. Check `requirements/tasks.md` for next implementation task
2. Review relevant specifications in `requirements/`
3. Check latest handoff for any ongoing work
4. Understand current implementation state
5. Plan approach before coding

### During Development
- Follow Node.js 20 LTS best practices
- Use Express patterns consistently
- Implement according to specifications
- Write clean, maintainable code
- Add appropriate error handling
- Update documentation as you code

### Ending Sessions
- Create handoff document for substantial work
- Update todo.md with progress
- Commit working code (don't push unless requested)
- Document any blockers or decisions
- Leave clear next steps

## 📁 Project Structure
```
file-watcher-dashboard/
├── src/                      # Source code (to be created)
│   ├── watcher/             # File watching service
│   ├── api/                 # Express API routes
│   ├── web/                 # Frontend assets
│   └── db/                  # Database layer
├── requirements/            # Specifications
│   ├── architecture.md      # System design
│   ├── tasks.md            # Implementation tasks
│   └── ui-wireframe.md     # UI specifications
├── meta/                    # Project management
│   ├── filing-rules.yaml   # AI classification rules
│   ├── intake/             # File drop zone
│   └── logs/               # Session handoffs
└── watcher.paths.json      # Directories to watch
```

## 🔧 Technical Guidelines

### Code Standards
- **Language**: Node.js 20 LTS (use modern JavaScript features)
- **Framework**: Express 4.x with middleware patterns
- **Database**: LowDB 3.x for JSON-based storage
- **File Watching**: Chokidar 3.x for cross-platform support
- **Frontend**: HTMX 1.9 for dynamic UI without complexity
- **Testing**: Jest for unit tests (when implemented)

### Key Commands
```bash
# Development
npm run dev                  # Start watcher + server
npm run watcher             # File watcher only
npm run server              # Web server only

# Testing (to be implemented)
npm test                    # Run test suite
npm run test:watch          # Watch mode

# Code Quality (to be implemented)
npm run lint                # ESLint
npm run format              # Prettier
```

### Environment Setup
- Copy `watcher.paths.sample.json` to `watcher.paths.json`
- Configure directories to watch
- Set `OPENAI_API_KEY` for AI features
- Database created automatically on first run

## 📋 Project-Specific Guidelines

### File Watcher Implementation
- Use Chokidar for cross-platform compatibility
- Implement debouncing for rapid file changes
- Handle file system permissions gracefully
- Queue processing for AI classification
- Maintain file metadata in LowDB

### AI Classification System
- Follow INTAKE_FOLDER_HANDLING_SPEC.md exactly
- Use gpt-4o-mini for cost-effective classification
- Implement rate limiting (40 requests/minute)
- Handle API errors with fallback to manual filing
- Cache classification results when possible

### Web Dashboard
- Server-side rendering with Express + EJS
- HTMX for dynamic updates without full reloads
- SimpleMDE for Markdown editing
- Responsive design with plain CSS
- Search and filter functionality

### Database Schema
```javascript
{
  files: [
    {
      id: "sha1-hash",
      path: "relative/path/to/file.md",
      title: "Document Title",
      category: "feature_brief",
      status: "Draft",
      needsAttention: true,
      created: "ISO-8601",
      lastUpdated: "ISO-8601",
      summary: "AI-generated summary",
      tags: ["tag1", "tag2"]
    }
  ]
}
```

## 🚨 Important Warnings
- Never expose file system outside configured paths
- Validate all user input for security
- Rate limit AI API calls to control costs
- Handle file permissions errors gracefully
- Don't store sensitive data in JSON database

## 🔗 External Dependencies
- **OpenAI API**: For file classification and summaries
- **File System**: Read/write permissions required
- **Network**: For AI API calls and web server

## 📚 Key Documentation
- `INTAKE_FOLDER_HANDLING_SPEC.md` - Core specification
- `requirements/architecture.md` - System architecture
- `requirements/tasks.md` - Implementation roadmap
- `requirements/ui-wireframe.md` - UI design specs

## 🤝 Working Preferences
- Implement tasks in order from tasks.md
- Ask before deviating from specifications
- Test each component before moving on
- Keep the UI simple and functional
- Focus on core features before enhancements

## 🏷️ Task Management
- Follow tasks.md for implementation order
- Update todo.md with progress
- Use tags: @watcher, @api, @ui, @ai-integration
- Mark tasks: [ ] todo, [x] done, [~] in progress

## 🔄 Integration Points
- Implements intake spec from **goalminder** repository
- Uses filing patterns consistent with other repos
- Provides dashboard for cross-repo file management
- Follows unified meta structure standards

## 📊 Performance Considerations
- Debounce file events (300ms minimum)
- Batch database writes for efficiency
- Limit concurrent AI API calls
- Implement pagination for large directories
- Cache AI responses when appropriate

## 🧪 Testing Strategy
- Unit tests for core functionality
- Integration tests for API endpoints
- Mock file system for watcher tests
- Mock AI API for classification tests
- Manual testing for UI components

---

## Version History
- 2025-07-20: Initial creation with comprehensive guidelines
- [Track major updates to these instructions]