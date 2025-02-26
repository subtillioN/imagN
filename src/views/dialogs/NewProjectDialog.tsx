import React from 'react';
import { h } from '@cycle/react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { WorkflowPreset } from '../../types/workflow';
import { BoxProps } from '@mui/material/Box';

interface NewProjectDialogProps {
  open: boolean;
  systemPresets: WorkflowPreset[];
  userPresets: WorkflowPreset[];
}

interface PresetBoxProps extends BoxProps {
  'data-preset': string;
  sel: string;
}

export function NewProjectDialog(props: NewProjectDialogProps) {
  const { open, systemPresets, userPresets } = props;

  return h(Dialog, {
    open,
    maxWidth: 'md',
    fullWidth: true,
    sel: 'newProjectDialog'
  }, [
    h(DialogTitle, {}, 'Create New Project'),
    h(DialogContent, {}, [
      h(TextField, {
        autoFocus: true,
        margin: 'dense',
        label: 'Project Name',
        fullWidth: true,
        variant: 'outlined',
        sel: 'projectName'
      }),
      h(TextField, {
        margin: 'dense',
        label: 'Description',
        fullWidth: true,
        multiline: true,
        rows: 3,
        variant: 'outlined',
        sel: 'projectDescription'
      }),
      h(Typography, { variant: 'h6', sx: { mt: 2, mb: 1 } }, 'Select a Preset'),
      h(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 } }, [
        // System Presets
        h(Typography, { variant: 'subtitle1', sx: { gridColumn: '1/-1' } }, 'System Presets'),
        ...systemPresets.map(preset =>
          h(Box as any, {
            key: preset.id,
            sx: {
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            },
            sel: 'selectPreset',
            'data-preset': JSON.stringify(preset)
          } as PresetBoxProps, [
            h(Typography, { variant: 'subtitle2' }, preset.name),
            h(Typography, { variant: 'body2', color: 'text.secondary' }, preset.description)
          ])
        ),
        // User Presets
        h(Typography, { variant: 'subtitle1', sx: { gridColumn: '1/-1', mt: 2 } }, 'User Presets'),
        ...userPresets.map(preset =>
          h(Box as any, {
            key: preset.id,
            sx: {
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            },
            sel: 'selectPreset',
            'data-preset': JSON.stringify(preset)
          } as PresetBoxProps, [
            h(Typography, { variant: 'subtitle2' }, preset.name),
            h(Typography, { variant: 'body2', color: 'text.secondary' }, preset.description)
          ])
        )
      ])
    ]),
    h(DialogActions, {}, [
      h(Button, {
        sel: 'cancelNewProject'
      }, 'Cancel'),
      h(Button, {
        variant: 'contained',
        sel: 'createProject'
      }, 'Create')
    ])
  ]);
} 