import { expect, test } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test("affiche le titre du site", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CSM Niangon/);
  });

  test("affiche la navigation principale", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /accueil/i }).first(),
    ).toBeVisible();
  });

  test("permet de naviguer vers la page des actualités", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /actualités/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/actus/);
    await expect(
      page.getByRole("heading", { name: /actualités/i }),
    ).toBeVisible();
  });

  test("permet de naviguer vers la page des informations", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /^infos$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/infos/);
  });
});
