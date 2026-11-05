export function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function documentTable(headers: string[], rows: Array<Array<string | number>>): string {
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

export function printDocument(title: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.title = title;
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    frame.onload = () => {
      const target = frame.contentWindow;
      if (!target) {
        frame.remove();
        reject(new Error("Dokumen tidak bisa dibuka"));
        return;
      }
      target.addEventListener("afterprint", () => frame.remove(), { once: true });
      target.focus();
      target.print();
      window.setTimeout(() => frame.remove(), 60_000);
      resolve();
    };
    frame.srcdoc = `<!doctype html><html lang="id"><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font:14px/1.5 system-ui,sans-serif;color:#13283a;margin:0}h1{font-size:26px;font-weight:500;margin:0 0 8px}h2{font-size:18px;font-weight:600;margin:24px 0 8px}p{margin:8px 0}table{width:100%;border-collapse:collapse;font-size:12px;margin:16px 0}td,th{border-bottom:1px solid #dcd6ca;text-align:left;padding:8px 4px;vertical-align:top}th{font-weight:600}small{color:#3e4b57}code{overflow-wrap:anywhere}svg{max-width:120px;height:auto}.label{max-width:100mm;border:1px solid #13283a;padding:8mm;break-inside:avoid}.label h1{font-size:24px}.label p{margin:6px 0}</style><body><h1>${escapeHtml(title)}</h1><p><small>Nelayanku · Data simulasi · Gunakan menu cetak untuk simpan sebagai PDF</small></p>${content}</body></html>`;
    document.body.append(frame);
  });
}

export function downloadText(fileName: string, text: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
