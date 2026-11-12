import { encode } from "uqr";

export function qrGeometry(value: string) {
  const qr = encode(value, { ecc: "M", border: 4 });
  const path = qr.data
    .flatMap((row, y) =>
      row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : [])),
    )
    .join("");
  return { size: qr.size, path };
}

export function qrMarkup(value: string) {
  const { size, path } = qrGeometry(value);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="120" height="120" role="img" aria-label="QR asal bahan"><rect width="${size}" height="${size}" fill="white"/><path d="${path}" fill="black"/></svg>`;
}
