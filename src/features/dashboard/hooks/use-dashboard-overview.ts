import { useCallback, useMemo, useState } from "react";

import { dashboardOverviewMock } from "../mocks";
import { DashboardOverview } from "../types";

interface UseDashboardOverviewResult {
  data: DashboardOverview | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<DashboardOverview>;
}

export const useDashboardOverview = (): UseDashboardOverviewResult => {
  const [data] = useState<DashboardOverview | null>(dashboardOverviewMock);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  const isError = useMemo(() => error !== null, [error]);

  const refetch = useCallback(async () => {
    return dashboardOverviewMock;
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};
