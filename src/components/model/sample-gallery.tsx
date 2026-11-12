import Image from "next/image";
import { SAMPLE_PHOTOS } from "@/ai/sample-photos";
import { EYE_CLASS_LABEL } from "@/content/labels";
import { SimulatedTag } from "@/components/ui/surface";

/* Enam foto contoh dengan kelas dari dataset, bukan tebakan model */
export function SampleGallery() {
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {SAMPLE_PHOTOS.map((photo) => {
          const label = EYE_CLASS_LABEL[photo.trueEyeClass];
          return (
            <li key={photo.id}>
              <figure className="flex flex-col gap-2">
                <div className="relative aspect-square overflow-hidden rounded-[16px] bg-paper-deep">
                  <Image
                    src={photo.eyeImage}
                    alt={`Mata ikan ${photo.speciesName.toLowerCase()}, kelas ${label.title.toLowerCase()}`}
                    fill
                    unoptimized
                    sizes="(min-width: 640px) 240px, 45vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="flex flex-col gap-0.5">
                  <span className="font-semibold">{label.title}</span>
                  <span className="text-sm text-ink-2">{label.reason}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
      <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
        <SimulatedTag />
        Kelas di atas adalah label dataset FFE. Demo mengikuti label itu, model
        terlatih tidak membaca piksel.
      </p>
    </div>
  );
}
