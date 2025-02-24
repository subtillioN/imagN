import React from 'react';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  SelectChangeEvent,
  Box,
  useTheme,
  Typography
} from '@mui/material';
import { ThemeName, themes } from '../theme';

interface ThemeSwitcherProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  currentTheme, 
  onThemeChange 
}) => {
  const theme = useTheme();
  
  const handleChange = (event: SelectChangeEvent) => {
    onThemeChange(event.target.value as ThemeName);
  };

  return (
    <Box sx={{ minWidth: 180 }}>
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel id="theme-select-label">Theme</InputLabel>
        <Select
          labelId="theme-select-label"
          id="theme-select"
          value={currentTheme}
          label="Theme"
          onChange={handleChange}
          sx={{
            backgroundColor: theme.palette.background.paper,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
            },
          }}
        >
          {themes.map((option) => (
            <MenuItem key={option.name} value={option.name}>
              <Typography variant="body2">{option.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ThemeSwitcher; 