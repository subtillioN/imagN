import React from 'react';
import { h } from '@cycle/react';
import { Chip, TextField, Typography, Box } from '@mui/material';
import { ChipProps } from '@mui/material/Chip';

interface TagFilterProps {
  selectedCategories: string[];
  selectedTypes: string[];
  selectedTags: string[];
  tagSearchQuery: string;
  availableCategories: string[];
  availableTypes: string[];
  availableTags: string[];
  onCategoryClick?: (category: string) => void;
  onTypeClick?: (type: string) => void;
  onTagClick?: (tag: string) => void;
  onSearchChange?: (query: string) => void;
}

interface FilterChipProps extends ChipProps {
  'data-tag'?: string;
  sel?: string;
}

export function TagFilter(props: TagFilterProps) {
  const {
    selectedCategories,
    selectedTypes,
    selectedTags,
    tagSearchQuery,
    availableCategories,
    availableTypes,
    availableTags,
    onCategoryClick,
    onTypeClick,
    onTagClick,
    onSearchChange
  } = props;

  return h(Box, { className: 'tag-filter', sx: { p: 2 } }, [
    // Categories
    h(Typography, { variant: 'subtitle1', sx: { mb: 1 } }, 'Categories'),
    h(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 } },
      availableCategories.map(category =>
        h(Chip as any, {
          key: category,
          label: category,
          sel: 'category',
          'data-tag': category,
          color: selectedCategories.includes(category) ? 'primary' : 'default',
          onClick: () => onCategoryClick?.(category)
        } as FilterChipProps)
      )
    ),

    // Types
    h(Typography, { variant: 'subtitle1', sx: { mb: 1 } }, 'Types'),
    h(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 } },
      availableTypes.map(type =>
        h(Chip as any, {
          key: type,
          label: type,
          sel: 'type',
          'data-tag': type,
          color: selectedTypes.includes(type) ? 'primary' : 'default',
          onClick: () => onTypeClick?.(type)
        } as FilterChipProps)
      )
    ),

    // Tag Search
    h(TextField, {
      fullWidth: true,
      variant: 'outlined',
      size: 'small',
      label: 'Search Tags',
      value: tagSearchQuery,
      sel: 'tagSearch',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange?.(e.target.value),
      sx: { mb: 2 }
    }),

    // Tags
    h(Typography, { variant: 'subtitle1', sx: { mb: 1 } }, 'Tags'),
    h(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1 } },
      availableTags
        .filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
        .map(tag =>
          h(Chip as any, {
            key: tag,
            label: tag,
            sel: 'tag',
            'data-tag': tag,
            color: selectedTags.includes(tag) ? 'primary' : 'default',
            onClick: () => onTagClick?.(tag)
          } as FilterChipProps)
        )
    )
  ]);
} 