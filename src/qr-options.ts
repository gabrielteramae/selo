export const ECC_LEVELS = ["L", "M", "Q", "H"] as const;

export type EccLevel = (typeof ECC_LEVELS)[number];

export const ECC_COPY: Record<EccLevel, { title: string; detail: string }> = {
  L: { title: "L", detail: "cerca de 7% — cabe mais texto" },
  M: { title: "M", detail: "cerca de 15% — o padrão" },
  Q: { title: "Q", detail: "cerca de 25%" },
  H: { title: "H", detail: "cerca de 30% — aguenta sujeira" },
};

export const SIZE_MIN = 160;
export const SIZE_MAX = 640;
export const SIZE_STEP = 16;
export const DEFAULT_SIZE = 256;
export const DEFAULT_FOREGROUND = "#101614";
export const DEFAULT_BACKGROUND = "#f4f1ea";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string): boolean {
  return HEX.test(value);
}

type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

export function isInverted(foreground: string, background: string): boolean {
  return relativeLuminance(foreground) > relativeLuminance(background);
}

/** Scanners want a clear gap. Below 4:1 the symbol often fails in practice. */
export const MIN_SCAN_CONTRAST = 4;

export function contrastWarning(foreground: string, background: string): string | null {
  if (!isHexColor(foreground) || !isHexColor(background)) return null;
  if (foreground.toLowerCase() === background.toLowerCase()) {
    return "Primeiro plano e fundo estão iguais. O código não aparece.";
  }
  const ratio = contrastRatio(foreground, background);
  if (ratio < MIN_SCAN_CONTRAST) {
    return `Contraste ${ratio.toFixed(1)}:1. Abaixo de 4:1 muitos leitores falham.`;
  }
  if (isInverted(foreground, background)) {
    return "Código invertido (claro sobre escuro). Alguns leitores recusam.";
  }
  return null;
}

export function bareHostHint(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return null;
  // `exemplo.com:8080` has a colon, but it is a port — not a URI scheme.
  const schemeWithoutSlashes = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const hostWithPort = /^[a-z0-9.-]+\.[a-z]{2,}:\d+/i.test(trimmed);
  if (schemeWithoutSlashes && !hostWithPort) return null;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?([/?#].*)?$/i.test(trimmed)) {
    return "Sem https://, a maioria dos celulares não abre isso como link.";
  }
  return null;
}

export function qrErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "";
  if (/too big|too large|maximum/i.test(raw)) {
    return "Texto longo demais para este nível de correção. Encurte ou escolha L.";
  }
  return "Não deu para montar o código. Confira o texto e as cores.";
}
