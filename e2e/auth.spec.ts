import { expect, test } from "@playwright/test";

test.describe("Authentification", () => {
  test("le formulaire de connexion affiche les champs requis", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/nom ou email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /connectez-vous/i }),
    ).toBeVisible();
  });

  test("le lien admin renvoie vers /admin-login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link").first().click();
    await expect(page).toHaveURL(/\/admin-login/);
  });

  test("le formulaire d'inscription valide les champs côté client", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel(/^email$/i).fill("pas-un-email");
    await page.getByRole("button", { name: /créer un compte/i }).click();
    await expect(page.getByText(/email invalide/i)).toBeVisible();
  });

  test("le mot de passe doit contenir au moins 8 caractères", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel(/^mot de passe$/i).fill("court");
    await page.getByRole("button", { name: /créer un compte/i }).click();
    await expect(page.getByText(/au moins 8 caractères/i)).toBeVisible();
  });
});
