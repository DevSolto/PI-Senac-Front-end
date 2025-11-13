import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface RangeSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface RangeSelectProps {
  value: string | null;
  options: RangeSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const RangeSelect = ({ value, options, onChange, disabled = false }: RangeSelectProps) => (
  <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className="w-[240px] justify-start text-left font-normal">
      <SelectValue placeholder="Selecione um intervalo" />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          <span className="flex flex-col">
            <span>{option.label}</span>
            {option.description ? (
              <span className="text-xs text-muted-foreground">{option.description}</span>
            ) : null}
          </span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
