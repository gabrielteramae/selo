import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bareHostHint,
  contrastRatio,
  contrastWarning,
  isHexColor,
  qrErrorMessage,
} from "./qr-options.ts";

test("preto sobre branco passa de 20:1", () => {
  assert.ok(contrastRatio("#000000", "#ffffff") > 20);
});

test("cores padrão não disparam aviso", () => {
  assert.equal(contrastWarning("#101614", "#f4f1ea"), null);
});

test("contraste baixo cita a razão", () => {
  const warning = contrastWarning("#ff00aa", "#f4f1ea");
  assert.match(warning ?? "", /3\.2:1/);
});

test("host sem esquema avisa, inclusive com porta", () => {
  assert.match(bareHostHint("exemplo.com") ?? "", /https/);
  assert.match(bareHostHint("exemplo.com:8080/a") ?? "", /https/);
  assert.equal(bareHostHint("https://exemplo.com"), null);
  assert.equal(bareHostHint("mailto:a@b.com"), null);
});

test("hex curto não vale", () => {
  assert.equal(isHexColor("#fff"), false);
  assert.equal(isHexColor("#101614"), true);
});

test("payload grande vira mensagem de texto longo", () => {
  assert.match(qrErrorMessage(new Error("The amount of data is too big")), /longo/);
});
