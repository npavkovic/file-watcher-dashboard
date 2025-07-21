# File Watcher Dashboard - Project Context

## Project Purpose
The File Watcher Dashboard is a critical infrastructure component that implements the INTAKE_FOLDER_HANDLING_SPEC.md specification across the entire repository ecosystem. It provides automated file monitoring, AI-powered classification, and a unified web dashboard for managing files across multiple projects.

## Strategic Overview

### Core Value Proposition
- **Automated Organization**: Eliminates manual file filing with AI classification
- **Cross-Repo Visibility**: Single dashboard for all monitored directories
- **Intelligent Metadata**: AI-generated summaries and tags for discovery
- **Workflow Automation**: Implements intake processing across all projects

### Target Users
- **Primary**: Nicholas (solo developer managing multiple projects)
- **Secondary**: Future collaborators needing file organization
- **Use Cases**: 
  - Dropping files into intake folders for auto-classification
  - Browsing and searching across all project files
  - Editing Markdown files directly in the browser
  - Monitoring file changes across repositories

## Technical Architecture

### System Components
1. **File Watcher Service**
   - Monitors configured directories using Chokidar
   - Detects file changes in real-time
   - Queues files for AI processing
   - Handles file system events gracefully

2. **AI Classification Engine**
   - Implements INTAKE_FOLDER_HANDLING_SPEC.md
   - Uses gpt-4o-mini for cost-effective classification
   - Applies repo-specific filing rules
   - Enhances files with metadata

3. **Web Dashboard**
   - Express server with HTMX frontend
   - Real-time updates via server-sent events
   - SimpleMDE for inline Markdown editing
   - Search and filter capabilities

4. **Data Layer**
   - LowDB for lightweight JSON storage
   - File metadata and classification results
   - Search indices and tag relationships
   - Processing queue management

### Key Design Decisions
- **Node.js 20 LTS**: Modern JavaScript with native features
- **Express + HTMX**: Simple, server-rendered UI with dynamic updates
- **LowDB**: No database setup required, perfect for single-user
- **Chokidar**: Cross-platform file watching that works reliably
- **gpt-4o-mini**: Optimal balance of cost and classification accuracy

## Current Status

### Implementation Phase
- **Status**: Ready for implementation
- **Specifications**: Complete in requirements/
- **Tasks**: Defined in requirements/tasks.md
- **Priority**: Core functionality first, then enhancements

### Integration Status
- **Intake Spec**: Ready to implement from goalminder
- **Filing Rules**: Basic structure exists, needs enhancement
- **Meta Structure**: Now fully compliant with unified standard

## Development Priorities

### Phase 1: Core Infrastructure (Tasks 1-3)
- Project setup and dependencies
- Basic file watcher implementation
- Database layer with LowDB

### Phase 2: Web Dashboard (Tasks 4-5)
- Express server setup
- Basic UI with file listing
- HTMX integration for updates

### Phase 3: AI Integration (Tasks 6-7)
- Intake folder processing
- AI classification implementation
- Metadata enhancement

### Phase 4: Enhanced Features (Tasks 8-10)
- Markdown editing
- Search functionality
- Tag management

### Phase 5: Polish (Tasks 11-12)
- Error handling
- Performance optimization
- Production readiness

## Success Metrics

### Technical Success
- Files classified with >90% accuracy
- Processing time <5 seconds per file
- Dashboard loads in <1 second
- Zero data loss during processing

### User Success
- Reduced time filing documents by 95%
- Instant file discovery via search
- Seamless cross-repo navigation
- Clear visibility of all project files

## Risk Mitigation

### Technical Risks
- **File System Permissions**: Graceful handling of access errors
- **API Rate Limits**: Queue management and retry logic
- **Large Directories**: Pagination and lazy loading
- **Concurrent Access**: File locking during processing

### Operational Risks
- **Classification Errors**: Manual override capability
- **Cost Control**: Rate limiting and budget alerts
- **Data Loss**: Backup original files before processing
- **System Load**: Resource usage monitoring

## Future Enhancements

### Near Term
- WebSocket support for real-time updates
- Bulk operations for file management
- Custom classification rules per directory
- Export capabilities for reports

### Long Term
- Multi-user support with permissions
- Cloud storage integration
- Advanced AI features (content analysis)
- Mobile-responsive dashboard

## Cross-Repository Impact

This dashboard serves as the operational hub for:
- **goalminder**: Central coordination and intake
- **hurtle-docs**: Documentation organization
- **agentic-council**: Agent configuration management
- **editorialworkflow**: Content pipeline monitoring
- **All repos**: Unified file discovery and management

---

*This context document provides the strategic foundation for the File Watcher Dashboard development. For implementation details, see instructions-for-ai.md and requirements/tasks.md.*