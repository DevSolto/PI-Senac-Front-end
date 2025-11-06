import type { TableRow } from '@/lib/metrics';
import { formatPeriodRange } from '@/lib/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow as TableRowComponent,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export interface DataTableProps {
  rows: TableRow[];
  isLoading?: boolean;
}

const formatNumber = (value: number | null, suffix = '') => {
  if (value === null) {
    return '--';
  }

  return `${
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(value)
  }${suffix}`;
};

export const DataTable = ({ rows, isLoading = false }: DataTableProps) => {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRowComponent>
            <TableHead>Silo</TableHead>
            <TableHead>Período</TableHead>
            <TableHead className="text-right">Temperatura</TableHead>
            <TableHead className="text-right">Umidade</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Alertas</TableHead>
          </TableRowComponent>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRowComponent key={index}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
            </TableRowComponent>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRowComponent>
          <TableHead>Silo</TableHead>
          <TableHead>Período</TableHead>
          <TableHead className="text-right">Temperatura</TableHead>
          <TableHead className="text-right">Umidade</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Alertas</TableHead>
        </TableRowComponent>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRowComponent key={`${row.id}-${row.periodStart.toISOString()}`}>
            <TableCell className="font-medium">{row.siloName}</TableCell>
            <TableCell>{formatPeriodRange(row.periodStart, row.periodEnd)}</TableCell>
            <TableCell className="text-right">{formatNumber(row.averageTemperature, ' °C')}</TableCell>
            <TableCell className="text-right">{formatNumber(row.averageHumidity, ' %')}</TableCell>
            <TableCell className="text-right">{formatNumber(row.environmentScore, ' pts')}</TableCell>
            <TableCell className="text-right">
              {row.alertsCount}
              {row.criticalAlertsCount > 0 ? ` (${row.criticalAlertsCount} críticos)` : ''}
            </TableCell>
          </TableRowComponent>
        ))}
        {rows.length === 0 ? (
          <TableRowComponent>
            <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
              Nenhum registro encontrado para o filtro aplicado.
            </TableCell>
          </TableRowComponent>
        ) : null}
      </TableBody>
    </Table>
  );
};
