import { expect, test } from "@playwright/test";

test("la page des emplois du temps se charge", async ({ page }) => {
  await page.goto("/emplois-du-temps");
  await expect(
    page.getByRole("heading", { name: /emplois du temps/i }),
  ).toBeVisible();
});

test("affiche un message si aucune classe n'est disponible ou liste les classes", async ({
  page,
}) => {
  await page.goto("/emplois-du-temps");
  const emptyState = page.getByText(/aucun emploi du temps/i);
  const classLink = page.locator('a[href^="/emplois-du-temps/"]').first();
  await expect(emptyState.or(classLink)).toBeVisible();
});
