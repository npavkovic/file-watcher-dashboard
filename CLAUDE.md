# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Assistant Instructions

For comprehensive guidelines and project context, see the meta directory:

- **`meta/README.md`** - Start here for project overview and navigation
- **`meta/instructions-for-ai.md`** - Detailed collaboration guidelines and workflows
- **`meta/context.md`** - Project purpose, status, and strategic overview  
- **`meta/todo.md`** - Current tasks, priorities, and tag system
- **`meta/logs/latest-handoff.md`** - Most recent session summary and continuity

## Quick Development Commands

```bash
# Start development
npm run dev                     # Run watcher and web server

# Run components separately
npm run watcher                 # File watching service only
npm run server                  # Web dashboard only

# Build for production
npm run build                   # Build production version

# Code quality checks
npm run lint                    # Run ESLint
npm test                        # Run test suite
```

## Key Project Information

**Type:** Web application with file system monitoring
**Language:** Node.js 20 LTS
**Framework:** Express + HTMX + LowDB
**Architecture:** File watcher service + web dashboard + AI integration
**Purpose:** AI-enhanced file monitoring and metadata management system

## Important Notes

- This implements the **INTAKE_FOLDER_HANDLING_SPEC.md** specification
- Monitors directories configured in `watcher.paths.json`
- Uses AI (gpt-4o-mini) for intelligent file classification
- Provides web UI for browsing, searching, and editing
- Integrates with the broader meta directory ecosystem

---

*For complete context and detailed guidelines, always check the meta directory first. The meta/instructions-for-ai.md file contains comprehensive information about working with this project.*