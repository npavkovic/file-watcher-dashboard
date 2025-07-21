const yaml = require('js-yaml');
const fs = require('fs').promises;
const path = require('path');

class FilingRulesManager {
  constructor() {
    this.rules = null;
    this.rulesPath = path.join(process.cwd(), 'meta', 'filing-rules.yaml');
  }

  async loadRules() {
    try {
      const rulesData = await fs.readFile(this.rulesPath, 'utf8');
      this.rules = yaml.load(rulesData);
      console.log('Filing rules loaded successfully');
      return this.rules;
    } catch (error) {
      console.warn('Could not load filing rules from meta/filing-rules.yaml:', error.message);
      // Return default rules structure
      this.rules = {
        classification: {
          model: "gpt-4o-mini",
          system_prompt: "You are a filing assistant. Choose ONE category id.",
          categories: {}
        },
        intake_defaults: {
          destination: "meta/todo/",
          front_matter_overrides: {
            status: "Needs-Triage"
          }
        }
      };
      return this.rules;
    }
  }

  async ensureRulesLoaded() {
    if (!this.rules) {
      await this.loadRules();
    }
    return this.rules;
  }

  /**
   * Classify a file based on its front matter and body preview
   * Currently returns default category - will be enhanced with AI later
   * @param {Object} frontMatter - Parsed YAML front matter
   * @param {string} bodyPreview - First few lines of content
   * @returns {Object} Classification result with category and destination
   */
  async classifyFile(frontMatter = {}, bodyPreview = '') {
    await this.ensureRulesLoaded();

    // For now, return the default intake classification
    // This is a stub that will be enhanced with OpenAI integration later
    const defaultCategory = {
      id: 'default',
      name: 'Default',
      description: 'Default category for unclassified files',
      destination: this.rules.intake_defaults.destination,
      front_matter_overrides: this.rules.intake_defaults.front_matter_overrides
    };

    console.log('Classifying file (stub implementation):', {
      frontMatter: Object.keys(frontMatter),
      bodyPreviewLength: bodyPreview.length,
      assignedCategory: defaultCategory.id
    });

    return {
      category: defaultCategory,
      confidence: 0.5, // Placeholder confidence
      reasoning: 'Using default classification (stub implementation)'
    };
  }

  /**
   * Get available categories for manual classification
   * @returns {Object} Available categories
   */
  getCategories() {
    if (!this.rules) {
      return {};
    }
    return this.rules.classification.categories || {};
  }

  /**
   * Get intake defaults
   * @returns {Object} Default settings for intake files
   */
  getIntakeDefaults() {
    if (!this.rules) {
      return {
        destination: "meta/todo/",
        front_matter_overrides: {
          status: "Needs-Triage"
        }
      };
    }
    return this.rules.intake_defaults;
  }

  /**
   * Update a file's destination based on category
   * @param {string} categoryId - Category identifier
   * @returns {Object|null} Category configuration or null if not found
   */
  getCategoryById(categoryId) {
    const categories = this.getCategories();
    return categories[categoryId] || null;
  }
}

module.exports = FilingRulesManager; 