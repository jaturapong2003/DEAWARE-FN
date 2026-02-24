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

// format date to YYYY-MM-DD (for API parameters)
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
