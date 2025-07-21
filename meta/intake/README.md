# Intake Folder - file-watcher-dashboard

## Purpose
This directory serves as a drop-zone for new content related to the file watcher dashboard development and general file management. Files placed here will be automatically classified and filed by the intake processing system that this project implements.

## How It Works
1. **Drop files here** - Place any new Markdown files in this directory
2. **Automatic classification** - The system analyzes content using AI (gpt-4o-mini)
3. **Smart filing** - Files are moved to appropriate directories based on content type
4. **Front-matter enhancement** - Required metadata is automatically added

## Classification Categories
Files will be classified into these general-purpose categories:
- **Feature Brief** → `meta/specs/feature-briefs/` (product ideas, feature proposals)
- **Technical Specification** → `meta/specs/technical/` (detailed implementation plans)
- **Bug Report** → `meta/issues/` (bug descriptions, error reports)
- **Research Document** → `meta/research/` (analysis, investigations, findings)
- **Documentation** → `meta/docs/` (user guides, API docs, how-to guides)
- **Test File** → `meta/tests/` (test cases, QA documents)
- **Configuration** → `meta/config/` (settings, environment specs)
- **Blog Idea** → `meta/blog-ideas/` (content proposals, article drafts)
- **Meeting Notes** → `meta/meetings/` (discussion summaries, decisions)
- **Todo Item** → `meta/todo/` (task lists, action items)

## Configuration
See `meta/filing-rules.yaml` for detailed classification rules and destinations.

## Specification
This intake system follows the **INTAKE_FOLDER_HANDLING_SPEC.md** specification. This dashboard project is the reference implementation of that specification.

## Testing the System
Since this project implements the intake system itself, you can use this folder to test:
1. Drop sample files here with different content types
2. Verify classification accuracy
3. Check file movement and metadata enhancement
4. Test error handling with ambiguous content

## Manual Override
If automatic classification fails or is incorrect, files will be placed in `meta/todo/` for manual review and assignment.

---
*This folder is monitored by the automatic filing system. As the reference implementation, this project both uses and implements the intake processing specification.*