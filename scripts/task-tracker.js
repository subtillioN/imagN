#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const TASK_FILE = path.join(__dirname, '../docs/migration/task-tracking.md');

class TaskTracker {
  constructor() {
    this.tasks = new Map();
    this.phases = new Map();
    this.currentPhase = '';
    this.currentSection = '';
  }

  parseTaskFile() {
    const content = fs.readFileSync(TASK_FILE, 'utf8');
    const lines = content.split('\n');

    lines.forEach(line => {
      if (line.startsWith('## Phase')) {
        this.currentPhase = line.substring(3).split(':')[0].trim();
        this.phases.set(this.currentPhase, { total: 0, completed: 0 });
      } else if (line.startsWith('### ')) {
        this.currentSection = line.substring(4).split('[')[0].trim();
      } else if (line.startsWith('- [')) {
        const completed = line.includes('- [x]');
        const task = line.substring(line.indexOf(']') + 1).trim();
        this.tasks.set(task, {
          completed,
          phase: this.currentPhase,
          section: this.currentSection
        });
        
        const phaseStats = this.phases.get(this.currentPhase);
        phaseStats.total++;
        if (completed) phaseStats.completed++;
      }
    });
  }

  generateReport() {
    console.log(chalk.bold('\nTask Progress Report\n'));

    // Overall progress
    const totalTasks = this.tasks.size;
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.completed).length;
    const percentage = ((completedTasks / totalTasks) * 100).toFixed(1);

    console.log(chalk.blue(`Overall Progress: ${completedTasks}/${totalTasks} (${percentage}%)\n`));

    // Phase progress
    console.log(chalk.bold('Phase Progress:'));
    this.phases.forEach((stats, phase) => {
      const phasePercentage = ((stats.completed / stats.total) * 100).toFixed(1);
      const color = phasePercentage === '100' ? 'green' : phasePercentage === '0' ? 'red' : 'yellow';
      console.log(chalk[color](`${phase}: ${stats.completed}/${stats.total} (${phasePercentage}%)`));
    });

    // Next tasks
    console.log(chalk.bold('\nNext Tasks:'));
    let nextTasks = Array.from(this.tasks.entries())
      .filter(([_, task]) => !task.completed)
      .slice(0, 5);
    
    nextTasks.forEach(([name, task]) => {
      console.log(chalk.cyan(`- [${task.phase}] ${name}`));
    });
  }

  updateTask(taskName, completed = true) {
    const content = fs.readFileSync(TASK_FILE, 'utf8');
    const lines = content.split('\n');
    
    const updatedLines = lines.map(line => {
      if (line.includes(taskName)) {
        return line.replace(/- \[([ x])\]/, `- [${completed ? 'x' : ' '}]`);
      }
      return line;
    });

    fs.writeFileSync(TASK_FILE, updatedLines.join('\n'));
    console.log(chalk.green(`Updated task: ${taskName}`));
  }

  updateProgress() {
    const content = fs.readFileSync(TASK_FILE, 'utf8');
    const lines = content.split('\n');
    let inProgressSection = false;
    
    const updatedLines = lines.map(line => {
      if (line.includes('### Phase Progress')) {
        inProgressSection = true;
        return line;
      }
      
      if (inProgressSection && line.startsWith('- Phase')) {
        const phase = line.split(':')[0].replace('- ', '');
        const stats = this.phases.get(phase);
        if (stats) {
          return `- ${phase}: ${stats.completed}/${stats.total} tasks completed`;
        }
      }
      
      if (line.startsWith('##')) {
        inProgressSection = false;
      }
      
      return line;
    });

    fs.writeFileSync(TASK_FILE, updatedLines.join('\n'));
  }
}

// CLI interface
const [,, command, ...args] = process.argv;

const tracker = new TaskTracker();
tracker.parseTaskFile();

switch (command) {
  case 'report':
    tracker.generateReport();
    break;
  case 'complete':
    tracker.updateTask(args[0], true);
    tracker.parseTaskFile();
    tracker.updateProgress();
    tracker.generateReport();
    break;
  case 'uncomplete':
    tracker.updateTask(args[0], false);
    tracker.parseTaskFile();
    tracker.updateProgress();
    tracker.generateReport();
    break;
  default:
    console.log(`
Usage:
  node task-tracker.js report              Generate progress report
  node task-tracker.js complete "Task"     Mark task as completed
  node task-tracker.js uncomplete "Task"   Mark task as not completed
    `);
} 