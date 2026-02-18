// format time
export const formatTime = (
  dateString: string | null,
  emptyValue: string = '-'
): string => {
  if (!dateString) return emptyValue;
  const hhmm = dateString.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/);
  if (hhmm) return hhmm[1];

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return emptyValue;

  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// format date
export const formatDate = (
  dateString: string | null,
  emptyValue: string = '-'
): string => {
  if (!dateString) return emptyValue;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return emptyValue;

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
