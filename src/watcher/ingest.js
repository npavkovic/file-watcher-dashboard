const chokidar = require('chokidar');
const fs = require('fs').promises;
const path = require('path');

class FileIngest {
  constructor() {
    this.watcher = null;
    this.watchedPaths = [];
  }

  async loadWatchedPaths() {
    try {
      const configPath = path.join(process.cwd(), 'watcher.paths.json');
      const data = await fs.readFile(configPath, 'utf8');
      this.watchedPaths = JSON.parse(data);
      return this.watchedPaths;
    } catch (error) {
      console.warn('Could not load watcher.paths.json, using empty array:', error.message);
      this.watchedPaths = [];
      return this.watchedPaths;
    }
  }

  async startWatching() {
    await this.loadWatchedPaths();
    
    if (this.watchedPaths.length === 0) {
      console.log('No paths to watch. Add paths to watcher.paths.json');
      return;
    }

    // Close existing watcher if any
    if (this.watcher) {
      await this.watcher.close();
    }

    console.log('Starting file watcher for paths:', this.watchedPaths);

    this.watcher = chokidar.watch(this.watchedPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: false,
      followSymlinks: false,
      cwd: '.',
      depth: undefined,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    // Event handlers
    this.watcher
      .on('add', (filepath) => this.handleFileAdd(filepath))
      .on('change', (filepath) => this.handleFileChange(filepath))
      .on('unlink', (filepath) => this.handleFileUnlink(filepath))
      .on('addDir', (dirpath) => this.handleDirAdd(dirpath))
      .on('unlinkDir', (dirpath) => this.handleDirUnlink(dirpath))
      .on('error', (error) => console.error('Watcher error:', error))
      .on('ready', () => console.log('Initial scan complete. Ready for changes'));

    return this.watcher;
  }

  async stopWatching() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      console.log('File watcher stopped');
    }
  }

  async restart() {
    console.log('Restarting file watcher...');
    await this.stopWatching();
    await this.startWatching();
  }

  // Stub functions to be implemented later
  async handleFileAdd(filepath) {
    console.log('File added:', filepath);
    // TODO: Classify file, move if needed, update database
  }

  async handleFileChange(filepath) {
    console.log('File changed:', filepath);
    // TODO: Re-process file, update database
  }

  async handleFileUnlink(filepath) {
    console.log('File removed:', filepath);
    // TODO: Remove from database, cleanup
  }

  async handleDirAdd(dirpath) {
    console.log('Directory added:', dirpath);
    // TODO: Process directory structure
  }

  async handleDirUnlink(dirpath) {
    console.log('Directory removed:', dirpath);
    // TODO: Cleanup database entries for directory
  }
}

module.exports = FileIngest; 