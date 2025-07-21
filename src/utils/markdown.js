const crypto = require('crypto');

// Markdown parsing function
function parseMarkdown(content) {
  // Simple front matter parsing
  let frontMatter = {};
  let body = content;
  
  if (content.startsWith('---\n')) {
    const frontMatterEnd = content.indexOf('\n---\n', 4);
    if (frontMatterEnd !== -1) {
      const frontMatterYaml = content.slice(4, frontMatterEnd);
      body = content.slice(frontMatterEnd + 5);
      
      // Basic YAML parsing (could use js-yaml for more complex cases)
      frontMatterYaml.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          frontMatter[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      });
    }
  }
  
  return { frontMatter, body };
}

// Convert markdown to HTML cards
function markdownToCards(content) {
  const lines = content.split('\n');
  const cards = [];
  let currentCard = null;
  
  for (let line of lines) {
    line = line.trim();
    
    // Check for headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      // Save previous card if exists
      if (currentCard) {
        cards.push(currentCard);
      }
      
      // Start new card
      const level = headerMatch[1].length;
      const title = headerMatch[2];
      currentCard = {
        id: crypto.randomUUID(),
        type: 'header',
        level: level,
        title: title,
        content: []
      };
    } else if (line.length > 0) {
      // Add content to current card
      if (!currentCard) {
        currentCard = {
          id: crypto.randomUUID(),
          type: 'content',
          content: []
        };
      }
      currentCard.content.push(line);
    }
  }
  
  // Add final card
  if (currentCard) {
    cards.push(currentCard);
  }
  
  return cards;
}

module.exports = {
  parseMarkdown,
  markdownToCards
}; 