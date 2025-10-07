import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type HSL = [number, number, number];

const cssContent = readFileSync(path.resolve(__dirname, "../../styles/globals.css"), "utf8");

function extractTokens(block: string): Record<string, HSL> {
  const tokens: Record<string, HSL> = {};
  const tokenRegex = /--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(block)) !== null) {
    const [, name, h, s, l] = match;
    tokens[name] = [Number(h), Number(s), Number(l)];
  }

  return tokens;
}

function hslToRgb([h, s, l]: HSL): [number, number, number] {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [f(0), f(8), f(4)].map((channel) => Math.round(channel * 255)) as [number, number, number];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const normalize = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
  };

  const [nr, ng, nb] = [r, g, b].map(normalize) as [number, number, number];

  return 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
}

function contrastRatio(background: HSL, foreground: HSL): number {
  const bgLuminance = relativeLuminance(hslToRgb(background));
  const fgLuminance = relativeLuminance(hslToRgb(foreground));
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

const rootBlock = cssContent.match(/:root\s*{([\s\S]*?)}/);
const darkBlock = cssContent.match(/\.dark\s*{([\s\S]*?)}/);

if (!rootBlock || !darkBlock) {
  throw new Error("Não foi possível localizar os tokens de cor em globals.css");
}

const rootTokens = extractTokens(rootBlock[1]);
const darkTokens = extractTokens(darkBlock[1]);

const combinations: Array<{ background: string; foreground: string; minimum: number }> = [
  { background: "background", foreground: "foreground", minimum: 4.5 },
  { background: "secondary", foreground: "secondary-foreground", minimum: 4.5 },
  { background: "muted", foreground: "muted-foreground", minimum: 4.5 },
  { background: "accent", foreground: "accent-foreground", minimum: 4.5 },
  { background: "destructive", foreground: "destructive-foreground", minimum: 4.5 },
];

describe("Tokens de cor", () => {
  it("garantem contraste mínimo no tema claro", () => {
    combinations.forEach(({ background, foreground, minimum }) => {
      const ratio = contrastRatio(rootTokens[background], rootTokens[foreground]);
      expect(ratio).toBeGreaterThanOrEqual(minimum);
    });
  });

  it("garantem contraste mínimo no tema escuro", () => {
    combinations.forEach(({ background, foreground, minimum }) => {
      const ratio = contrastRatio(darkTokens[background], darkTokens[foreground]);
      expect(ratio).toBeGreaterThanOrEqual(minimum);
    });
  });
});
