import { test, expect, type Page } from "@playwright/test";
async function demo(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore with fictional Milo" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Meet Milo where" }),
  ).toBeVisible();
}
async function nav(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name, exact: true }).click();
}
test("complete adaptive journey, persistence, history, and reset", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await demo(page);
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Animal sound stories", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-dashboard.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Animal sound stories", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Why this little moment?")).toBeVisible();
  await dialog.getByRole("button", { name: "Enjoyed", exact: true }).click();
  await dialog.getByRole("button", { name: "Struggled", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Enjoyed", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    dialog.getByRole("button", { name: "Struggled", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "Save this little moment" }).click();
  await expect(dialog.getByRole("status")).toContainText("remembered");
  await dialog.getByRole("button", { name: "Back to your day" }).click();
  await page
    .getByRole("button", { name: "Request new recommendations" })
    .click();
  await expect(page.locator(".activity-card").first()).toContainText(
    "Picture pause",
  );
  await expect(page.locator(".activity-card").first()).toContainText(
    "fewer demands",
  );
  await page.screenshot({
    path: `test-results/${info.project.name}-adapted.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await expect(page.locator(".activity-card").first()).toContainText(
    "Picture pause",
  );
  await nav(page, "Your journey");
  await expect(
    page.locator(".history-row").filter({ hasText: "completed" }),
  ).toContainText("enjoyed");
  await expect(
    page.locator(".history-row").filter({ hasText: "completed" }),
  ).toContainText("struggled");
  await nav(page, "Profile & settings");
  await page.getByRole("button", { name: "Reset active journey" }).click();
  await page.getByRole("button", { name: "Confirm reset" }).click();
  await nav(page, "Your journey");
  await expect(
    page.getByRole("heading", { name: "A fresh page" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("onboarding unknown abilities, concern abstention, editing, and deletion", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Find your next step" }).click();
  await page.getByLabel("Fictional nickname").fill("Pip");
  await page.getByLabel("Age in months").fill("24");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "I’m not sure yet" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Any concern to demonstrate?")
    .selectOption("development");
  await page.getByRole("button", { name: "Create fictional profile" }).click();
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await expect(page.locator(".recommend-empty")).toContainText("qualified");
  expect(await page.locator(".activity-card").count()).toBe(0);
  await nav(page, "Profile & settings");
  await page.getByRole("button", { name: "Edit active profile" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Any concern to demonstrate?").selectOption("none");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await expect(page.locator(".activity-card").first()).toBeVisible();
  await nav(page, "Profile & settings");
  await page.getByRole("button", { name: "Delete all local data" }).click();
  await page.getByRole("button", { name: "Confirm deletion" }).click();
  await page.reload();
  const store = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nextstep-demo-v1")!),
  );
  expect(store.profiles).toHaveLength(0);
  expect(store.history).toHaveLength(0);
  expect(store.events).toHaveLength(0);
});
test("all views render without horizontal overflow and access stays locked", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.screenshot({
    path: `test-results/${info.project.name}-landing.png`,
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await demo(page);
  for (const name of [
    "Activity library",
    "Your journey",
    "Profile & settings",
    "Prototype insights",
  ]) {
    await nav(page, name);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await nav(page, "Profile & settings");
  await page
    .getByRole("combobox", { name: "Mode", exact: true })
    .selectOption("live");
  await nav(page, "Your day");
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText("locked");
  await page.getByRole("button", { name: "Switch to mock mode" }).click();
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await expect(page.locator(".activity-card")).toHaveCount(3);
});
test("keyboard dialog focus, compatible choices, and escape", async ({
  page,
}) => {
  await demo(page);
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Animal sound stories", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close activity" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Mastered", exact: true }).click();
  await page.getByRole("button", { name: "Struggled", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mastered", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Animal sound stories", exact: true }),
  ).toBeFocused();
});
