# File Watcher Dashboard - Todo

## 🚨 Current Sprint (Implementation Phase)
Based on requirements/tasks.md - implement in order:

### High Priority - Core Infrastructure
- [ ] **Task 1: Bootstrap project** - npm init, dependencies, .nvmrc #setup @infrastructure
- [ ] **Task 2: File watcher service** - src/watcher/ingest.js with Chokidar #core @watcher
- [ ] **Task 3: Filing rules & classifier** - Load YAML rules, classification stub #core @ai-integration
- [ ] **Task 4: Express server & API** - Basic routes, JSON APIs, static serving #core @api
- [ ] **Task 5: Frontend scaffolding** - HTML structure, CSS, HTMX integration #core @ui

### Medium Priority - Features
- [ ] **Task 6: Markdown editing** - SimpleMDE integration, render/edit modes #feature @ui
- [ ] **Task 7: Watcher paths API** - Dynamic path management, restart capability #feature @api
- [ ] **Task 8: Intake endpoints** - List, accept, archive operations #feature @api @intake

### Low Priority - Polish
- [ ] **Task 9: Sample tests** - Jest setup, basic integration tests #quality @testing
- [ ] **Task 10: Documentation** - Update README, sample config #docs @documentation

## 📋 Intake Processing Implementation
Following INTAKE_FOLDER_HANDLING_SPEC.md:

### Classification System
- [ ] Implement full AI classification with gpt-4o-mini #intake @ai-integration
- [ ] Add rate limiting (40 req/min per repo) #intake @performance
- [ ] Implement retry logic for API failures #intake @reliability
- [ ] Cache classification results #intake @performance

### Filing Enhancement
- [ ] Update filing-rules.yaml with comprehensive categories #intake @configuration
- [ ] Implement front-matter enhancement #intake @metadata
- [ ] Add file movement logic with naming convention #intake @filing
- [ ] Create database records with needsAttention flag #intake @database

## 🔧 Technical Debt & Improvements
- [ ] Add TypeScript support for better type safety #enhancement @typescript
- [ ] Implement WebSocket for real-time updates #enhancement @realtime
- [ ] Add file system permission handling #reliability @filesystem
- [ ] Implement queue for AI processing #performance @scaling

## 📊 Dashboard Enhancements
- [ ] Add search functionality with filters #feature @search
- [ ] Implement tag management UI #feature @tags
- [ ] Add bulk operations support #feature @ui
- [ ] Create activity log view #feature @monitoring

## 🔗 Cross-Repo Integration
- [ ] Test with goalminder filing rules #integration @testing
- [ ] Verify hurtle-docs classification #integration @testing
- [ ] Validate all repo filing patterns #integration @testing
- [ ] Create unified dashboard view #integration @ui

## 🚀 Future Enhancements
- [ ] Multi-user support with auth #future @auth
- [ ] Cloud storage integration #future @storage
- [ ] Advanced AI content analysis #future @ai
- [ ] Mobile-responsive design #future @mobile

## 📝 Notes
- Follow requirements/tasks.md for implementation order
- Update this file as tasks are completed
- Create handoff documents for significant work sessions
- Test each component before moving to next task

## Success Metrics
- [ ] All 10 tasks from requirements completed
- [ ] Intake processing working per specification
- [ ] Dashboard accessible and functional
- [ ] Documentation complete and accurate

---
*Last Updated: 2025-07-20*
*Priority Tags: #core #feature #quality #docs #intake #integration #enhancement #future*
*Component Tags: @infrastructure @watcher @ai-integration @api @ui @testing @documentation*