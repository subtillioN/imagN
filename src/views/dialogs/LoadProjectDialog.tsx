import React from 'react';
import { h } from '@cycle/react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Project } from '../../types/project';
import { ListItemProps } from '@mui/material/ListItem';
import { IconButtonProps } from '@mui/material/IconButton';

interface LoadProjectDialogProps {
  open: boolean;
  projects: Project[];
}

interface ProjectListItemProps extends ListItemProps {
  'data-project-id': string;
  sel: string;
}

interface ProjectIconButtonProps extends IconButtonProps {
  'data-project-id': string;
  sel: string;
}

export function LoadProjectDialog(props: LoadProjectDialogProps) {
  const { open, projects } = props;

  return h(Dialog, {
    open,
    maxWidth: 'sm',
    fullWidth: true,
    sel: 'loadProjectDialog'
  }, [
    h(DialogTitle, {}, 'Load Project'),
    h(DialogContent, {}, [
      h(TextField, {
        margin: 'dense',
        label: 'Search Projects',
        fullWidth: true,
        variant: 'outlined',
        sel: 'projectSearch'
      }),
      h(List, {}, 
        projects.map(project =>
          h(ListItem as any, {
            key: project.id,
            button: true,
            sel: 'selectProject',
            'data-project-id': project.id
          } as ProjectListItemProps, [
            h(ListItemText, {
              primary: project.name,
              secondary: project.description || 'No description'
            }),
            h(ListItemSecondaryAction, [
              h(IconButton as any, {
                edge: 'end',
                sel: 'deleteProject',
                'data-project-id': project.id
              } as ProjectIconButtonProps, [
                h(DeleteIcon)
              ])
            ])
          ])
        )
      )
    ]),
    h(DialogActions, {}, [
      h(Button, {
        sel: 'cancelLoadProject'
      }, 'Cancel')
    ])
  ]);
} 