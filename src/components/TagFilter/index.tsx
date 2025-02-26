import React from 'react';
import { Chip, TextField, Box } from '@mui/material';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  searchQuery: string;
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  availableTags,
  selectedTags,
  searchQuery,
  onTagSelect,
  onTagRemove,
  onSearchChange
}) => {
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search tags..."
        value={searchQuery}
        onChange={onSearchChange}
        margin="normal"
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {filteredTags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => onTagSelect(tag)}
            onDelete={() => onTagRemove(tag)}
            color={selectedTags.includes(tag) ? 'primary' : 'default'}
          />
        ))}
      </Box>
    </Box>
  );
}; 