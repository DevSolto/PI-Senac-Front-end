import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Factory,
  History,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface CompanyHighlightsProps {
  usersCount: number;
  silosCount: number;
  createdAt: string;
  updatedAt: string;
}

export function CompanyHighlights({
  usersCount,
  silosCount,
  createdAt,
  updatedAt,
}: CompanyHighlightsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5" aria-hidden />
        <span>
          {usersCount} {usersCount === 1 ? 'usuário' : 'usuários'}
        </span>
      </Badge>

      <Badge variant="secondary" className="flex items-center gap-1">
        <Factory className="h-3.5 w-3.5" aria-hidden />
        <span>
          {silosCount} {silosCount === 1 ? 'silo' : 'silos'}
        </span>
      </Badge>

      <TimeHighlight icon={CalendarDays} label="Criada em" value={createdAt} />
      <TimeHighlight icon={History} label="Atualizada em" value={updatedAt} />
    </div>
  );
}

interface TimeHighlightProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function TimeHighlight({ icon: Icon, label, value }: TimeHighlightProps) {
  const date = new Date(value);
  const isValid = !Number.isNaN(date.getTime());

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="font-medium">{label}</span>
      <time dateTime={isValid ? date.toISOString() : undefined}>
        {isValid ? formatDateTime(date) : 'data indisponível'}
      </time>
    </span>
  );
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}
