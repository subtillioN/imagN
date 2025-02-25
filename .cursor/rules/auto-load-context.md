# Auto-Load Default Context

This rule automatically loads the default context when Cursor starts.

## Trigger

When Cursor starts or a new workspace is opened.

## Action

```javascript
// Load the default context
const { execSync } = require('child_process');
try {
  console.log('Auto-loading default context...');
  execSync('npm run context:load -- default', { stdio: 'inherit' });
  console.log('Default context loaded successfully.');
} catch (error) {
  console.error('Error loading default context:', error);
}
```

## Purpose

This rule ensures that developers always start with the default context loaded, providing a consistent baseline understanding of the codebase. The default context includes:

- Key application files
- Core documentation
- Essential concepts

## Configuration

To disable this auto-loading behavior, add the following to your `.cursorrc` file:

```json
{
  "rules": {
    "auto-load-context": false
  }
}
``` 