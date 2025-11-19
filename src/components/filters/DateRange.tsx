import { CalendarIcon, X } from 'lucide-react';
import { useMemo } from 'react';
import type { DateRange as DayPickerRange } from 'react-day-picker';
import type { Locale } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDateRange } from '@/lib/date';
import { cn } from '@/components/ui/utils';

export interface DateRangeProps {
  value: { from?: Date; to?: Date };
  onChange: (value: DayPickerRange | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
  className?: string;
}

const buildLabel = (from: Date | undefined, to: Date | undefined, locale: Locale) =>
  formatDateRange({ from: from ?? null, to: to ?? null }, locale) ?? 'Período completo';

export const DateRange = ({
  value,
  onChange,
  disabled = false,
  minDate,
  maxDate,
  locale = ptBR,
  className,
}: DateRangeProps) => {
  const label = useMemo(
    () => buildLabel(value.from, value.to, locale),
    [locale, value.from, value.to],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-start text-left font-normal', className)}
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
          fromDate={minDate}
          toDate={maxDate}
          locale={locale}
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
