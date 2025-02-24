import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export function DevToolsButton() {
  return (
    <Tooltip title="Developer Tools - Task & Feature Analysis" arrow placement="bottom">
      <IconButton
        aria-label="Developer Tools"
        color="primary"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)',
          },
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
        }}
      >
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  );
}

export default DevToolsButton; 