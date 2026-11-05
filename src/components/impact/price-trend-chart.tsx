"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { PriceComparisonPoint } from "@/data/queries/impact";
import { formatRupiah, formatShortDate, formatShortDayDate } from "@/lib/format";

const HEIGHT = 248;
const WIDE_MARGIN = { top: 16, right: 96, bottom: 32, left: 60 };
const NARROW_MARGIN = { top: 16, right: 78, bottom: 32, left: 50 };
const NARROW_BELOW = 480;
const FISHER_COLOR = "var(--color-series-order)";
const PORT_COLOR = "var(--color-series-auction)";
const GRID_COLOR = "var(--color-paper-deep)";
const SURFACE_COLOR = "var(--color-surface)";
const END_LABEL_MIN_GAP = 36;

function useElementWidth() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, width] as const;
}

function niceScale(minimum: number, maximum: number, targetTicks = 4) {
  const rawStep = Math.max(1, (maximum - minimum) / targetTicks);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rawStep) ?? rawStep;
  const low = Math.floor(minimum / step) * step;
  const high = Math.ceil(maximum / step) * step;
  const ticks: number[] = [];
  for (let value = low; value <= high + step / 2; value += step) {
    ticks.push(value);
  }
  return { low, high, ticks };
}

const tickLabel = (value: number) => `Rp${Math.round(value / 1000)} rb`;
const dateAt = (date: string) => `${date}T12:00:00+07:00`;

function linePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

function spreadEndLabels(first: number, second: number): [number, number] {
  const gap = Math.abs(first - second);
  if (gap >= END_LABEL_MIN_GAP) {
    return [first, second];
  }
  const push = (END_LABEL_MIN_GAP - gap) / 2;
  return first < second ? [first - push, second + push] : [first + push, second - push];
}

export function PriceTrendChart({ points, speciesName }: { points: PriceComparisonPoint[]; speciesName: string }) {
  const reduceMotion = useReducedMotion();
  const [measure, width] = useElementWidth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const narrow = width < NARROW_BELOW;
  const MARGIN = narrow ? NARROW_MARGIN : WIDE_MARGIN;

  const fisherPoints = points.flatMap((point, index) => (point.fisherPricePerKg === null ? [] : [{ index, value: point.fisherPricePerKg }]));
  const values = [...points.map((point) => point.portPricePerKg), ...fisherPoints.map((point) => point.value)];
  const scale = niceScale(Math.min(...values), Math.max(...values));
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const xAt = (index: number) => MARGIN.left + (points.length <= 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const yAt = (value: number) => MARGIN.top + (1 - (value - scale.low) / (scale.high - scale.low)) * plotHeight;

  const portLine = points.map((point, index) => ({ x: xAt(index), y: yAt(point.portPricePerKg) }));
  const fisherLine = fisherPoints.map((point) => ({ x: xAt(point.index), y: yAt(point.value) }));
  const lastPort = points[points.length - 1];
  const lastFisher = fisherPoints[fisherPoints.length - 1];
  const [fisherLabelY, portLabelY] = spreadEndLabels(
    lastFisher ? yAt(lastFisher.value) : -100,
    lastPort ? yAt(lastPort.portPricePerKg) : -100,
  );
  const lastIndex = points.length - 1;
  const xTickIndexes = [
    ...new Set(narrow ? [0, Math.round(lastIndex / 2), lastIndex] : [0, Math.round(lastIndex / 3), Math.round((lastIndex * 2) / 3), lastIndex]),
  ];

  const pickIndexAt = (event: PointerEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const share = (event.clientX - bounds.left) / Math.max(1, bounds.width);
    setActiveIndex(Math.max(0, Math.min(points.length - 1, Math.round(share * (points.length - 1)))));
  };

  const moveWithKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const step = event.key === "ArrowLeft" ? -1 : 1;
    setActiveIndex((current) => Math.max(0, Math.min(points.length - 1, (current ?? points.length - 1) + step)));
  };

  const active = activeIndex === null ? null : points[activeIndex];
  const activeX = activeIndex === null ? 0 : xAt(activeIndex);
  const tooltipOnLeft = activeX > MARGIN.left + plotWidth / 2;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem] text-ink-2" aria-label="Keterangan garis">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: FISHER_COLOR }} />
          Diterima nelayan lewat pesanan
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: PORT_COLOR }} />
          Harga TPI
        </li>
      </ul>
      <div
        ref={measure}
        tabIndex={0}
        role="group"
        aria-label={`Grafik harga ${speciesName.toLowerCase()} per kg. Geser dengan panah kiri dan kanan untuk membaca tiap hari.`}
        onKeyDown={moveWithKeys}
        onFocus={() => setActiveIndex((current) => current ?? points.length - 1)}
        onBlur={() => setActiveIndex(null)}
        className="relative rounded-[12px] outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
        style={{ height: HEIGHT }}
      >
        {width > 0 && points.length > 0 && (
          <svg width={width} height={HEIGHT} aria-hidden className="block overflow-visible">
            {scale.ticks.map((tick) => (
              <g key={tick}>
                <line x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={yAt(tick)} y2={yAt(tick)} stroke={GRID_COLOR} strokeWidth={1} />
                <text x={MARGIN.left - 10} y={yAt(tick)} textAnchor="end" dominantBaseline="middle" className="tabular fill-ink-2 text-[0.8125rem]">
                  {tickLabel(tick)}
                </text>
              </g>
            ))}
            {xTickIndexes.map((index) => (
              <text
                key={index}
                x={xAt(index)}
                y={HEIGHT - 8}
                textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
                className="fill-ink-2 text-[0.8125rem]"
              >
                {formatShortDate(dateAt(points[index].date))}
              </text>
            ))}

            <motion.path
              d={linePath(portLine)}
              fill="none"
              stroke={PORT_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 0.8, 0.24, 1] }}
            />
            <motion.path
              d={linePath(fisherLine)}
              fill="none"
              stroke={FISHER_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 0.8, 0.24, 1] }}
            />
            {fisherLine.map((point) => (
              <circle key={point.x} cx={point.x} cy={point.y} r={4} fill={FISHER_COLOR} stroke={SURFACE_COLOR} strokeWidth={2} />
            ))}
            {lastPort && <circle cx={xAt(points.length - 1)} cy={yAt(lastPort.portPricePerKg)} r={4} fill={PORT_COLOR} stroke={SURFACE_COLOR} strokeWidth={2} />}

            {lastFisher && (
              <text x={MARGIN.left + plotWidth + 12} y={fisherLabelY} dominantBaseline="middle" className="fill-ink">
                <tspan x={MARGIN.left + plotWidth + 12} dy="-0.45em" className="tabular text-[0.9375rem] font-bold">
                  {formatRupiah(lastFisher.value)}
                </tspan>
                <tspan x={MARGIN.left + plotWidth + 12} dy="1.2em" className="fill-ink-2 text-[0.8125rem]">
                  nelayan
                </tspan>
              </text>
            )}
            {lastPort && (
              <text x={MARGIN.left + plotWidth + 12} y={portLabelY} dominantBaseline="middle" className="fill-ink">
                <tspan x={MARGIN.left + plotWidth + 12} dy="-0.45em" className="tabular text-[0.9375rem] font-bold">
                  {formatRupiah(lastPort.portPricePerKg)}
                </tspan>
                <tspan x={MARGIN.left + plotWidth + 12} dy="1.2em" className="fill-ink-2 text-[0.8125rem]">
                  TPI
                </tspan>
              </text>
            )}

            {active && (
              <line x1={activeX} x2={activeX} y1={MARGIN.top} y2={MARGIN.top + plotHeight} stroke="var(--color-ink)" strokeWidth={1} opacity={0.5} />
            )}
            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={plotWidth}
              height={plotHeight}
              fill="transparent"
              onPointerMove={pickIndexAt}
              onPointerDown={pickIndexAt}
              onPointerLeave={() => setActiveIndex(null)}
            />
          </svg>
        )}
        {active && (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 flex min-w-44 flex-col gap-1.5 rounded-[12px] border border-line bg-surface px-3.5 py-2.5 shadow-floating"
            style={tooltipOnLeft ? { right: width - activeX + 12 } : { left: activeX + 12 }}
          >
            <span className="text-[0.875rem] font-semibold text-ink-2">{formatShortDayDate(dateAt(active.date))}</span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-0.5 w-3.5 rounded-full" style={{ background: FISHER_COLOR }} />
              {active.fisherPricePerKg === null ? (
                <span className="text-[0.875rem] text-ink-2">tidak ada kiriman diterima</span>
              ) : (
                <>
                  <b className="tabular">{formatRupiah(active.fisherPricePerKg)}</b>
                  <span className="text-[0.875rem] text-ink-2">nelayan</span>
                </>
              )}
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-0.5 w-3.5 rounded-full" style={{ background: PORT_COLOR }} />
              <b className="tabular">{formatRupiah(active.portPricePerKg)}</b>
              <span className="text-[0.875rem] text-ink-2">TPI</span>
            </span>
          </div>
        )}
      </div>
      <details className="group">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-semibold text-ink-2 underline decoration-dotted underline-offset-4 hover:text-ink [&::-webkit-details-marker]:hidden">
          Lihat sebagai tabel
        </summary>
        <div className="mt-2 max-h-72 overflow-y-auto rounded-[12px] border border-line">
          <table className="w-full text-left text-[0.9375rem]">
            <caption className="sr-only">Harga {speciesName.toLowerCase()} per kg per hari</caption>
            <thead className="sticky top-0 bg-paper-deep">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Tanggal
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  Nelayan
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  TPI
                </th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((point) => (
                <tr key={point.date} className="border-t border-line">
                  <td className="px-3 py-2">{formatShortDayDate(dateAt(point.date))}</td>
                  <td className="tabular px-3 py-2 text-right">{point.fisherPricePerKg === null ? "—" : formatRupiah(point.fisherPricePerKg)}</td>
                  <td className="tabular px-3 py-2 text-right">{formatRupiah(point.portPricePerKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
