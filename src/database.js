const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), 'data', 'files.json');
  }

  async init() {
    // Ensure data directory exists
    const fs = require('fs').promises;
    const dataDir = path.dirname(this.dbPath);
    
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Initialize database
    const adapter = new JSONFile(this.dbPath);
    this.db = new Low(adapter, { files: [], settings: {} });

    // Read the database
    await this.db.read();

    // Set defaults if database is empty
    if (!this.db.data) {
      this.db.data = { files: [], settings: {} };
      await this.db.write();
    }

    console.log('Database initialized:', this.dbPath);
    return this.db;
  }

  async ensureInitialized() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  async getAllFiles(filters = {}) {
    await this.ensureInitialized();
    
    let files = this.db.data.files || [];
    
    // Apply filters
    if (filters.tag) {
      files = files.filter(file => 
        file.tags && file.tags.includes(filters.tag)
      );
    }
    
    if (filters.status) {
      files = files.filter(file => 
        file.frontMatter && file.frontMatter.status === filters.status
      );
    }
    
    if (filters.folder) {
      files = files.filter(file => 
        file.relativePath && file.relativePath.startsWith(filters.folder)
      );
    }

    return files;
  }

  async getFileById(id) {
    await this.ensureInitialized();
    
    const files = this.db.data.files || [];
    return files.find(file => file.id === id);
  }

  async upsertFile(fileData) {
    await this.ensureInitialized();
    
    const files = this.db.data.files || [];
    const existingIndex = files.findIndex(file => file.id === fileData.id);
    
    if (existingIndex >= 0) {
      // Update existing file
      files[existingIndex] = { ...files[existingIndex], ...fileData, updatedAt: new Date().toISOString() };
    } else {
      // Add new file
      const newFile = {
        ...fileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      files.push(newFile);
    }
    
    this.db.data.files = files;
    await this.db.write();
    
    return this.getFileById(fileData.id);
  }

  async deleteFile(id) {
    await this.ensureInitialized();
    
    const files = this.db.data.files || [];
    const initialLength = files.length;
    
    this.db.data.files = files.filter(file => file.id !== id);
    await this.db.write();
    
    return files.length < initialLength;
  }

  async getIntakeFiles() {
    await this.ensureInitialized();
    
    const files = this.db.data.files || [];
    return files.filter(file => 
      file.needsAttention || 
      (file.frontMatter && file.frontMatter.status === 'Needs-Triage')
    );
  }

  async updateFilesPath(oldPath, newPath) {
    await this.ensureInitialized();
    
    const files = this.db.data.files || [];
    let updatedCount = 0;
    
    files.forEach(file => {
      if (file.fullPath && file.fullPath.startsWith(oldPath)) {
        file.fullPath = file.fullPath.replace(oldPath, newPath);
        file.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await this.db.write();
    }
    
    return updatedCount;
  }

  async getSettings() {
    await this.ensureInitialized();
    return this.db.data.settings || {};
  }

  async updateSettings(settings) {
    await this.ensureInitialized();
    
    this.db.data.settings = { ...this.db.data.settings, ...settings };
    await this.db.write();
    
    return this.db.data.settings;
  }
}

module.exports = Database; 