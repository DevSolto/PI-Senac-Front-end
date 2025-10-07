import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import type { SpyInstance } from "vitest";

// Garantir limpeza do DOM entre os testes
afterEach(() => {
  cleanup();
});

// Evitar ruído de logs em testes
let errorSpy: SpyInstance | undefined;
let warnSpy: SpyInstance | undefined;

beforeAll(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  errorSpy?.mockRestore();
  warnSpy?.mockRestore();
});
