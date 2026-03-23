import React from 'react';
import { DeviceIcon } from '@/lib/attendance-icons';
import { getDeviceName, getConfidenceColor } from '@/lib/attendance';

const AttendanceDeviceCard: React.FC<{
  device?: string | null;
  confidence?: number | null;
  emptyText?: string | null;
}> = ({ device, confidence, emptyText = null }) => {
  if (!device && !emptyText) return null;

  if (!device && emptyText) {
    return (
      <div className="bg-muted/30 rounded-md p-2">
        <span className="text-muted-foreground text-xs">{emptyText}</span>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 space-y-1.5 rounded-md p-2">
      <div className="flex items-center gap-2">
        <DeviceIcon device={device ?? null} />
        <span className="text-xs font-medium">{getDeviceName(device ?? null)}</span>
      </div>
      {confidence != null && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">ความแม่นยำ:</span>
          <span className={`text-xs font-bold ${getConfidenceColor(confidence)}`}>
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default AttendanceDeviceCard;
