import { expect, test } from "@playwright/test";

const legalPages = [
  { path: "/mentions-legales", heading: /mentions légales/i },
  { path: "/cgu", heading: /conditions générales/i },
  { path: "/confidentialite", heading: /confidentialité/i },
];

for (const { path, heading } of legalPages) {
  test(`la page ${path} affiche son contenu`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.getByText(/dernière mise à jour/i)).toBeVisible();
  });
}

test("le pied de page permet d'accéder aux pages légales", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /mentions légales/i }).click();
  await expect(page).toHaveURL(/\/mentions-legales/);
});
