export const utcToZonedTime = (date: Date | number | string, timeZone: string) => {
  const value = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error('Invalid date supplied to utcToZonedTime mock');
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter
    .formatToParts(value)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  const isoLike = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.000Z`;
  return new Date(isoLike);
};
