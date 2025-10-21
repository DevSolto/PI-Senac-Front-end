import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Company } from '@/shared/api/companies.types';
import { Button } from '@/components/ui/button';

import { CompanyHighlights } from './CompanyHighlights';

interface CompanyCardProps {
  company: Company;
  showId?: boolean;
}

export function CompanyCard({ company, showId = false }: CompanyCardProps) {
  return (
    <Card data-company-id={company.id}>
      <CardHeader className="gap-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold leading-tight">
            {company.name}
          </CardTitle>
          {showId ? (
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
              ID {company.id}
            </Badge>
          ) : null}
        </div>
        <CardAction className="self-start">
          {/* TODO: Substituir por navegação para a página de detalhes da companhia */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            aria-disabled={true}
            title="Visualização detalhada disponível em breve"
          >
            Ver detalhes
          </Button>
        </CardAction>
        <CardDescription className="font-mono text-xs uppercase tracking-wide">
          CNPJ {company.CNPJ}
        </CardDescription>
        {company.address ? (
          <CardDescription className="text-sm leading-relaxed">
            {company.address}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <CompanyHighlights
          usersCount={company.users.length}
          silosCount={company.silos.length}
          createdAt={company.createdAt}
          updatedAt={company.updatedAt}
        />

        {company.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {company.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function CompanyCardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}
