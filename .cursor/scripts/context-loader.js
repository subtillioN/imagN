/**
 * Context Loader Script
 * 
 * This script loads a named context profile, opening the relevant files
 * and setting up the environment for AI assistance focused on the context.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Constants
const VECTOR_EMBEDDINGS_PATH = path.resolve(__dirname, '../../context/vector-embeddings.json');
const CURRENT_CONTEXT_PATH = path.resolve(__dirname, '../.current-context.json');

/**
 * Load a named context profile
 * @param {string} profileName - The name of the profile to load
 */
async function loadContext(profileName) {
  try {
    // Read the vector embeddings file
    const vectorEmbeddingsJson = fs.readFileSync(VECTOR_EMBEDDINGS_PATH, 'utf-8');
    const vectorEmbeddings = JSON.parse(vectorEmbeddingsJson);
    
    // Check if the profile exists
    if (!vectorEmbeddings.contexts[profileName]) {
      console.error(`Error: Context profile "${profileName}" not found`);
      return;
    }
    
    const context = vectorEmbeddings.contexts[profileName];
    console.log(`Loading context: ${context.name} - ${context.description}`);
    
    // Save the current context
    const currentContext = {
      profileName,
      loadedAt: new Date().toISOString(),
      context
    };
    fs.writeFileSync(CURRENT_CONTEXT_PATH, JSON.stringify(currentContext, null, 2));
    
    // Open files related to the context
    const filesToOpen = context.files || [];
    for (const file of filesToOpen) {
      const filePath = path.resolve(__dirname, '../../', file);
      if (fs.existsSync(filePath)) {
        // Execute cursor command to open the file
        exec(`cursor ${filePath}`, (error) => {
          if (error) {
            console.error(`Error opening ${filePath}: ${error.message}`);
          }
        });
      } else {
        console.warn(`Warning: File ${filePath} does not exist`);
      }
    }
    
    // Output concepts for AI to consider
    const conceptNames = context.concepts || [];
    const concepts = conceptNames.map(name => vectorEmbeddings.concepts[name]);
    
    console.log('\nContext Concepts:');
    concepts.forEach(concept => {
      console.log(`- ${concept.description}: ${concept.summary}`);
    });
    
    console.log('\nContext successfully loaded!');
  } catch (error) {
    console.error(`Error loading context: ${error.message}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Missing profile name');
  console.log('Usage: node context-loader.js <profile-name>');
  process.exit(1);
}

const profileName = args[0];
loadContext(profileName); 