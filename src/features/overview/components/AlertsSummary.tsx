import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import type { Alert as AlertData, AlertSeverity } from '@/shared/types';

interface AlertsSummaryProps {
  alerts: AlertData[];
}

const severityStyles: Record<AlertSeverity, { border: string; badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'; badgeClass?: string }> = {
  critical: { border: 'border-l-red-500', badgeVariant: 'destructive' },
  warning: { border: 'border-l-yellow-500', badgeVariant: 'secondary' },
  info: { border: 'border-l-green-500', badgeClass: 'bg-agro-green text-white' },
};

export const AlertsSummary = ({ alerts }: AlertsSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts &amp; Notifications</CardTitle>
        <p className="text-sm text-muted-foreground">Latest system alerts and recommendations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map(({ id, icon: Icon, title, location, description, timestamp, severity, badgeLabel }) => {
            const styles = severityStyles[severity];
            return (
              <Alert key={id} className={cn('border-l-4', styles.border)}>
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{title}</strong>
                      {location ? <span className="font-normal"> - {location}</span> : null}
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className="text-right space-y-1">
                      {badgeLabel ? (
                        <Badge variant={styles.badgeVariant} className={styles.badgeClass}>
                          {badgeLabel}
                        </Badge>
                      ) : null}
                      <p className="text-xs text-muted-foreground">{timestamp}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
