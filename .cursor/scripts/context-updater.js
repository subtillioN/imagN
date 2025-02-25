/**
 * Context Updater Script
 * 
 * This script processes new issues from the testing department log,
 * updates appropriate task lists and documentation, and refreshes
 * vector embeddings for the context system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// File paths
const CONTEXT_DIR = path.join(process.cwd(), 'context');
const ISSUES_LOG_PATH = path.join(CONTEXT_DIR, 'new-issues-log.md');
const FEATURES_LOG_PATH = path.join(CONTEXT_DIR, 'new-features-log.md');
const BUGLOG_PATH = path.join(CONTEXT_DIR, 'buglog.md');
const PROGRESS_TRACKING_PATH = path.join(CONTEXT_DIR, 'progress-tracking.md');

// Helpers
function getCurrentTimestamp() {
  return new Date().toISOString().split('T')[0];
}

function getNextBugId(bugLog) {
  // Parse the buglog to find the highest bug ID and increment it
  const bugMatches = bugLog.match(/B\d{3}/g) || [];
  if (bugMatches.length === 0) return 'B001';
  
  const bugNumbers = bugMatches.map(id => parseInt(id.substring(1)));
  const maxBugNumber = Math.max(...bugNumbers);
  return `B${(maxBugNumber + 1).toString().padStart(3, '0')}`;
}

function getNextIssueId(bugLog) {
  // Parse the buglog to find the highest issue ID and increment it
  const issueMatches = bugLog.match(/I\d{3}/g) || [];
  if (issueMatches.length === 0) return 'I001';
  
  const issueNumbers = issueMatches.map(id => parseInt(id.substring(1)));
  const maxIssueNumber = Math.max(...issueNumbers);
  return `I${(maxIssueNumber + 1).toString().padStart(3, '0')}`;
}

function parseIssues(content) {
  const issues = [];
  const lines = content.split('\n');
  
  let currentIssue = null;
  
  for (const line of lines) {
    if (line.startsWith('+ ')) {
      // New issue
      if (currentIssue) {
        issues.push(currentIssue);
      }
      
      currentIssue = {
        description: line.substring(2),
        completed: false,
        details: []
      };
    } else if (line.startsWith('- [ ] ') || line.startsWith('- [-] ')) {
      // Uncompleted task
      if (currentIssue) {
        currentIssue.completed = false;
        issues.push(currentIssue);
        currentIssue = null;
      }
    } else if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
      // Completed task
      if (currentIssue) {
        currentIssue.completed = true;
        issues.push(currentIssue);
        currentIssue = null;
      }
    } else if (line.trim() !== '' && currentIssue) {
      // Additional details for current issue
      currentIssue.details.push(line.trim());
    }
  }
  
  // Add the last issue if it exists
  if (currentIssue) {
    issues.push(currentIssue);
  }
  
  return issues;
}

function parseFeatures(content) {
  const features = [];
  const lines = content.split('\n');
  
  let currentFeature = null;
  
  for (const line of lines) {
    if (line.startsWith('+ ')) {
      // New feature
      if (currentFeature) {
        features.push(currentFeature);
      }
      
      currentFeature = {
        description: line.substring(2),
        completed: false,
        details: []
      };
    } else if (line.startsWith('- [ ] ') || line.startsWith('- [-] ')) {
      // Uncompleted feature
      if (!currentFeature) {
        currentFeature = {
          description: line.startsWith('- [ ] ') ? line.substring(6) : line.substring(6),
          completed: false,
          details: []
        };
        features.push(currentFeature);
        currentFeature = null;
      } else {
        currentFeature.completed = false;
        features.push(currentFeature);
        currentFeature = null;
      }
    } else if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
      // Completed feature
      if (currentFeature) {
        currentFeature.completed = true;
        features.push(currentFeature);
        currentFeature = null;
      }
    } else if (line.trim() !== '' && currentFeature && !line.startsWith('#')) {
      // Additional details for current feature
      currentFeature.details.push(line.trim());
    }
  }
  
  // Add the last feature if it exists
  if (currentFeature) {
    features.push(currentFeature);
  }
  
  return features;
}

function categorizeIssue(issue) {
  const description = issue.description.toLowerCase();
  
  // UI/UX issues
  if (description.includes('ui') || 
      description.includes('button') || 
      description.includes('display') || 
      description.includes('padding') ||
      description.includes('margin') ||
      description.includes('layout') ||
      description.includes('style')) {
    return {
      component: 'UI/UX',
      priority: 'Medium',
      type: 'bug'
    };
  }
  
  // Performance issues
  if (description.includes('slow') || 
      description.includes('performance') || 
      description.includes('lag') ||
      description.includes('freeze')) {
    return {
      component: 'Performance',
      priority: 'High',
      type: 'bug'
    };
  }
  
  // Feature requests or enhancements
  if (description.includes('add') || 
      description.includes('feature') || 
      description.includes('enhance') ||
      description.includes('implement')) {
    return {
      component: determineComponent(description),
      priority: 'Medium',
      type: 'enhancement'
    };
  }
  
  // Default categorization
  return {
    component: determineComponent(description),
    priority: 'Medium',
    type: 'bug'
  };
}

function determineComponent(description) {
  description = description.toLowerCase();
  
  if (description.includes('preset') || description.includes('workflow')) {
    return 'Workflow Presets';
  }
  
  if (description.includes('project') || description.includes('dialog')) {
    return 'Project Management';
  }
  
  if (description.includes('image')) {
    return 'Image Workspace';
  }
  
  if (description.includes('video')) {
    return 'Video Workspace';
  }
  
  if (description.includes('node')) {
    return 'Node Editor';
  }
  
  return 'General';
}

function updateBugLog(issues) {
  let bugLog = fs.readFileSync(BUGLOG_PATH, 'utf8');
  let progressTracking = fs.readFileSync(PROGRESS_TRACKING_PATH, 'utf8');
  
  const updates = {
    bugsAdded: 0,
    issuesAdded: 0,
    tasksAdded: 0
  };
  
  for (const issue of issues) {
    if (issue.completed) continue; // Skip already processed issues
    
    const category = categorizeIssue(issue);
    
    if (category.type === 'bug') {
      // Add to Active Bugs section in buglog.md
      const bugId = getNextBugId(bugLog);
      const newBugEntry = `| ${bugId} | ${issue.description} | ${category.component} | ${category.priority} | Needs Fix | ${getCurrentTimestamp()} |`;
      
      bugLog = bugLog.replace(
        '## Active Bugs\n\n| ID | Description | Component | Priority | Status | Reported Date |',
        '## Active Bugs\n\n| ID | Description | Component | Priority | Status | Reported Date |\n' + newBugEntry
      );
      
      updates.bugsAdded++;
    } else {
      // Add to Issues Under Review section in buglog.md
      const issueId = getNextIssueId(bugLog);
      const newIssueEntry = `| ${issueId} | ${issue.description} | ${category.component} | ${category.priority} | Open | ${getCurrentTimestamp()} |`;
      
      bugLog = bugLog.replace(
        '## Issues Under Review\n\n| ID | Description | Component | Priority | Status | Reported Date |',
        '## Issues Under Review\n\n| ID | Description | Component | Priority | Status | Reported Date |\n' + newIssueEntry
      );
      
      updates.issuesAdded++;
    }
    
    // Add as task to progress-tracking.md if it's an enhancement
    if (category.type === 'enhancement') {
      // Find the appropriate section based on component
      const sectionMarker = `#### ${category.component}`;
      const taskEntry = `- [ ] ${issue.description}`;
      
      if (progressTracking.includes(sectionMarker)) {
        // Add to existing section
        const sectionIndex = progressTracking.indexOf(sectionMarker);
        const nextSectionIndex = progressTracking.indexOf('###', sectionIndex + sectionMarker.length);
        
        if (nextSectionIndex > -1) {
          const sectionContent = progressTracking.substring(sectionIndex, nextSectionIndex);
          const updatedSection = sectionContent + '\n' + taskEntry;
          progressTracking = progressTracking.replace(sectionContent, updatedSection);
        } else {
          // This is the last section
          const sectionContent = progressTracking.substring(sectionIndex);
          const updatedSection = sectionContent + '\n' + taskEntry;
          progressTracking = progressTracking.replace(sectionContent, updatedSection);
        }
      } else {
        // Add to In Progress section
        progressTracking = progressTracking.replace(
          '### In Progress',
          '### In Progress\n' + taskEntry
        );
      }
      
      updates.tasksAdded++;
    }
  }
  
  // Write updated content back to files
  fs.writeFileSync(BUGLOG_PATH, bugLog);
  fs.writeFileSync(PROGRESS_TRACKING_PATH, progressTracking);
  
  return updates;
}

function updateIssuesLog(issues) {
  let content = fs.readFileSync(ISSUES_LOG_PATH, 'utf8');
  const lines = content.split('\n');
  let updatedLines = [];
  
  let inIssue = false;
  let currentIssue = null;
  
  // Process the file line by line
  for (const line of lines) {
    if (line.startsWith('+ ')) {
      // Start of a new issue
      inIssue = true;
      currentIssue = issues.find(i => i.description === line.substring(2));
      
      // If the issue was processed, mark it as completed
      if (currentIssue && !currentIssue.completed) {
        updatedLines.push(`- [x] ${line.substring(2)}`);
      } else {
        updatedLines.push(line);
      }
    } else if ((line.startsWith('- [ ] ') || line.startsWith('- [x] ')) && inIssue) {
      // End of current issue
      inIssue = false;
      currentIssue = null;
      updatedLines.push(line);
    } else if (inIssue && currentIssue && !currentIssue.completed) {
      // Skip details of processed issues
      continue;
    } else {
      // Keep line as is
      updatedLines.push(line);
    }
  }
  
  // Write updated content back to file
  fs.writeFileSync(ISSUES_LOG_PATH, updatedLines.join('\n'));
}

function updateProgressTracking(features) {
  let progressTracking = fs.readFileSync(PROGRESS_TRACKING_PATH, 'utf8');
  
  const updates = {
    featuresAdded: 0
  };
  
  for (const feature of features) {
    if (feature.completed) continue; // Skip already processed features
    
    // Determine the appropriate section based on the feature description
    const featureDescription = feature.description.toLowerCase();
    let targetSection = '### Planned';
    
    // Add as task to progress-tracking.md
    const taskEntry = `- [ ] ${feature.description}`;
    
    if (progressTracking.includes(targetSection)) {
      // Add to existing section
      const sectionIndex = progressTracking.indexOf(targetSection);
      const nextSectionIndex = progressTracking.indexOf('##', sectionIndex + targetSection.length);
      
      if (nextSectionIndex > -1) {
        const sectionContent = progressTracking.substring(sectionIndex, nextSectionIndex);
        const updatedSection = sectionContent + '\n' + taskEntry;
        progressTracking = progressTracking.replace(sectionContent, updatedSection);
      } else {
        // This is the last section
        const sectionContent = progressTracking.substring(sectionIndex);
        const updatedSection = sectionContent + '\n' + taskEntry;
        progressTracking = progressTracking.replace(sectionContent, updatedSection);
      }
    } else {
      // Add to In Progress section as fallback
      progressTracking = progressTracking.replace(
        '### In Progress',
        '### In Progress\n' + taskEntry
      );
    }
    
    updates.featuresAdded++;
  }
  
  // Write updated content back to file
  fs.writeFileSync(PROGRESS_TRACKING_PATH, progressTracking);
  
  return updates;
}

function updateFeaturesLog(features) {
  let content = fs.readFileSync(FEATURES_LOG_PATH, 'utf8');
  const lines = content.split('\n');
  let updatedLines = [];
  
  let inFeature = false;
  let currentFeature = null;
  
  // Process the file line by line
  for (const line of lines) {
    if (line.startsWith('+ ')) {
      // Start of a new feature
      inFeature = true;
      currentFeature = features.find(i => i.description === line.substring(2));
      
      // If the feature was processed, mark it as completed
      if (currentFeature && !currentFeature.completed) {
        updatedLines.push(`- [x] ${line.substring(2)}`);
      } else {
        updatedLines.push(line);
      }
    } else if ((line.startsWith('- [ ] ') || line.startsWith('- [x] ') || line.startsWith('- [-] ')) && inFeature) {
      // End of current feature
      inFeature = false;
      currentFeature = null;
      updatedLines.push(line);
    } else if (line.startsWith('- [ ] ') || line.startsWith('- [-] ')) {
      // Standalone feature
      const featureDesc = line.startsWith('- [ ] ') ? line.substring(6) : line.substring(6);
      currentFeature = features.find(i => i.description === featureDesc);
      
      // If the feature was processed, mark it as completed
      if (currentFeature && !currentFeature.completed) {
        updatedLines.push(`- [x] ${featureDesc}`);
      } else {
        updatedLines.push(line);
      }
    } else if (inFeature && currentFeature && !currentFeature.completed) {
      // Skip details of processed features
      continue;
    } else {
      // Keep line as is
      updatedLines.push(line);
    }
  }
  
  // Write updated content back to file
  fs.writeFileSync(FEATURES_LOG_PATH, updatedLines.join('\n'));
}

function updateVectorEmbeddings() {
  try {
    console.log('Updating vector embeddings...');
    execSync('npm run context:update-vectors', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Error updating vector embeddings:', error);
    return false;
  }
}

// Main function
function main() {
  console.log('Starting context update process...');
  
  // Process issues
  if (fs.existsSync(ISSUES_LOG_PATH)) {
    const issuesContent = fs.readFileSync(ISSUES_LOG_PATH, 'utf8');
    const issues = parseIssues(issuesContent);
    
    console.log(`Found ${issues.length} issues in the log.`);
    
    // Process issues
    const issueUpdates = updateBugLog(issues);
    console.log(`Updates: ${issueUpdates.bugsAdded} bugs, ${issueUpdates.issuesAdded} issues under review, ${issueUpdates.tasksAdded} tasks added.`);
    
    // Mark processed issues as completed
    updateIssuesLog(issues);
    console.log('Updated issues log to mark processed issues as completed.');
  } else {
    console.log('No issues log found. Skipping issue processing.');
  }
  
  // Process features
  if (fs.existsSync(FEATURES_LOG_PATH)) {
    const featuresContent = fs.readFileSync(FEATURES_LOG_PATH, 'utf8');
    const features = parseFeatures(featuresContent);
    
    console.log(`Found ${features.length} features in the log.`);
    
    // Process features
    const featureUpdates = updateProgressTracking(features);
    console.log(`Updates: ${featureUpdates.featuresAdded} features added to task list.`);
    
    // Mark processed features as completed
    updateFeaturesLog(features);
    console.log('Updated features log to mark processed features as completed.');
  } else {
    console.log('No features log found. Skipping feature processing.');
  }
  
  // Update vector embeddings
  const embeddingsUpdated = updateVectorEmbeddings();
  if (embeddingsUpdated) {
    console.log('Vector embeddings updated successfully.');
  }
  
  console.log('Context update completed successfully!');
}

// Run the script
main(); 