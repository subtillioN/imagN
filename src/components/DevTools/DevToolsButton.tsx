import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

export const DevToolsButton: React.FC = () => {
  return (
    <Tooltip title="Developer Tools - Task & Feature Analysis" arrow placement="left">
      <IconButton
        aria-label="Developer Tools"
        color="primary"
        sx={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
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
}; 