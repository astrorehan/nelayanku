import { encode } from "uqr";
import { LOGO_EYE, LOGO_VIEWBOX, MARK_PATH, WORDMARK_PATH } from "@/components/brand/logo";
import { GRADE_LABEL } from "@/content/labels";
import { localDateOf } from "@/data/demo-clock";
import type { BatchView } from "@/data/queries/batches";
import type { Kub } from "@/data/types";
import type { SellableGrade } from "@/domain/grade";
import { formatClock, formatScore, formatShortDate } from "@/lib/format";

export const LABEL_WIDTH_DOTS = 480;
export const LABEL_HEIGHT_DOTS = 320;
const MARGIN = 24;
const RIGHT_COLUMN_X = 236;
const RIGHT_EDGE = LABEL_WIDTH_DOTS - 10;
const QR_AREA = 180;
const SMALLEST_TEXT = 12;

export interface ShippingLabelData {
  code: string;
  grade: SellableGrade;
  speciesName: string;
  weightKg: number;
  score: number;
  landedAt: string;
  iced: boolean;
  fisherCount: number;
  kubLine: string;
  buyerName: string;
  simulated: boolean;
}

export function shippingLabelData(view: BatchView, kub: Kub): ShippingLabelData | null {
  if (!view.batchGrade || view.batchGrade === "REJECT" || !view.earliestLandedAt || view.averageScore === null) {
    return null;
  }
  return {
    code: view.batch.code,
    grade: view.batchGrade,
    speciesName: view.species.name,
    weightKg: view.filledKg,
    score: view.averageScore,
    landedAt: view.earliestLandedAt,
    iced: view.allIced,
    fisherCount: new Set(view.contributions.map((contribution) => contribution.fisher.id)).size,
    kubLine: `${kub.name}, ${kub.regency}`,
    buyerName: view.buyer.name,
    simulated: true,
  };
}

export function shippingLabelDescription(data: ShippingLabelData): string {
  return [
    `Label kiriman ${data.code}`,
    `${data.speciesName} mutu ${data.grade} ${GRADE_LABEL[data.grade].toLowerCase()}`,
    `${formatScore(data.weightKg)} kg`,
    `skor ${formatScore(data.score)}`,
    `darat ${formatClock(data.landedAt)}`,
    data.iced ? "pakai es" : "tanpa es",
    `${data.fisherCount} nelayan`,
    `untuk ${data.buyerName}`,
  ].join(", ");
}

function cssFontFamily(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function fitText(context: CanvasRenderingContext2D, text: string, weight: number, size: number, family: string, maxWidth: number) {
  let fontSize = size;
  context.font = `${weight} ${fontSize}px ${family}`;
  while (context.measureText(text).width > maxWidth && fontSize > SMALLEST_TEXT) {
    fontSize -= 0.5;
    context.font = `${weight} ${fontSize}px ${family}`;
  }
  let fitted = text;
  while (context.measureText(fitted).width > maxWidth && fitted.length > 4) {
    fitted = `${fitted.slice(0, -2)}…`;
  }
  return fitted;
}

function drawQr(context: CanvasRenderingContext2D, text: string) {
  const qr = encode(text, { ecc: "M", border: 0 });
  const moduleSize = Math.floor(QR_AREA / qr.size);
  qr.data.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) {
        context.fillRect(MARGIN + x * moduleSize, MARGIN + y * moduleSize, moduleSize, moduleSize);
      }
    }),
  );
  return MARGIN + qr.size * moduleSize;
}

function drawLogo(context: CanvasRenderingContext2D, x: number, y: number, height: number) {
  const scale = height / LOGO_VIEWBOX.height;
  const { cx, cy, r } = LOGO_EYE;
  const eyeHole = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.translate(-LOGO_VIEWBOX.x, 0);
  context.fill(new Path2D(`${MARK_PATH}${eyeHole}`), "evenodd");
  context.fill(new Path2D(WORDMARK_PATH));
  context.restore();
  return LOGO_VIEWBOX.width * scale;
}

function withLetterSpacing(context: CanvasRenderingContext2D, spacing: string, draw: () => void) {
  const spaced = context as CanvasRenderingContext2D & { letterSpacing?: string };
  const previous = spaced.letterSpacing;
  spaced.letterSpacing = spacing;
  draw();
  spaced.letterSpacing = previous ?? "0px";
}

export async function renderShippingLabel(data: ShippingLabelData, origin: string, scale = 3): Promise<string> {
  const sans = cssFontFamily("--font-sans", "sans-serif");
  const mono = cssFontFamily("--font-mono", "monospace");
  await Promise.all(
    [`800 30px ${sans}`, `700 13px ${sans}`, `700 22px ${mono}`].map((font) => document.fonts.load(font).catch(() => [])),
  );

  const canvas = document.createElement("canvas");
  canvas.width = LABEL_WIDTH_DOTS * scale;
  canvas.height = LABEL_HEIGHT_DOTS * scale;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D is not available");
  }
  context.scale(scale, scale);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, LABEL_WIDTH_DOTS, LABEL_HEIGHT_DOTS);
  context.fillStyle = "#000000";
  context.strokeStyle = "#000000";
  context.textBaseline = "alphabetic";

  const qrBottom = drawQr(context, `${origin}/lacak/${data.code}`);
  context.font = `700 22px ${mono}`;
  withLetterSpacing(context, "1.5px", () => context.fillText(data.code, MARGIN, qrBottom + 40));
  context.font = `700 ${SMALLEST_TEXT}px ${sans}`;
  context.fillText("Pindai: bukti mutu kiriman", MARGIN, qrBottom + 60);

  drawLogo(context, RIGHT_COLUMN_X, 24, 19);
  if (data.simulated) {
    context.lineWidth = 2;
    context.strokeRect(RIGHT_EDGE - 76, 22, 76, 22);
    context.font = `800 ${SMALLEST_TEXT}px ${sans}`;
    context.textAlign = "center";
    withLetterSpacing(context, "1px", () => context.fillText("SIMULASI", RIGHT_EDGE - 38, 37.5));
    context.textAlign = "left";
  }

  context.beginPath();
  context.roundRect(RIGHT_COLUMN_X, 58, 88, 102, 9);
  context.fill();
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.font = `800 66px ${sans}`;
  context.fillText(data.grade, RIGHT_COLUMN_X + 44, 128);
  context.font = `800 ${SMALLEST_TEXT}px ${sans}`;
  withLetterSpacing(context, "1.5px", () => context.fillText(GRADE_LABEL[data.grade].toUpperCase(), RIGHT_COLUMN_X + 44, 150));
  context.textAlign = "left";
  context.fillStyle = "#000000";

  const factsX = RIGHT_COLUMN_X + 100;
  const factsWidth = RIGHT_EDGE - factsX;
  context.fillText(fitText(context, data.speciesName, 800, 21, sans, factsWidth), factsX, 80);
  context.fillText(fitText(context, `${formatScore(data.weightKg)} kg`, 800, 31, sans, factsWidth), factsX, 114);
  context.font = `700 13px ${sans}`;
  context.fillText(`skor ${formatScore(data.score)}`, factsX, 138);
  context.fillText("gaya SNI 2729", factsX, 155);

  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(RIGHT_COLUMN_X, 172);
  context.lineTo(RIGHT_EDGE, 172);
  context.stroke();

  const year = localDateOf(data.landedAt).slice(0, 4);
  const lines = [
    `Darat ${formatClock(data.landedAt)} WIB, ${formatShortDate(data.landedAt)} ${year}`,
    `Es: ${data.iced ? "YA" : "TIDAK"} · ${data.fisherCount} nelayan`,
    data.kubLine,
    `Untuk: ${data.buyerName}`,
  ];
  lines.forEach((line, index) => {
    context.fillText(fitText(context, line, 700, 13.5, sans, RIGHT_EDGE - RIGHT_COLUMN_X), RIGHT_COLUMN_X, 194 + index * 21);
  });

  context.beginPath();
  context.moveTo(MARGIN, 282);
  context.lineTo(RIGHT_EDGE, 282);
  context.stroke();
  const footer = `Simpan dingin 0–4 °C · Cek ulang saat terima · ${new URL(origin).host}/lacak`;
  context.fillText(fitText(context, footer, 700, 12.5, sans, RIGHT_EDGE - MARGIN), MARGIN, 304);

  return canvas.toDataURL("image/png");
}
