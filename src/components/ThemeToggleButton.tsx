import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import { ThemeName, themes } from '../theme';
import { useAppTheme } from './ThemeProvider';

interface ThemeToggleButtonProps {
  position?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  position = { top: '16px', right: '64px' },
}) => {
  const theme = useTheme();
  const { currentTheme, setTheme } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'theme-popover' : undefined;

  return (
    <>
      <Tooltip title="Change Theme" arrow placement="left">
        <IconButton
          aria-label="Change Theme"
          color="primary"
          onClick={handleClick}
          sx={{
            position: 'fixed',
            ...position,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)',
            },
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: 1,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider', 
            backgroundColor: theme.palette.background.paper 
          }}
        >
          <Typography variant="subtitle1" fontWeight="500">
            Select Theme
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {themes.map((themeOption) => (
            <ListItem key={themeOption.name} disablePadding>
              <ListItemButton 
                selected={currentTheme === themeOption.name}
                onClick={() => handleThemeSelect(themeOption.name)}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  },
                }}
              >
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    backgroundColor: 
                      themeOption.name === 'light' ? '#ffffff' :
                      themeOption.name === 'dark' ? '#111111' :
                      themeOption.name === 'contrast' ? '#4ade80' :
                      themeOption.name === 'neon' ? '#f0abfc' :
                      '#94a3b8',
                    mr: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }} 
                />
                <ListItemText primary={themeOption.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};

export default ThemeToggleButton; 