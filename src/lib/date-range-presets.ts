import { isSameDay, subDays } from 'date-fns';

import type { DashboardDateRangeFilter } from './metrics';

export interface DateRangePreset {
  id: string;
  label: string;
  days?: number;
  description?: string;
}

export type DateRangePresetId = DateRangePreset['id'];

export const DEFAULT_DATE_RANGE_PRESET: DateRangePresetId = '90d';

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { id: '30d', label: 'Últimos 30 dias', days: 30 },
  { id: '60d', label: 'Últimos 60 dias', days: 60 },
  { id: '90d', label: 'Últimos 90 dias', days: 90 },
  { id: 'all', label: 'Período completo' },
];

export const isValidRangePreset = (value: string | null): value is DateRangePresetId =>
  DATE_RANGE_PRESETS.some((preset) => preset.id === value);

export const computePresetDateRange = (
  presetId: DateRangePresetId,
  minDate: Date | null,
  maxDate: Date | null,
): DashboardDateRangeFilter => {
  if (!minDate || !maxDate) {
    return { from: null, to: null };
  }

  if (presetId === 'all') {
    return { from: minDate, to: maxDate };
  }

  const preset = DATE_RANGE_PRESETS.find((item) => item.id === presetId);
  if (!preset?.days) {
    return { from: null, to: null };
  }

  const fromCandidate = subDays(maxDate, preset.days - 1);
  const from = fromCandidate.getTime() < minDate.getTime() ? minDate : fromCandidate;

  return { from, to: maxDate };
};

const isSameDate = (a: Date | null, b: Date | null) => {
  if (!a && !b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return isSameDay(a, b);
};

export const isSameDateRange = (a: DashboardDateRangeFilter, b: DashboardDateRangeFilter) =>
  isSameDate(a.from, b.from) && isSameDate(a.to, b.to);

export const findMatchingPreset = (
  range: DashboardDateRangeFilter,
  minDate: Date | null,
  maxDate: Date | null,
): DateRangePresetId | null => {
  if (!minDate || !maxDate) {
    return null;
  }

  for (const preset of DATE_RANGE_PRESETS) {
    const presetRange = computePresetDateRange(preset.id, minDate, maxDate);
    if (isSameDateRange(presetRange, range)) {
      return preset.id;
    }
  }

  return null;
};
