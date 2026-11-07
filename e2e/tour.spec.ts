import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test("tur dimulai secara sadar, berlanjut antarperan, bertahan setelah reload, dan dapat diakhiri", async ({ page }) => {
  await page.goto("/kub");
  await expect(page.getByRole("complementary", { name: "Penanda tur juri" })).toHaveCount(0);
  await page.goto("/juri");
  await page.getByRole("button", { name: "Mulai tur", exact: true }).click();
  await expect(page).toHaveURL(/\/coba$/);
  const guide = page.getByRole("complementary", { name: "Penanda tur juri" });
  await expect(guide).toContainText("Langkah 1 dari 9");
  await guide.getByRole("button", { name: "Selanjutnya", exact: true }).click();
  await expect(page).toHaveURL(/\/kub$/);
  await page.reload();
  await expect(guide).toContainText("Langkah 2 dari 9");
  await guide.getByRole("button", { name: /Buka daftar langkah/ }).click();
  const sheet = page.getByRole("dialog", { name: "Langkah tur juri" });
  await sheet.getByRole("button", { name: /3 Catat pendaratan/ }).click();
  await expect(page).toHaveURL(/\/kub\/darat$/);
  await expect(guide).toContainText("Langkah 3 dari 9");
  const guideBox = await guide.boundingBox();
  const headerBox = await page.locator("header").boundingBox();
  expect(guideBox!.y + guideBox!.height).toBeLessThanOrEqual(headerBox!.y + 1);
  await guide.getByRole("button", { name: "Akhiri tur", exact: true }).click();
  await page.reload();
  await expect(guide).toHaveCount(0);
});

test("tur dan konfirmasi reset tetap bekerja saat penyimpanan browser ditolak", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); };
  });
  await page.goto("/juri");
  await page.getByRole("button", { name: "Kembalikan data demo ke awal" }).click();
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(page.getByText("Data demo kembali ke awal", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Kembalikan data demo ke awal" }).click();
  await page.getByRole("button", { name: "Ya, kembalikan", exact: true }).click();
  await expect(page.getByText("Data demo kembali ke awal", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mulai tur", exact: true }).click();
  await page.getByRole("complementary", { name: "Penanda tur juri" }).getByRole("button", { name: "Selanjutnya", exact: true }).click();
  await expect(page).toHaveURL(/\/kub$/);
});
