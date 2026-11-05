import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });
test.setTimeout(60_000);

const database = "nelayanku.demo.database";

test("juri menilai foto contoh lalu memeriksa batas model", async ({
  page,
}) => {
  await page.goto("/coba");
  await page.getByRole("button", { name: /Contoh 1/ }).click();
  await expect(
    page.getByText(/Hasil: mutu Prima, skor 8,4 dari 9/),
  ).toBeAttached();
  await expect(page.getByText("Model simulasi · di browser")).toBeVisible();
  await page
    .getByRole("link", { name: "Cara AI menilai", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Apa yang dinilai, apa yang belum" }),
  ).toBeVisible();
  await expect(
    page.getByText("Model terlatih belum dipasang", { exact: true }),
  ).toBeVisible();
});

test("operator mengisi 18 kg, memberi label QR, mengirim, lalu pembeli menerima", async ({
  page,
}) => {
  await page.goto("/kub/darat");
  await page.getByRole("button", { name: /Darman/ }).click();
  await page.getByRole("radio", { name: "Ya, pakai es" }).locator("..").click();
  await page.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole("button", { name: "8", exact: true }).click();
  await page.getByRole("button", { name: "Lanjut: foto" }).click();
  const sample = page.getByRole("button", { name: /Contoh 1/ });
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: /foto contoh/i }).click();
  await sample.click();
  await page
    .getByRole("radio", { name: /Merah cerah/ })
    .locator("..")
    .click();
  await page.getByRole("button", { name: "Lanjut: bau dan tekstur" }).click();
  await page
    .getByRole("radio", { name: /^Segar khas laut/ })
    .locator("..")
    .click();
  await page
    .getByRole("radio", { name: /Agak lunak lambat kembali/ })
    .locator("..")
    .click();
  await page.getByRole("button", { name: "Lihat hasil", exact: true }).click();
  await page.getByRole("button", { name: "Masukkan 18 kg ke pesanan" }).click();
  await page.goto("/kub/batch/batch-2026-11-05-tongkol");
  await page
    .getByRole("button", { name: "Buat label QR", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Simpan gambar label" }),
  ).toHaveAttribute("href", /^data:image/);
  await page.getByRole("button", { name: "Tutup", exact: true }).click();
  await page
    .getByRole("button", { name: "Checklist kirim", exact: true })
    .click();
  for (const name of [/Es cukup/, /Wadah tertutup/, /Label tertempel/])
    await page.getByRole("checkbox", { name }).locator("..").click();
  await page
    .getByRole("textbox", { name: "Kurir", exact: true })
    .fill("Pak Udin · motor box");
  await page.getByRole("button", { name: "Berangkat sekarang" }).click();
  await page.goto("/pembeli/terima/TGK-A-0511");
  await page
    .getByRole("radio", { name: /Terima semua/ })
    .locator("..")
    .click();
  await page.getByRole("button", { name: "Terima 40 kg", exact: true }).click();
  await expect(page.getByText(/Diterima 40 kg/).first()).toBeVisible();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    database,
  );
  const paid = saved.payments.find(
    (item: { batchId: string }) => item.batchId === "batch-2026-11-05-tongkol",
  );
  expect(paid.amount).toBe(800000);
  await page.goto("/kub/bayar");
  await expect(
    page.getByRole("heading", { name: /Bayar/ }).first(),
  ).toBeVisible();
});

test("pembeli membuat pesanan H-1 dan menolak kiriman dengan bukti yang bertahan setelah reload", async ({
  page,
}) => {
  await page.goto("/pembeli/pesan");
  await page.getByRole("radio", { name: "Tongkol" }).locator("..").click();
  await page
    .getByRole("radio", { name: /A.*Prima/ })
    .locator("..")
    .click();
  await page.getByRole("textbox", { name: "Jumlah", exact: true }).fill("12");
  await page
    .getByRole("radio", { name: "08.00", exact: true })
    .locator("..")
    .click();
  await page
    .getByRole("textbox", { name: "Harga per kg", exact: true })
    .fill("20000");
  await page
    .getByRole("button", { name: "Kirim pesanan", exact: true })
    .click();
  await expect(
    page.getByText("Pesanan terkirim", { exact: true }),
  ).toBeVisible();
  await page.goto("/pembeli/terima/CKL-B-0511");
  await page
    .getByRole("radio", { name: /^Tolak/ })
    .locator("..")
    .click();
  await page
    .getByRole("radio", { name: "Es habis", exact: true })
    .locator("..")
    .click();
  await page
    .getByLabel("Foto bukti penolakan")
    .setInputFiles("public/samples/ffe/kembung-mata-tidak-segar-1.jpg");
  await page.getByRole("button", { name: "Kirim penolakan" }).click();
  await expect(
    page.getByText("Penolakan terkirim", { exact: true }),
  ).toBeVisible();
  await page.reload();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    database,
  );
  expect(
    saved.receipts.find(
      (item: { decision: string }) => item.decision === "reject",
    ).evidencePhotoDataUrl,
  ).toMatch(/^data:image\/jpeg;base64,/);
});

test("pengolah mengambil bahan, menghitung modal, memperbaiki label, dan menyimpan teks jualan", async ({
  page,
}) => {
  await page.goto("/umkm");
  await page.getByRole("button", { name: "Produk baru", exact: true }).click();
  await page
    .getByRole("radio", { name: /Tongkol.*12 kg/ })
    .locator("..")
    .click();
  await page
    .getByRole("checkbox", { name: /Saya sudah memeriksa bahan/ })
    .locator("..")
    .click();
  await page.getByRole("button", { name: "Ambil bahan dan lanjut" }).click();
  await page
    .getByRole("textbox", { name: "Nama produk", exact: true })
    .fill("Ikan Asin Tongkol Pagi");
  await page
    .getByRole("textbox", { name: "Merek", exact: true })
    .fill("Asin Bu Yanti");
  await page
    .getByRole("textbox", { name: /Komposisi/ })
    .fill("ikan tongkol, garam");
  await page.getByRole("button", { name: "Lanjut ke modal" }).click();
  await expect(
    page.getByText("Saran harga jual per kemasan", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lanjut ke label" }).click();
  const print = page.getByRole("button", {
    name: "Cetak label / simpan PDF",
    exact: true,
  });
  await expect(print).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Kode produksi", exact: true })
    .fill("SJ-0511");
  await page
    .getByLabel("Baik digunakan sebelum", { exact: true })
    .fill("2027-01-05");
  await page
    .getByRole("textbox", { name: "Nomor P-IRT", exact: true })
    .fill("206177101000126");
  await expect(print).toBeEnabled();
  await page.getByRole("button", { name: "Lanjut ke teks jualan" }).click();
  await page.getByRole("button", { name: "Susun ulang dari isian" }).click();
  await expect(
    page.getByRole("textbox", { name: "Status WhatsApp", exact: true }),
  ).toHaveValue(/Ikan Asin Tongkol Pagi/);
  await page
    .getByRole("button", { name: "Simpan produk", exact: true })
    .click();
  await expect(
    page.getByText("Produk tersimpan di perangkat ini", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Ikan Asin Tongkol Pagi", exact: true }),
  ).toBeVisible();
});
