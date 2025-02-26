import React from 'react';
import { h } from '@cycle/react';
import { Project } from '../types/project';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { ListItemProps } from '@mui/material/ListItem';
import { IconButtonProps } from '@mui/material/IconButton';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
}

interface ProjectListItemProps extends ListItemProps {
  'data-project-id': string;
  sel: string;
}

interface ProjectIconButtonProps extends IconButtonProps {
  'data-project-id': string;
  sel: string;
}

export function ProjectList(props: ProjectListProps) {
  const { projects, selectedProjectId, isLoading } = props;

  if (isLoading) {
    return h('div', { className: 'project-list-loading' }, [
      h(CircularProgress)
    ]);
  }

  if (projects.length === 0) {
    return h('div', { className: 'project-list-empty' }, [
      h(Typography, { variant: 'body1' }, 'No projects found')
    ]);
  }

  return h('div', { className: 'project-list' }, [
    h(List, {}, 
      projects.map(project =>
        h(ListItem as any, {
          key: project.id,
          selected: project.id === selectedProjectId,
          button: true,
          sel: 'project',
          'data-project-id': project.id
        } as ProjectListItemProps, [
          h(ListItemText, {
            primary: project.name,
            secondary: project.description || 'No description'
          }),
          h(ListItemSecondaryAction, [
            h(IconButton as any, {
              edge: 'end',
              sel: 'editProject',
              'data-project-id': project.id
            } as ProjectIconButtonProps, [
              h(EditIcon)
            ]),
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
  ]);
} 