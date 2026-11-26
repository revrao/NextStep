import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
test("caregiver screens meet automated WCAG AA checks", async ({ page }) => {
  await page.goto("/");
  const check = async () => {
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      report.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  };
  await check();
  await page
    .getByRole("button", { name: "Explore with fictional Milo" })
    .click();
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await expect(page.locator(".activity-card")).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await check();
  await page
    .getByRole("button", { name: "Animal sound stories", exact: true })
    .click();
  await check();
  await page.keyboard.press("Escape");
});
