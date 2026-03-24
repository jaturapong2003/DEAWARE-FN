import type { ImageAttendance, AttendanceRecord } from '@/@types/Attendance';

export const normalizeImageType = (type: string | undefined): string =>
  (type || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

export const isCheckInImageType = (type: string): boolean =>
  normalizeImageType(type) === 'check_in';

export const isCheckOutImageType = (type: string): boolean =>
  normalizeImageType(type) === 'check_out';

export const getAttendanceImageUrls = (record: {
  ImageAttendance?: ImageAttendance[];
  images?: ImageAttendance[];
}) => {
  const images = [...(record.ImageAttendance ?? record.images ?? [])].sort(
    (a, b) =>
      new Date(a.CreatedAt ?? a.created_at ?? '').getTime() -
      new Date(b.CreatedAt ?? b.created_at ?? '').getTime()
  );

  const checkInImage = images.find((img) =>
    isCheckInImageType(img.ImageType ?? img.image_type ?? '')
  );
  const checkOutImage = images.find((img) =>
    isCheckOutImageType(img.ImageType ?? img.image_type ?? '')
  );
  const firstImage = images[0];
  const lastImage = images.at(-1) ?? firstImage;

  return {
    checkInImageUrl:
      checkInImage?.ImageURL ?? checkInImage?.image_url ?? null,
    checkOutImageUrl:
      checkOutImage?.ImageURL ?? checkOutImage?.image_url ?? lastImage?.ImageURL ?? lastImage?.image_url ?? null,
  };
};

export const getDeviceName = (device: string | null): string => {
  // If device is missing or empty, assume it's a camera device
  if (!device) return 'กล้อง';

  switch (device) {
    case 'web_app':
      return 'เว็บแอพ';
    case 'cam-01':
      return 'กล้อง 1';
    default:
      return device;
  }
};

export const getConfidenceColor = (confidence: number | null): string => {
  if (confidence == null) return 'text-muted-foreground';
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  return 'text-orange-600';
};

export const FULL_HOURS = 9;

/** Calculate hours between check_in and check_out as decimal hours */
export const calcHours = (record: AttendanceRecord): number => {
  if (!record.check_in || !record.check_out) return 0;
  const inTime = new Date(record.check_in).getTime();
  const outTime = new Date(record.check_out).getTime();
  if (isNaN(inTime) || isNaN(outTime)) return 0;
  return (outTime - inTime) / (1000 * 60 * 60);
};

export const isFullHours = (record: AttendanceRecord): boolean =>
  calcHours(record) >= FULL_HOURS;

/** Format decimal hours to human readable Thai string (e.g. "1 ชม. 10 นาที") */
export const fmtHours = (decimalHours: number): string => {
  const totalMinutes = Math.round(Math.abs(decimalHours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} นาที`;
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} นาที`;
};
