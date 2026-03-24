import React from 'react';
import { Monitor, Camera, Ban } from 'lucide-react';

export const DeviceIcon: React.FC<{ device: string | null }> = ({ device }) => {
  switch (device) {
    case 'web_app':
      return <Monitor className="h-4 w-4" />;
    case 'cam-01':
      return <Camera className="h-4 w-4" />;
    default:
      return <Ban className="h-4 w-4" />;
  }
};
