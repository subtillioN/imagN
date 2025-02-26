import React from 'react';
import { h } from '@cycle/react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip, Box } from '@mui/material';
import { ChipProps } from '@mui/material/Chip';

interface TagManagementDialogProps {
  open: boolean;
  presetId?: string;
  availableTags: string[];
}

interface TagChipProps extends ChipProps {
  'data-tag': string;
  sel: string;
}

export function TagManagementDialog(props: TagManagementDialogProps) {
  const { open, presetId, availableTags } = props;

  return h(Dialog, {
    open,
    maxWidth: 'sm',
    fullWidth: true,
    sel: 'tagManagementDialog'
  }, [
    h(DialogTitle, {}, 'Manage Tags'),
    h(DialogContent, {}, [
      h(TextField, {
        margin: 'dense',
        label: 'Add New Tag',
        fullWidth: true,
        variant: 'outlined',
        sel: 'newTag'
      }),
      h(Box, {
        sx: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 2
        }
      }, 
        availableTags.map(tag =>
          h(Chip as any, {
            key: tag,
            label: tag,
            sel: 'tag',
            'data-tag': tag,
            onDelete: () => {},
            color: 'primary',
            variant: 'outlined'
          } as TagChipProps)
        )
      )
    ]),
    h(DialogActions, {}, [
      h(Button, {
        sel: 'cancelTagManagement'
      }, 'Cancel'),
      h(Button, {
        variant: 'contained',
        sel: 'saveTags'
      }, 'Save')
    ])
  ]);
} 