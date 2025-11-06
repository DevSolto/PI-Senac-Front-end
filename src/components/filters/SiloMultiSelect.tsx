import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface SiloOption {
  value: string;
  label: string;
}

export interface SiloMultiSelectProps {
  options: SiloOption[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const SiloMultiSelect = ({ options, value, onChange, disabled = false }: SiloMultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const labels = useMemo(() => {
    if (value.length === 0) {
      return 'Todos os silos';
    }

    if (value.length === 1) {
      const option = options.find((item) => item.value === value[0]);
      return option?.label ?? value[0];
    }

    return `${value.length} silos selecionados`;
  }, [options, value]);

  const toggleValue = (option: SiloOption) => {
    const exists = value.includes(option.value);
    const next = exists ? value.filter((item) => item !== option.value) : [...value, option.value];
    onChange(next);
  };

  const removeValue = (optionValue: string) => {
    onChange(value.filter((item) => item !== optionValue));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            disabled={disabled}
          >
            {labels}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Filtrar silo" />
            <CommandEmpty>Nenhum silo encontrado.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        toggleValue(option);
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((selected) => {
            const option = options.find((item) => item.value === selected);
            return (
              <Badge
                key={selected}
                variant="secondary"
                className="flex items-center gap-1"
                onClick={() => removeValue(selected)}
              >
                {option?.label ?? selected}
                <span className="cursor-pointer text-xs">×</span>
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
