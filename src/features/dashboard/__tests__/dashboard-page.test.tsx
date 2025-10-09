import { fireEvent, render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import { dashboardOverviewMock } from "@/features/dashboard/mocks";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import type { DashboardOverview } from "@/features/dashboard/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
  appConfig: {
    apiBaseUrl: "https://api.example.com",
    apiSseUrl: "https://api.example.com/events",
    apiKey: undefined,
    apiJwt: undefined,
    apiRequestTimeoutMs: 10_000,
  },
}));

vi.mock("@/features/dashboard/hooks/use-dashboard-overview");
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("deviceId=device-test"),
}));

const mockUseDashboardOverview = vi.mocked(useDashboardOverview);

type DashboardOverviewHookResult = {
  data: DashboardOverview | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<DashboardOverview>;
  refresh: () => Promise<DashboardOverview>;
};

function createHookResult(data: DashboardOverview): DashboardOverviewHookResult {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn().mockResolvedValue(data),
    refresh: vi.fn().mockResolvedValue(data),
  };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseDashboardOverview.mockReturnValue(createHookResult(structuredClone(dashboardOverviewMock)));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders KPI metrics with accessible controls", async () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    render(<DashboardPage />);

    const metricEntries = Object.entries(dashboardOverviewMock.metrics) as [
      keyof DashboardOverview["metrics"],
      (typeof dashboardOverviewMock.metrics)[keyof DashboardOverview["metrics"]],
    ][];

    metricEntries.forEach(([, metric]) => {
      expect(screen.getByRole("button", { name: `Ver detalhes da métrica ${metric.label}` })).toBeInTheDocument();
    });

    const [firstMetricKey, firstMetric] = metricEntries[0];

    fireEvent.click(screen.getByRole("button", { name: `Ver detalhes da métrica ${firstMetric.label}` }));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Selecionar métrica para detalhamento futuro:",
      firstMetricKey,
    );

    consoleSpy.mockRestore();
  });

  it("announces the current sensor status through a live region", () => {
    render(<DashboardPage />);

    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(banner).toHaveTextContent("Atenção: Verifique os sensores com anomalias detectadas.");
    expect(banner).toHaveTextContent("6 offline");
    expect(banner).toHaveTextContent("6 manutenção");
    expect(banner).toHaveTextContent("4 bateria crítica");
  });

  it("exibe os alertas críticos e permite navegar para a lista completa", async () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    render(<DashboardPage />);

    dashboardOverviewMock.criticalAlerts.forEach((alert) => {
      expect(screen.getByText(alert.alertType)).toBeInTheDocument();
      expect(screen.getByText(alert.description)).toBeInTheDocument();
    });

    const viewAllButton = screen.getByRole("button", { name: "Ver todos os alertas críticos" });
    fireEvent.click(viewAllButton);

    expect(consoleSpy).toHaveBeenCalledWith("Navegar para a lista completa de alertas críticos");

    consoleSpy.mockRestore();
  });

  it("mostra estado vazio quando não há alertas críticos ativos", () => {
    const emptyOverview: DashboardOverview = {
      ...structuredClone(dashboardOverviewMock),
      criticalAlerts: [],
    };

    mockUseDashboardOverview.mockReturnValueOnce(createHookResult(emptyOverview));

    render(<DashboardPage />);

    expect(screen.getByText("Nenhum alerta crítico ativo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Os sensores não registraram alertas críticos recentemente. Continue monitorando para reagir rapidamente a novas ocorrências.",
      ),
    ).toBeInTheDocument();
  });
});
