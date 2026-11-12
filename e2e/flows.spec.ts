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
  const fisherHandoff = page.getByRole("link", { name: "Lihat di HP Pak Darman", exact: true });
  await expect(fisherHandoff).toBeVisible();
  const landingHref = await fisherHandoff.getAttribute("href");
  await fisherHandoff.click();
  await expect(page).toHaveURL(new RegExp(landingHref! + "$"));
  await expect(page.getByRole("link", { name: /Lihat jejak kiriman/ })).toHaveAttribute("href", "/lacak/TGK-A-0511");
  await page.goto(landingHref!.replace("/nelayan/tangkapan/", "/kub/pendaratan/"));
  await expect(page.getByRole("link", { name: "Lihat di HP Pak Darman", exact: true })).toHaveAttribute("href", landingHref!);
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
  await expect(page.getByRole("link", { name: "Lihat halaman lacak publik", exact: true })).toHaveAttribute("href", "/lacak/TGK-A-0511");
  await page.getByRole("link", { name: "Terima sebagai pembeli", exact: true }).click();
  await expect(page).toHaveURL(/\/pembeli\/terima\/TGK-A-0511$/);
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
  await expect(page.getByRole("link", { name: "Lihat uang Pak Darman", exact: true })).toHaveAttribute("href", "/nelayan/uang/batch-2026-11-05-tongkol");
  await page.getByRole("link", { name: "Lihat bagi hasil di KUB", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Bayar/ }).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Lihat di HP nelayan · Pak Darman", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Kenapa harganya segini", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Lihat jejak kiriman/ })).toHaveAttribute("href", "/lacak/TGK-A-0511");
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
      (item: { batchId: string }) => item.batchId === "batch-2026-11-05-cakalang",
    ).evidencePhotoDataUrl,
  ).toMatch(/^data:image\/jpeg;base64,/);
});

test("pengolah mengambil bahan, menghitung modal, memperbaiki label, dan menyimpan teks jualan", async ({
  page,
}) => {
  await page.goto("/umkm/studio");
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

  await page.route("/api/studio/teks", (route) =>
    route.fulfill({ status: 503, json: { error: "unavailable" } }),
  );
  await page.getByRole("button", { name: "Susun dengan AI" }).click();
  await expect(page.getByText(/Layanan AI belum aktif/)).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Status WhatsApp", exact: true }),
  ).toHaveValue(/Ikan Asin Tongkol Pagi/);

  await page.unroute("/api/studio/teks");
  let sent: Record<string, unknown> = {};
  await page.route("/api/studio/teks", (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({
      json: {
        model: "claude-haiku-5-5",
        captions: {
          whatsappStatus: "Ikan Asin Tongkol Pagi sudah siap, pesan lewat WhatsApp.",
          marketplace: "Ikan Asin Tongkol Pagi dari Asin Bu Yanti. Baca cara simpan pada label.",
          instagram: "Tongkol asin dijemur pagi hari. #ikanasin",
        },
      },
    });
  });
  await page.getByRole("button", { name: "Susun dengan AI" }).click();
  await expect(
    page.getByRole("textbox", { name: "Caption Instagram", exact: true }),
  ).toHaveValue("Tongkol asin dijemur pagi hari. #ikanasin");
  await expect(page.getByText(/disusun AI dari isian Anda/)).toBeVisible();
  expect(sent).toMatchObject({
    name: "Ikan Asin Tongkol Pagi",
    brand: "Asin Bu Yanti",
    ingredients: ["ikan tongkol", "garam"],
  });
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
