# File Watcher Dashboard - Meta Directory

## Quick Start for AI Sessions
1. **First time here?** Read this entire README
2. **Returning to work?** Check `logs/latest-handoff.md` for session continuity
3. **Need current tasks?** See `todo.md` for priorities and next steps
4. **Want big picture?** Read `context.md` for project overview

## Project Overview
The File Watcher Dashboard is an AI-enhanced file monitoring system that automatically watches directories, generates AI-powered summaries and tags, and provides a web UI for browsing and managing files. This project implements the INTAKE_FOLDER_HANDLING_SPEC.md specification for intelligent file classification and filing.

## Key Files and Navigation

### Essential Context
- **`instructions-for-ai.md`** - Comprehensive AI collaboration guidelines
- **`context.md`** - Project purpose, architecture, and strategic priorities
- **`todo.md`** - Current tasks with implementation priorities
- **`filing-rules.yaml`** - AI classification configuration for intake processing
- **`logs/latest-handoff.md`** - Most recent session summary

### Project Structure
- **`requirements/`** - Detailed specifications and task list
- **`intake/`** - Drop zone for files to be auto-classified
- **`templates/`** - Reusable templates for handoffs and documentation
- **`logs/`** - Session handoffs and work history

## Current Status
**Phase:** Implementation Ready
**Priority:** Core file watcher and web dashboard development
**Specification:** Following INTAKE_FOLDER_HANDLING_SPEC.md

## Technical Stack
- **Backend:** Node.js 20 LTS, Express 4.x
- **Database:** LowDB 3.x (JSON-based)
- **File Watching:** Chokidar 3.x
- **Frontend:** HTMX 1.9, SimpleMDE (Markdown editor)
- **AI Integration:** OpenAI API (gpt-4o-mini)

## Key Features
- Real-time file system monitoring
- AI-powered file classification and tagging
- Web-based dashboard for file browsing
- Inline Markdown editing
- Automatic intake processing with intelligent filing
- Metadata management and search capabilities

## Cross-Repository Integration
This project is part of the broader development ecosystem:
- Implements intake specification from **goalminder**
- Supports filing patterns used across all repositories
- Provides dashboard for managing intake across projects

## Getting Started
1. Read `instructions-for-ai.md` for complete development guidelines
2. Check `requirements/tasks.md` for implementation order
3. Review `filing-rules.yaml` for classification configuration
4. Configure `watcher.paths.json` for directories to monitor

---

*This meta directory follows the unified meta structure standard. For questions about this organization, see the templates directory.*