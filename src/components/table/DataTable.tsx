import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from 'lucide-react';

import type { TableRow } from '@/lib/metrics';
import { formatPeriodRange } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

type SortColumn =
  | 'period'
  | 'silo'
  | 'alerts'
  | 'criticalAlerts'
  | 'temperature'
  | 'humidity'
  | 'spoilageRiskProbability'
  | 'spoilageRiskCategory';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 10;

const formatNumber = (value: number | null, suffix = '', decimals = 1) => {
  if (value === null) {
    return '--';
  }

  return `${
    new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: Math.min(decimals, 1),
    }).format(value)
  }${suffix}`;
};

const formatRiskProbability = (value: number | null) => {
  if (value === null) {
    return '--';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value);
};

const buildSortValue = (row: TableRow, column: SortColumn) => {
  switch (column) {
    case 'period':
      return row.periodStart.getTime();
    case 'silo':
      return row.siloName.toLocaleLowerCase('pt-BR');
    case 'alerts':
      return row.alertsCount;
    case 'criticalAlerts':
      return row.criticalAlertsCount;
    case 'temperature':
      return row.averageTemperature ?? Number.NEGATIVE_INFINITY;
    case 'humidity':
      return row.averageHumidity ?? Number.NEGATIVE_INFINITY;
    case 'spoilageRiskProbability':
      return row.spoilageRiskProbability ?? Number.NEGATIVE_INFINITY;
    case 'spoilageRiskCategory':
      return row.spoilageRiskCategory?.toLocaleLowerCase('pt-BR') ?? '';
    default:
      return 0;
  }
};

const SortIndicator = ({ active, direction }: { active: boolean; direction: SortDirection }) => {
  if (!active) {
    return <ChevronsUpDown className="ml-1 h-4 w-4" />;
  }

  return direction === 'asc' ? (
    <ArrowUp className="ml-1 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-1 h-4 w-4" />
  );
};

export const DataTable = ({ rows, isLoading = false }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<{ column: SortColumn; direction: SortDirection }>(
    { column: 'period', direction: 'desc' },
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, rows.length]);

  const filteredRows = useMemo(() => {
    const normalized = searchTerm.trim().toLocaleLowerCase('pt-BR');

    if (!normalized) {
      return rows;
    }

    return rows.filter((row) => {
      const period = formatPeriodRange(row.periodStart, row.periodEnd).toLocaleLowerCase('pt-BR');
      const silo = row.siloName.toLocaleLowerCase('pt-BR');
      const riskCategory = row.spoilageRiskCategory?.toLocaleLowerCase('pt-BR') ?? '';
      const riskProbability =
        row.spoilageRiskProbability !== null && row.spoilageRiskProbability !== undefined
          ? formatRiskProbability(row.spoilageRiskProbability)
              .replace('%', '')
              .toLocaleLowerCase('pt-BR')
          : '';

      return (
        period.includes(normalized) ||
        silo.includes(normalized) ||
        riskCategory.includes(normalized) ||
        riskProbability.includes(normalized)
      );
    });
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows].sort((a, b) => {
      const aValue = buildSortValue(a, sort.column);
      const bValue = buildSortValue(b, sort.column);

      if (aValue === bValue) {
        return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.direction === 'asc'
          ? aValue.localeCompare(bValue, 'pt-BR')
          : bValue.localeCompare(aValue, 'pt-BR');
      }

      return sort.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [filteredRows, sort.column, sort.direction]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const start = (page - 1) * PAGE_SIZE;
  const paginatedRows = sortedRows.slice(start, start + PAGE_SIZE);

  const handleSort = (column: SortColumn) => {
    setSort((current) => {
      if (current.column === column) {
        return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      return { column, direction: column === 'period' ? 'desc' : 'asc' };
    });
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const changePage = (next: number) => {
    setPage(Math.min(Math.max(1, next), pageCount));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full md:w-64" />
        <Table>
          <TableHeader>
            <TableRowComponent>
              <TableHead>Período</TableHead>
              <TableHead>Silo</TableHead>
              <TableHead className="text-right">Alertas</TableHead>
              <TableHead className="text-right">Alertas críticos</TableHead>
              <TableHead className="text-right">Temp média</TableHead>
              <TableHead className="text-right">Umidade média</TableHead>
              <TableHead className="text-right">Risco de deterioração</TableHead>
              <TableHead className="text-right">Categoria de risco</TableHead>
            </TableRowComponent>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRowComponent key={index}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              </TableRowComponent>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar por período, silo ou risco"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span>
            Página {page} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(page + 1)}
            disabled={page === pageCount}
          >
            Próxima
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRowComponent>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('period')}
                className="flex w-full items-center justify-start text-left text-sm font-medium"
              >
                Período
                <SortIndicator active={sort.column === 'period'} direction={sort.direction} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('silo')}
                className="flex w-full items-center justify-start text-left text-sm font-medium"
              >
                Silo
                <SortIndicator active={sort.column === 'silo'} direction={sort.direction} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => handleSort('alerts')}
                className="flex w-full items-center justify-end text-sm font-medium"
              >
                Alertas
                <SortIndicator active={sort.column === 'alerts'} direction={sort.direction} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => handleSort('criticalAlerts')}
                className="flex w-full items-center justify-end text-sm font-medium"
              >
                Alertas críticos
                <SortIndicator active={sort.column === 'criticalAlerts'} direction={sort.direction} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => handleSort('temperature')}
                className="flex w-full items-center justify-end text-sm font-medium"
              >
                Temp média
                <SortIndicator active={sort.column === 'temperature'} direction={sort.direction} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => handleSort('humidity')}
                className="flex w-full items-center justify-end text-sm font-medium"
              >
                Umidade média
                <SortIndicator active={sort.column === 'humidity'} direction={sort.direction} />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => handleSort('spoilageRiskProbability')}
                className="flex w-full items-center justify-end text-sm font-medium"
              >
                Risco de deterioração
                <SortIndicator
                  active={sort.column === 'spoilageRiskProbability'}
                  direction={sort.direction}
                />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('spoilageRiskCategory')}
                className="flex w-full items-center justify-start text-left text-sm font-medium"
              >
                Categoria de risco
                <SortIndicator active={sort.column === 'spoilageRiskCategory'} direction={sort.direction} />
              </button>
            </TableHead>
          </TableRowComponent>
        </TableHeader>
        <TableBody>
          {paginatedRows.map((row) => (
            <TableRowComponent key={`${row.id}-${row.periodStart.toISOString()}`}>
              <TableCell className="whitespace-nowrap">
                {formatPeriodRange(row.periodStart, row.periodEnd)}
              </TableCell>
              <TableCell className="font-medium">{row.siloName}</TableCell>
              <TableCell className="text-right">{row.alertsCount.toLocaleString('pt-BR')}</TableCell>
              <TableCell className="text-right">
                {row.criticalAlertsCount.toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="text-right">{formatNumber(row.averageTemperature, ' °C')}</TableCell>
              <TableCell className="text-right">{formatNumber(row.averageHumidity, ' %')}</TableCell>
              <TableCell className="text-right">{formatRiskProbability(row.spoilageRiskProbability)}</TableCell>
              <TableCell>{row.spoilageRiskCategory ?? '--'}</TableCell>
            </TableRowComponent>
          ))}
          {paginatedRows.length === 0 ? (
            <TableRowComponent>
              <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                Nenhum dado encontrado.
              </TableCell>
            </TableRowComponent>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
};
