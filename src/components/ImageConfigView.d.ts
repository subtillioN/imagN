import { FC } from 'react';

export interface ImageConfigViewProps {
  config: {
    format?: string;
    compression?: number;
    width?: number;
    height?: number;
    quality?: number;
  } | null;
}

export const ImageConfigView: FC<ImageConfigViewProps>; 