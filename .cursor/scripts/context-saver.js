/**
 * Context Saver Script
 * 
 * This script saves the current working context (open files, recent searches, etc.)
 * to a named profile.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const VECTOR_EMBEDDINGS_PATH = path.resolve(__dirname, '../../context/vector-embeddings.json');

/**
 * Get currently open files in Cursor
 * @returns {string[]} Array of file paths
 */
function getOpenFiles() {
  try {
    // This is a placeholder - in a real implementation,
    // you would use Cursor API to get open files
    // For now, we'll return an empty array
    return [];
  } catch (error) {
    console.error(`Error getting open files: ${error.message}`);
    return [];
  }
}

/**
 * Save current context to a profile
 * @param {string} profileName - The name of the profile to save
 * @param {string} description - Optional description of the context
 */
async function saveContext(profileName, description) {
  try {
    // Read the vector embeddings file
    const vectorEmbeddingsJson = fs.readFileSync(VECTOR_EMBEDDINGS_PATH, 'utf-8');
    const vectorEmbeddings = JSON.parse(vectorEmbeddingsJson);
    
    // Get open files
    const openFiles = getOpenFiles();
    
    // Create or update the context profile
    const existingContext = vectorEmbeddings.contexts[profileName] || {};
    const updatedContext = {
      name: profileName,
      description: description || existingContext.description || `Context for ${profileName}`,
      files: openFiles.length > 0 ? openFiles : existingContext.files || [],
      concepts: existingContext.concepts || []
    };
    
    // Update the vector embeddings file
    vectorEmbeddings.contexts[profileName] = updatedContext;
    fs.writeFileSync(VECTOR_EMBEDDINGS_PATH, JSON.stringify(vectorEmbeddings, null, 2));
    
    console.log(`Context "${profileName}" saved successfully!`);
    console.log(`Description: ${updatedContext.description}`);
    console.log(`Files: ${updatedContext.files.length}`);
    console.log(`Concepts: ${updatedContext.concepts.length}`);
  } catch (error) {
    console.error(`Error saving context: ${error.message}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Missing profile name');
  console.log('Usage: node context-saver.js <profile-name> [description]');
  process.exit(1);
}

const profileName = args[0];
const description = args[1] || undefined;
saveContext(profileName, description); 