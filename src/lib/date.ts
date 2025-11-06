import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';


export const RECIFE_TIMEZONE = 'America/Recife';

export const toZonedDate = (value: string) => {
  const parsed = parseISO(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida: ${value}`);
  }

  return parsed;
};

export const formatZonedDate = (date: Date, pattern = 'dd/MM/yyyy HH:mm') =>
  formatInTimeZone(date, RECIFE_TIMEZONE, pattern, { locale: ptBR });

export const formatDateRange = (
  range: { from?: Date | null; to?: Date | null },
  locale = ptBR,
) => {
  const { from = null, to = null } = range;

  if (from && to) {
    return `${format(from, 'dd/MM/yyyy', { locale })} — ${format(to, 'dd/MM/yyyy', { locale })}`;
  }

  if (from) {
    return `A partir de ${format(from, 'dd/MM/yyyy', { locale })}`;
  }

  if (to) {
    return `Até ${format(to, 'dd/MM/yyyy', { locale })}`;
  }

  return null;
};

export const formatPeriodRange = (start: Date, end: Date) =>
  `${formatZonedDate(start)} — ${formatZonedDate(end)}`;

export const hasIntersection = (
  rangeA: { from?: Date | null; to?: Date | null },
  rangeB: { from?: Date | null; to?: Date | null },
) => {
  const startA = rangeA.from?.getTime() ?? Number.NEGATIVE_INFINITY;
  const endA = rangeA.to?.getTime() ?? Number.POSITIVE_INFINITY;
  const startB = rangeB.from?.getTime() ?? Number.NEGATIVE_INFINITY;
  const endB = rangeB.to?.getTime() ?? Number.POSITIVE_INFINITY;

  return startA <= endB && startB <= endA;
};

export const isWithinRange = (date: Date, from?: Date, to?: Date) => {
  if (from && date < from) {
    return false;
  }

  if (to && date > to) {
    return false;
  }

  return true;
};
