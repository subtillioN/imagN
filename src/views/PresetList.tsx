import React from 'react';
import { h } from '@cycle/react';
import { WorkflowPreset } from '../types/workflow';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { ListItemProps } from '@mui/material/ListItem';
import { IconButtonProps } from '@mui/material/IconButton';

interface PresetListProps {
  systemPresets: WorkflowPreset[];
  userPresets: WorkflowPreset[];
  selectedPresetId: string | null;
  isLoading: boolean;
}

interface PresetListItemProps extends ListItemProps {
  'data-preset-id': string;
  sel: string;
}

interface PresetIconButtonProps extends IconButtonProps {
  'data-preset-id': string;
  sel: string;
}

export function PresetList(props: PresetListProps) {
  const { systemPresets, userPresets, selectedPresetId, isLoading } = props;

  if (isLoading) {
    return h('div', { className: 'preset-list-loading' }, [
      h(CircularProgress)
    ]);
  }

  return h('div', { className: 'preset-list' }, [
    // System Presets
    h(Typography, { variant: 'h6' }, 'System Presets'),
    h(List, { className: 'system-presets' }, 
      systemPresets.map(preset =>
        h(ListItem as any, {
          key: preset.id,
          selected: preset.id === selectedPresetId,
          button: true,
          sel: 'preset',
          'data-preset-id': preset.id
        } as PresetListItemProps, [
          h(ListItemText, {
            primary: preset.name,
            secondary: preset.description
          }),
          h(ListItemSecondaryAction, [
            h(IconButton as any, {
              edge: 'end',
              sel: 'editPreset',
              'data-preset-id': preset.id
            } as PresetIconButtonProps, [
              h(EditIcon)
            ])
          ])
        ])
      )
    ),

    // User Presets
    h(Typography, { variant: 'h6', style: { marginTop: 24 } }, 'User Presets'),
    h(List, { className: 'user-presets' }, 
      userPresets.map(preset =>
        h(ListItem as any, {
          key: preset.id,
          selected: preset.id === selectedPresetId,
          button: true,
          sel: 'preset',
          'data-preset-id': preset.id
        } as PresetListItemProps, [
          h(ListItemText, {
            primary: preset.name,
            secondary: preset.description
          }),
          h(ListItemSecondaryAction, [
            h(IconButton as any, {
              edge: 'end',
              sel: 'editPreset',
              'data-preset-id': preset.id
            } as PresetIconButtonProps, [
              h(EditIcon)
            ]),
            h(IconButton as any, {
              edge: 'end',
              sel: 'deletePreset',
              'data-preset-id': preset.id
            } as PresetIconButtonProps, [
              h(DeleteIcon)
            ])
          ])
        ])
      )
    )
  ]);
} 