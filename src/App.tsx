import { useEffect, useId, useRef, useState } from "react";
import { toCanvas } from "qrcode";
import { ArrowLeftRight, Download } from "lucide-react";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_FOREGROUND,
  DEFAULT_SIZE,
  ECC_COPY,
  ECC_LEVELS,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_STEP,
  bareHostHint,
  contrastWarning,
  isHexColor,
  qrErrorMessage,
  type EccLevel,
} from "./qr-options";

export function QrStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [ecc, setEcc] = useState<EccLevel>("M");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [drawnSize, setDrawnSize] = useState<number | null>(null);

  const textId = useId();
  const fgId = useId();
  const bgId = useId();
  const sizeId = useId();
  const eccId = useId();
  const statusId = useId();

  const fgOk = isHexColor(foreground);
  const bgOk = isHexColor(background);
  const warning = contrastWarning(foreground, background);
  const hostHint = bareHostHint(text);
  const sheet = bgOk ? background : DEFAULT_BACKGROUND;
  const ink = fgOk ? foreground : DEFAULT_FOREGROUND;

  useEffect(() => {
    if (text.length === 0) {
      setReady(false);
      setError(null);
      setDrawnSize(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!fgOk || !bgOk) {
      const ctx = canvas.getContext("2d");
      canvas.width = size;
      canvas.height = size;
      ctx?.clearRect(0, 0, size, size);
      setReady(false);
      setError(null);
      setDrawnSize(null);
      return;
    }

    let cancelled = false;
    toCanvas(canvas, text, {
      errorCorrectionLevel: ecc,
      width: size,
      margin: 4,
      color: { dark: foreground, light: background },
    })
      .then(() => {
        if (cancelled) return;
        setReady(true);
        setError(null);
        setDrawnSize(canvas.width);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setReady(false);
        setDrawnSize(null);
        setError(qrErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [text, foreground, background, size, ecc, fgOk, bgOk]);

  function swapColors() {
    setForeground(background);
    setBackground(foreground);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "selo.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const sizeNote =
    ready && drawnSize !== null && drawnSize !== size
      ? `O símbolo precisou de ${drawnSize} px — mais do que os ${size} px pedidos.`
      : null;

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-x-10 gap-y-6 px-5 py-7 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] md:py-10">
      <header className="md:col-span-2">
        <h1 className="font-display text-4xl tracking-tight text-cream text-balance">Selo</h1>
        <p className="mt-2 max-w-md text-base text-mist text-pretty">
          Código QR enquanto você digita. O arquivo sai em PNG, no tamanho escolhido.
        </p>
      </header>

      <div className="flex flex-col gap-2 md:col-start-1">
        <label htmlFor={textId} className="text-sm font-semibold text-cream">
          Texto ou URL
        </label>
        <textarea
          id={textId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="https://… ou qualquer texto"
          aria-describedby={hostHint ? `${textId}-hint` : undefined}
          className="min-h-24 w-full resize-y rounded-lg border border-line bg-panel px-3 py-3 text-base text-cream placeholder:text-mist/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
        />
        <p className="text-sm text-mist tabular-nums">
          {text.length === 0 ? "Nada digitado ainda." : `${text.length} caracteres, gravados como estão.`}
        </p>
        {hostHint ? (
          <p id={`${textId}-hint`} className="text-sm text-amber">
            {hostHint}
          </p>
        ) : null}
      </div>

      <aside className="flex flex-col gap-3 md:col-start-2 md:row-span-5 md:row-start-2">
        <h2 className="text-sm font-semibold text-cream">Prévia</h2>
        <div className="rounded-xl border border-line p-4" style={{ backgroundColor: sheet }}>
          {text.length === 0 ? (
            <p className="flex min-h-48 items-center justify-center px-4 text-center text-sm" style={{ color: ink }}>
              O código aparece aqui, no instante em que você digita.
            </p>
          ) : (
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={ready ? "Código QR do texto digitado" : "Prévia do código QR"}
              className="mx-auto block h-auto max-w-full"
              style={{ width: size }}
            />
          )}
        </div>
        <p className="text-sm text-mist">
          {ready
            ? `PNG de ${drawnSize ?? size} px. Na tela, encolhe se não couber.`
            : "O botão de download libera quando o código está pronto."}
        </p>
        <div id={statusId} role="status" className="flex flex-col gap-1">
          {error ? <p className="text-sm text-amber">{error}</p> : null}
          {warning ? <p className="text-sm text-amber">{warning}</p> : null}
          {sizeNote ? <p className="text-sm text-amber">{sizeNote}</p> : null}
        </div>
        <button
          type="button"
          onClick={download}
          disabled={!ready}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-leaf-ink transition-colors duration-200 hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="size-4" aria-hidden="true" />
          Baixar PNG
        </button>
      </aside>

      <fieldset className="flex flex-col gap-3 md:col-start-1">
        <legend className="text-sm font-semibold text-cream">Cores</legend>
        <ColorField
          id={fgId}
          label="Primeiro plano"
          value={foreground}
          fallback={DEFAULT_FOREGROUND}
          onChange={setForeground}
        />
        <ColorField
          id={bgId}
          label="Fundo"
          value={background}
          fallback={DEFAULT_BACKGROUND}
          onChange={setBackground}
        />
        <button
          type="button"
          onClick={swapColors}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-line bg-panel px-3 text-sm font-semibold text-cream transition-colors duration-200 hover:border-leaf"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Inverter cores
        </button>
      </fieldset>

      <div className="flex flex-col gap-2 md:col-start-1">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={sizeId} className="text-sm font-semibold text-cream">
            Tamanho
          </label>
          <span className="text-sm text-mist tabular-nums">{size} px</span>
        </div>
        <input
          id={sizeId}
          type="range"
          min={SIZE_MIN}
          max={SIZE_MAX}
          step={SIZE_STEP}
          value={size}
          onChange={(event) => setSize(Number(event.target.value))}
          aria-valuemin={SIZE_MIN}
          aria-valuemax={SIZE_MAX}
          aria-valuenow={size}
          aria-valuetext={`${size} pixels`}
          className="h-11 w-full cursor-pointer accent-leaf"
        />
        <p className="text-sm text-mist">
          De {SIZE_MIN} a {SIZE_MAX} px, de 16 em 16. A zona quieta fica em 4 módulos.
        </p>
      </div>

      <div className="flex flex-col gap-2 md:col-start-1">
        <label htmlFor={eccId} className="text-sm font-semibold text-cream">
          Correção de erros
        </label>
        <select
          id={eccId}
          value={ecc}
          onChange={(event) => setEcc(event.target.value as EccLevel)}
          className="min-h-11 w-full rounded-lg border border-line bg-panel px-3 text-base text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
        >
          {ECC_LEVELS.map((level) => (
            <option key={level} value={level}>
              {ECC_COPY[level].title} — {ECC_COPY[level].detail}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  fallback,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  fallback: string;
  onChange: (next: string) => void;
}) {
  const valid = isHexColor(value);
  const picker = valid ? value : fallback;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-mist">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={picker}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Amostra de ${label.toLowerCase()}`}
          className="size-11 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-1"
        />
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={7}
          aria-invalid={!valid}
          aria-describedby={valid ? undefined : `${id}-erro`}
          className="min-h-11 w-full rounded-lg border border-line bg-panel px-3 text-base text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
        />
      </div>
      {valid ? null : (
        <p id={`${id}-erro`} className="text-sm text-amber">
          Use 6 dígitos hexadecimais, com #. Exemplo: {fallback}
        </p>
      )}
    </div>
  );
}
