import React from 'react';
import { h } from '@cycle/react';
import { Snackbar as MuiSnackbar, Alert } from '@mui/material';
import { AlertProps } from '@mui/material/Alert';

interface SnackbarProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  autoHideDuration?: number;
}

export function Snackbar(props: SnackbarProps) {
  const { open, message, severity, autoHideDuration = 6000 } = props;

  return h(MuiSnackbar, {
    open,
    autoHideDuration,
    sel: 'snackbar'
  }, [
    h(Alert, {
      severity,
      elevation: 6,
      variant: 'filled'
    } as AlertProps, message)
  ]);
} 