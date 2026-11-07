import { EYE_CLASS_LABEL } from "@/content/labels";
import { Pill } from "@/components/ui/surface";

const CLASSES = ["very_fresh", "fresh", "not_fresh"] as const;

/* Kerangka confusion matrix yang sengaja kosong: belum ada evaluasi yang dijalankan */
export function EvaluationPlan() {
  return (
    <div className="rounded-[20px] border-2 border-dashed border-line-strong/70 bg-paper p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Pill tone="neutral">Rencana, bukan data</Pill>
        <p className="text-sm text-ink-2">
          Belum ada evaluasi yang dijalankan, jadi semua sel kosong.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[19rem] border-separate border-spacing-1.5 text-left">
          <caption className="sr-only">
            Kerangka confusion matrix mata ikan, belum berisi data
          </caption>
          <thead>
            <tr>
              <th scope="col" className="p-2 text-sm font-medium text-ink-2">
                Kelas sebenarnya / tebakan
              </th>
              {CLASSES.map((cls) => (
                <th
                  key={cls}
                  scope="col"
                  className="p-2 text-center text-sm font-medium"
                >
                  {EYE_CLASS_LABEL[cls].title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLASSES.map((row) => (
              <tr key={row}>
                <th scope="row" className="p-2 text-sm font-medium">
                  {EYE_CLASS_LABEL[row].title}
                </th>
                {CLASSES.map((col) => (
                  <td
                    key={col}
                    className="h-12 rounded-[8px] border border-dashed border-line-strong/50 bg-surface text-center text-ink-3"
                  >
                    <span aria-hidden>·</span>
                    <span className="sr-only">belum diukur</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-ink-2">
        <li>Pisahkan data uji sebelum melatih model.</li>
        <li>Isi matriks dari foto uji yang tidak pernah dilihat model.</li>
        <li>Laporkan per spesies, termasuk kesalahan yang paling berbahaya.</li>
        <li>Ukur waktu inferensi di HP yang dipakai nelayan.</li>
      </ol>
    </div>
  );
}
