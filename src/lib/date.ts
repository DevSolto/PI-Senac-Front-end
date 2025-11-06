import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const RECIFE_TIMEZONE = 'America/Recife';

export const parseToZonedTime = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return utcToZonedTime(parsed, RECIFE_TIMEZONE);
};

export const formatZonedDate = (date: Date, pattern = "dd/MM/yyyy HH:mm") =>
  format(date, pattern, { locale: ptBR });

export const formatPeriodRange = (start: Date, end: Date) =>
  `${formatZonedDate(start)} — ${formatZonedDate(end)}`;

export const isWithinRange = (date: Date, from?: Date, to?: Date) => {
  if (from && date < from) {
    return false;
  }

  if (to && date > to) {
    return false;
  }

  return true;
};
