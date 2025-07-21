const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// GET /api/intake - List files that need attention
router.get('/intake', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const intakeFiles = await database.getIntakeFiles();
    
    res.json({
      success: true,
      files: intakeFiles,
      count: intakeFiles.length
    });
  } catch (error) {
    console.error('Error fetching intake files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch intake files'
    });
  }
});

// POST /api/intake/:id/accept - Mark file as triaged/accepted
router.post('/intake/:id/accept', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const file = await database.getFileById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Update the file to mark as triaged
    const updatedFile = await database.upsertFile({
      ...file,
      needsAttention: false,
      frontMatter: {
        ...file.frontMatter,
        status: 'Triaged'
      },
      triagedAt: new Date().toISOString()
    });
    
    // Update the actual file content if it exists
    if (file.fullPath) {
      try {
        const content = await fs.readFile(file.fullPath, 'utf8');
        const updatedContent = content.replace(
          /^status:\s*Needs-Triage$/m,
          'status: Triaged'
        );
        await fs.writeFile(file.fullPath, updatedContent, 'utf8');
      } catch (error) {
        console.warn('Could not update file content:', error.message);
      }
    }
    
    res.json({
      success: true,
      file: updatedFile,
      message: 'File marked as triaged'
    });
  } catch (error) {
    console.error('Error accepting file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept file'
    });
  }
});

// POST /api/intake/:id/archive - Archive file
router.post('/intake/:id/archive', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const file = await database.getFileById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Move file to archive directory
    const archiveDir = path.join(process.cwd(), 'meta', 'archive');
    await fs.mkdir(archiveDir, { recursive: true });
    
    const archivePath = path.join(archiveDir, path.basename(file.fullPath));
    
    try {
      await fs.rename(file.fullPath, archivePath);
    } catch (error) {
      // If rename fails, try copy and delete
      await fs.copyFile(file.fullPath, archivePath);
      await fs.unlink(file.fullPath);
    }
    
    // Update database
    const updatedFile = await database.upsertFile({
      ...file,
      fullPath: archivePath,
      relativePath: path.relative(process.cwd(), archivePath),
      needsAttention: false,
      frontMatter: {
        ...file.frontMatter,
        status: 'Archived'
      },
      archivedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      file: updatedFile,
      message: 'File archived successfully'
    });
  } catch (error) {
    console.error('Error archiving file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive file'
    });
  }
});

// POST /api/intake/:id/classify - Manually classify file
router.post('/intake/:id/classify', async (req, res) => {
  try {
    const database = req.app.locals.database;
    const filingRules = req.app.locals.filingRules;
    const file = await database.getFileById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const { categoryId } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Category ID is required'
      });
    }
    
    const category = filingRules.getCategoryById(categoryId);
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      });
    }
    
    // Move file to category destination
    const destDir = path.join(process.cwd(), category.destination);
    await fs.mkdir(destDir, { recursive: true });
    
    const destPath = path.join(destDir, path.basename(file.fullPath));
    
    try {
      await fs.rename(file.fullPath, destPath);
    } catch (error) {
      // If rename fails, try copy and delete
      await fs.copyFile(file.fullPath, destPath);
      await fs.unlink(file.fullPath);
    }
    
    // Update file content with new front matter
    try {
      const content = await fs.readFile(destPath, 'utf8');
      let updatedContent = content;
      
      // Apply front matter overrides
      if (category.front_matter_overrides) {
        Object.entries(category.front_matter_overrides).forEach(([key, value]) => {
          const regex = new RegExp(`^${key}:\\s*.*$`, 'm');
          if (regex.test(updatedContent)) {
            updatedContent = updatedContent.replace(regex, `${key}: ${value}`);
          } else {
            // Add new front matter field
            updatedContent = updatedContent.replace(
              /^---\n/,
              `---\n${key}: ${value}\n`
            );
          }
        });
      }
      
      await fs.writeFile(destPath, updatedContent, 'utf8');
    } catch (error) {
      console.warn('Could not update file front matter:', error.message);
    }
    
    // Update database
    const updatedFile = await database.upsertFile({
      ...file,
      fullPath: destPath,
      relativePath: path.relative(process.cwd(), destPath),
      needsAttention: false,
      category: categoryId,
      frontMatter: {
        ...file.frontMatter,
        ...category.front_matter_overrides
      },
      classifiedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      file: updatedFile,
      message: `File classified as ${category.name}`
    });
  } catch (error) {
    console.error('Error classifying file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify file'
    });
  }
});

module.exports = router; 