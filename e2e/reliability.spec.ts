import { expect, test } from "@playwright/test";

test.setTimeout(60_000);

const routes = [
  "/",
  "/coba",
  "/masuk",
  "/juri",
  "/kub",
  "/kub/darat",
  "/kub/bayar",
  "/kub/dampak",
  "/kub/pesanan",
  "/kub/harga",
  "/kub/anggota",
  "/nelayan",
  "/nelayan/tangkapan",
  "/nelayan/uang",
  "/nelayan/pinjaman",
  "/nelayan/harga",
  "/pembeli",
  "/pembeli/pesan",
  "/pembeli/pesanan",
  "/pembeli/dokumen",
  "/pembeli/harga",
  "/umkm",
  "/umkm/studio",
  "/umkm/bahan",
  "/umkm/produk",
  "/umkm/izin",
  "/lacak",
  "/lacak/CKL-B-0511",
  "/tentang/model",
  "/lacak/bahan/bahan-darat-2026-10-29-darman",
];

test("semua halaman utama terbuka tanpa galat dan tanpa gulir horizontal", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("bukti mutu publik menyamarkan nelayan dan dapat dicetak", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.print = () => undefined;
  });
  await page.goto("/lacak/CKL-B-0511");
  await expect(page.getByText(/Nelayan #/).first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    /Pak Darman|Pak Herman|Pak Rusli/,
  );
  await page
    .getByRole("button", { name: "Cetak / simpan PDF", exact: true })
    .click();
  const document = page.frameLocator('iframe[title="Dokumen mutu CKL-B-0511"]');
  await expect(
    document.getByRole("heading", { name: "Dokumen mutu CKL-B-0511" }),
  ).toBeAttached();
  await expect(document.locator("body")).not.toContainText(
    /Pak Darman|Pak Herman|Pak Rusli/,
  );
  await expect(document.locator("body")).toContainText("SHA-256");
});

test("pendaratan tersimpan dan bisa dimuat ulang tanpa sinyal", async ({
  page,
  context,
}) => {
  test.setTimeout(60_000);
  await page.goto("/kub");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.goto("/kub/darat");
  await page.getByRole("button", { name: /Darman/ }).click();
  await page.getByRole("radio", { name: "Ya, pakai es" }).locator("..").click();
  await page.getByRole("button", { name: "6", exact: true }).click();
  await page.getByRole("button", { name: "Lanjut: foto" }).click();
  await expect(
    page.getByRole("button", { name: "Lanjut: bau dan tekstur" }),
  ).toBeVisible();
  await page.goto("/kub");
  await expect(page.getByText("Tanpa sinyal · tersimpan di HP")).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nelayanku.demo.database")!),
  );
  expect(
    saved.landings.some(
      (item: { fisherId: string; weightKg: number }) =>
        item.fisherId === "nelayan-darman" && item.weightKg === 6,
    ),
  ).toBe(true);
  await context.setOffline(false);
});

test("ruang simpan ditolak ditampilkan kepada pengguna", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/kub");
  await expect(
    page.getByText("Catatan belum tersimpan di perangkat", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Belum tersimpan · jangan tutup halaman", { exact: true }),
  ).toBeAttached();
});
