const express = require('express');
const path = require('path');
const Database = require('./database');
const FileIngest = require('./watcher/ingest');
const FilingRulesManager = require('./watcher/filingRules');

// Import API routes
const filesRouter = require('./api/files');
const intakeRouter = require('./api/intake');
const pathsRouter = require('./api/paths');
const fragmentsRouter = require('./api/fragments');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.database = null;
    this.fileIngest = null;
    this.filingRules = null;
  }

  async initialize() {
    // Initialize database
    this.database = new Database();
    await this.database.init();

    // Initialize filing rules
    this.filingRules = new FilingRulesManager();
    await this.filingRules.loadRules();

    // Initialize file watcher
    this.fileIngest = new FileIngest();
    
    // Make services available to routes
    this.app.locals.database = this.database;
    this.app.locals.fileIngest = this.fileIngest;
    this.app.locals.filingRules = this.filingRules;

    // Setup middleware
    this.setupMiddleware();

    // Setup routes
    this.setupRoutes();

    // Start file watcher (with error handling)
    try {
      await this.fileIngest.startWatching();
    } catch (error) {
      console.warn('File watcher failed to start:', error.message);
      console.log('Continuing without file watcher - you can add paths via the web interface');
    }

    console.log('Server initialized successfully');
  }

  setupMiddleware() {
    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Serve static files from src/web
    this.app.use(express.static(path.join(__dirname, 'web')));
  }

  setupRoutes() {
    // JSON API routes
    this.app.use('/api', filesRouter);
    this.app.use('/api', intakeRouter);
    this.app.use('/api', pathsRouter);
    
    // HTML fragment routes (separate from JSON APIs)
    this.app.use('/api', fragmentsRouter);

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Serve the main app for all non-API routes
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'web', 'index.html'));
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('Server error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });
  }

  async start() {
    await this.initialize();
    
    this.server = this.app.listen(this.port, () => {
      console.log(`File Watcher Dashboard running on http://localhost:${this.port}`);
      console.log('API endpoints available:');
      console.log('  GET  /api/files');
      console.log('  GET  /api/file/:id');
      console.log('  PUT  /api/file/:id');
      console.log('  POST /api/new');
      console.log('  GET  /api/intake');
      console.log('  POST /api/intake/:id/accept');
      console.log('  POST /api/intake/:id/archive');
      console.log('  GET  /api/paths');
      console.log('  POST /api/paths');
      console.log('  DELETE /api/paths');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());

    return this.server;
  }

  async shutdown() {
    console.log('Shutting down server...');
    
    if (this.fileIngest) {
      await this.fileIngest.stopWatching();
    }
    
    if (this.server) {
      this.server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(0);
      });
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = Server; 