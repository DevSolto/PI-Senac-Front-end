import { CalendarIcon, X } from 'lucide-react';
import { useMemo } from 'react';
import type { DateRange as DayPickerRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatPeriodRange, formatZonedDate } from '@/lib/date';

export interface DateRangeProps {
  value: { from?: Date; to?: Date };
  onChange: (value: DayPickerRange | undefined) => void;
  disabled?: boolean;
}

const buildLabel = (from?: Date, to?: Date) => {
  if (from && to) {
    return formatPeriodRange(from, to);
  }

  if (from) {
    return `A partir de ${formatZonedDate(from, 'dd/MM/yyyy')}`;
  }

  if (to) {
    return `Até ${formatZonedDate(to, 'dd/MM/yyyy')}`;
  }

  return 'Período completo';
};

export const DateRange = ({ value, onChange, disabled = false }: DateRangeProps) => {
  const label = useMemo(() => buildLabel(value.from, value.to), [value.from, value.to]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-left font-normal"
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value.from || value.to ? { from: value.from, to: value.to } : undefined}
          onSelect={onChange}
          initialFocus
        />
        {(value.from || value.to) && (
          <div className="flex justify-end border-t border-border/60 p-2">
            <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
