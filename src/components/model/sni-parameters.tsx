import clsx from "clsx";
import { Icon, type IconName } from "@/components/icons/icon";
import {
  ASSESSED_PARAMETER_COUNT,
  SNI_PARAMETER_COUNT,
} from "@/domain/freshness-score";

type Source = "foto" | "manusia" | "belum";

const PARAMETERS: Array<{
  label: string;
  icon: IconName;
  source: Source;
  note: string;
}> = [
  { label: "Mata", icon: "eye", source: "foto", note: "bisa dari foto" },
  {
    label: "Insang",
    icon: "gill",
    source: "foto",
    note: "foto atau pilihan operator",
  },
  { label: "Bau", icon: "odor", source: "manusia", note: "dicium operator" },
  {
    label: "Tekstur",
    icon: "texture",
    source: "manusia",
    note: "ditekan operator",
  },
  {
    label: "Lendir permukaan",
    icon: "search",
    source: "belum",
    note: "belum dinilai",
  },
  { label: "Daging", icon: "hand", source: "belum", note: "belum dinilai" },
];

const SOURCE_TAG: Record<Source, string> = {
  foto: "bg-sky-tint text-sea-deep",
  manusia: "bg-gold-tint text-gold-deep",
  belum: "bg-paper-deep text-ink-2",
};

const SOURCE_TEXT: Record<Source, string> = {
  foto: "Dinilai",
  manusia: "Dinilai",
  belum: "Tidak dinilai",
};

/* Enam parameter lembar SNI 2729 (RISET.md), empat di antaranya masuk rumus */
export function SniParameters() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-num-m">
        {ASSESSED_PARAMETER_COUNT} dari {SNI_PARAMETER_COUNT} parameter
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PARAMETERS.map((parameter) => {
          const assessed = parameter.source !== "belum";
          return (
            <li
              key={parameter.label}
              className={clsx(
                "flex min-h-28 flex-col gap-2 rounded-[16px] border p-4",
                assessed
                  ? "border-sea bg-sky-tint"
                  : "border-dashed border-line-strong/70 bg-paper",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon
                  name={parameter.icon}
                  size={24}
                  className={assessed ? "text-sea" : "text-ink-3"}
                />
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    SOURCE_TAG[parameter.source],
                  )}
                >
                  {SOURCE_TEXT[parameter.source]}
                </span>
              </div>
              <p className={clsx("font-semibold", !assessed && "text-ink-2")}>
                {parameter.label}
              </p>
              <p className="text-sm text-ink-2">{parameter.note}</p>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-ink-2">
        Enam parameter dari lembar penilaian SNI 2729 (sumber: RISET.md, dari
        jurnal Aquanipa, BRIN 2024). Karena hanya empat yang dinilai, skor ini
        parsial dan tidak boleh disebut sertifikasi SNI.
      </p>
    </div>
  );
}
