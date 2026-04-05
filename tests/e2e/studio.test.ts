import { expect, test } from "@playwright/test";

test.describe("Studio prompt styling", () => {
  test("injecte le style cyberpunk dans le prompt envoyé à l'API", async ({
    page,
  }) => {
    let sentPrompt = "";

    await page.route("**/api/studio", async (route) => {
      const body = route.request().postDataJSON() as { prompt?: string };
      sentPrompt = body.prompt ?? "";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          type: "image",
          provider: "mock-provider",
          imageUrl: "https://example.com/fake-image.png",
        }),
      });
    });

    await page.goto("/studio");
    await page.getByRole("button", { name: "Édition" }).click();
    await page
      .getByPlaceholder("Décrivez précisément ce que vous voulez produire...")
      .fill("portrait d'une femme");
    await page.getByRole("button", { name: "Cyberpunk" }).click();
    await page.getByRole("button", { name: "Lancer dans Studio" }).click();

    await expect
      .poll(() => sentPrompt)
      .toContain(
        "portrait d'une femme, in neon cyberpunk style, futuristic city background, glowing lights, high contrast"
      );
  });
});
