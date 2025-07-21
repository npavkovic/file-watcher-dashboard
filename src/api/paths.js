const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const PATHS_CONFIG_FILE = path.join(process.cwd(), 'watcher.paths.json');

// Helper function to read paths config
async function readPathsConfig() {
  try {
    const data = await fs.readFile(PATHS_CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Could not read watcher.paths.json:', error.message);
    return [];
  }
}

// Helper function to write paths config
async function writePathsConfig(paths) {
  const uniquePaths = [...new Set(paths)]; // Remove duplicates
  await fs.writeFile(PATHS_CONFIG_FILE, JSON.stringify(uniquePaths, null, 2), 'utf8');
  return uniquePaths;
}

// GET /api/paths - Get current watched paths
router.get('/paths', async (req, res) => {
  try {
    const paths = await readPathsConfig();
    
    res.json({
      success: true,
      paths: paths,
      count: paths.length
    });
  } catch (error) {
    console.error('Error reading paths:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read watched paths'
    });
  }
});

// POST /api/paths - Add new watched path
router.post('/paths', async (req, res) => {
  try {
    const { path: newPath } = req.body;
    
    if (!newPath) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }
    
    // Validate that path is absolute
    if (!path.isAbsolute(newPath)) {
      return res.status(400).json({
        success: false,
        error: 'Path must be absolute'
      });
    }
    
    // Check if path exists
    try {
      const stats = await fs.stat(newPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({
          success: false,
          error: 'Path must be a directory'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Path does not exist or is not accessible'
      });
    }
    
    const currentPaths = await readPathsConfig();
    
    // Check if path already exists
    if (currentPaths.includes(newPath)) {
      return res.status(400).json({
        success: false,
        error: 'Path is already being watched'
      });
    }
    
    // Add new path
    const updatedPaths = [...currentPaths, newPath];
    await writePathsConfig(updatedPaths);
    
    // Restart watcher
    const fileIngest = req.app.locals.fileIngest;
    if (fileIngest) {
      // Debounce restart to avoid multiple restarts
      clearTimeout(req.app.locals.restartTimeout);
      req.app.locals.restartTimeout = setTimeout(async () => {
        try {
          await fileIngest.restart();
          console.log('File watcher restarted after path addition');
        } catch (error) {
          console.error('Error restarting file watcher:', error);
        }
      }, 500);
    }
    
    res.json({
      success: true,
      paths: updatedPaths,
      message: `Added path: ${newPath}`
    });
  } catch (error) {
    console.error('Error adding path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add path'
    });
  }
});

// DELETE /api/paths - Remove watched path
router.delete('/paths', async (req, res) => {
  try {
    const { path: removePath } = req.body;
    
    if (!removePath) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }
    
    const currentPaths = await readPathsConfig();
    
    // Check if path exists in config
    if (!currentPaths.includes(removePath)) {
      return res.status(400).json({
        success: false,
        error: 'Path is not currently being watched'
      });
    }
    
    // Remove path
    const updatedPaths = currentPaths.filter(p => p !== removePath);
    await writePathsConfig(updatedPaths);
    
    // Restart watcher
    const fileIngest = req.app.locals.fileIngest;
    if (fileIngest) {
      // Debounce restart to avoid multiple restarts
      clearTimeout(req.app.locals.restartTimeout);
      req.app.locals.restartTimeout = setTimeout(async () => {
        try {
          await fileIngest.restart();
          console.log('File watcher restarted after path removal');
        } catch (error) {
          console.error('Error restarting file watcher:', error);
        }
      }, 500);
    }
    
    res.json({
      success: true,
      paths: updatedPaths,
      message: `Removed path: ${removePath}`
    });
  } catch (error) {
    console.error('Error removing path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove path'
    });
  }
});

module.exports = router; 