import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
const fixture = "browser-fixture-access-only";
async function nav(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name, exact: true }).click();
}
async function setup(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore with fictional Milo" })
    .click();
  await nav(page, "Profile & settings");
  await page
    .getByRole("combobox", { name: "Mode", exact: true })
    .selectOption("live");
}
for (const submit of ["button", "enter"] as const) {
  test(`explicit ${submit} unlock retains verified code across navigation and keeps it out of storage`, async ({
    page,
  }) => {
    let sent = false;
    let verifications = 0;
    await page.route("**/api/live-access", async (route) => {
      verifications++;
      const good = route.request().headers()["x-demo-access"] === fixture;
      await route.fulfill({
        status: good ? 200 : 403,
        json: good
          ? { unlocked: true, message: "Live AI unlocked for this tab." }
          : {
              error:
                "Classroom code not recognized. Restart NextStep if configuration changed.",
            },
      });
    });
    await page.route("**/api/recommend", async (route) => {
      const data = route.request().postDataJSON();
      if (data.mode === "live")
        sent = route.request().headers()["x-demo-access"] === fixture;
      await route.fulfill({
        status: 400,
        json: {
          error: "Request captured by browser test; no provider call made.",
        },
      });
    });
    await setup(page);
    const input = page.getByLabel("Classroom access code", { exact: true });
    await input.fill("  " + fixture + "  ");
    if (submit === "button")
      await page
        .getByRole("button", { name: "Unlock Live AI", exact: true })
        .click();
    else await input.press("Enter");
    await expect(page.locator("#live-access-message")).toContainText(
      "Live AI unlocked",
    );
    await expect(page.locator(".mode-pill")).toContainText("Live AI unlocked");
    await nav(page, "Your journey");
    await nav(page, "Profile & settings");
    await expect(
      page.getByLabel("Classroom access code", { exact: true }),
    ).toHaveValue(fixture);
    await expect(page.locator(".mode-pill")).toContainText("Live AI unlocked");
    await nav(page, "Your day");
    await page
      .getByRole("button", { name: "Find activities", exact: true })
      .click();
    await expect(page.locator("main").getByRole("alert")).toContainText(
      "captured",
    );
    expect(sent).toBe(true);
    expect(verifications).toBe(1);
    const stored = await page.evaluate(() =>
      JSON.stringify({
        local: { ...localStorage },
        session: { ...sessionStorage },
      }),
    );
    expect(stored).not.toContain(fixture);
    await page.reload();
    await nav(page, "Profile & settings");
    await page
      .getByRole("combobox", { name: "Mode", exact: true })
      .selectOption("live");
    await expect(
      page.getByLabel("Classroom access code", { exact: true }),
    ).toHaveValue("");
    await expect(page.locator(".mode-pill")).toContainText("Live AI locked");
  });
}
test("denial, explicit lock, edited code, and server-side revocation update the indicator", async ({
  page,
}) => {
  let authAllowed = false;
  await page.route("**/api/live-access", async (route) =>
    route.fulfill({
      status: authAllowed ? 200 : 403,
      json: authAllowed
        ? { unlocked: true, message: "Live AI unlocked for this tab." }
        : {
            error:
              "Code not recognized by this running server. Restart NextStep if configuration changed.",
          },
    }),
  );
  await page.route("**/api/recommend", async (route) =>
    route.fulfill({
      status: 403,
      json: {
        code: "access_denied",
        error:
          "The running server no longer recognizes this classroom access code.",
      },
    }),
  );
  await setup(page);
  const input = page.getByLabel("Classroom access code", { exact: true });
  await input.fill(fixture);
  await input.press("Enter");
  await expect(page.locator("#live-access-message")).toContainText(
    "Restart NextStep",
  );
  await expect(page.locator(".mode-pill")).toHaveText("Live AI locked");
  authAllowed = true;
  await page
    .getByRole("button", { name: "Unlock Live AI", exact: true })
    .click();
  await expect(page.locator(".mode-pill")).toHaveText("Live AI unlocked");
  await input.fill("edited-fixture");
  await expect(page.locator(".mode-pill")).toHaveText("Live AI locked");
  await input.press("Enter");
  await expect(page.locator(".mode-pill")).toHaveText("Live AI unlocked");
  await page.getByRole("button", { name: "Lock Live AI", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(page.locator(".mode-pill")).toHaveText("Live AI locked");
  await input.fill(fixture);
  await input.press("Enter");
  await expect(page.locator(".mode-pill")).toHaveText("Live AI unlocked");
  await nav(page, "Your day");
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "no longer recognizes",
  );
  await expect(page.locator(".mode-pill")).toHaveText("Live AI locked");
});
test("an in-flight unlock cannot grant access after the draft changes", async ({
  page,
}) => {
  let release: () => void = () => {};
  let started: () => void = () => {};
  const pending = new Promise<void>((resolve) => (release = resolve));
  const requested = new Promise<void>((resolve) => (started = resolve));
  await page.route("**/api/live-access", async (route) => {
    started();
    await pending;
    await route.fulfill({
      json: { unlocked: true, message: "Live AI unlocked for this tab." },
    });
  });
  await setup(page);
  const input = page.getByLabel("Classroom access code", { exact: true });
  await input.fill(fixture);
  await page
    .getByRole("button", { name: "Unlock Live AI", exact: true })
    .click();
  await requested;
  await input.fill("different-fixture");
  const finished = page.waitForResponse((r) =>
    r.url().endsWith("/api/live-access"),
  );
  release();
  await finished;
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".mode-pill")).toHaveText("Live AI locked");
  await expect(
    page.getByRole("button", { name: "Lock Live AI", exact: true }),
  ).not.toBeVisible();
});

test("form submission reads the visible code even when autofill did not emit a React change event", async ({
  page,
}) => {
  let verified = false;
  await page.route("**/api/live-access", async (route) => {
    verified = route.request().headers()["x-demo-access"] === fixture;
    await route.fulfill({
      json: { unlocked: true, message: "Live AI unlocked for this tab." },
    });
  });
  await setup(page);
  await page
    .getByLabel("Classroom access code", { exact: true })
    .evaluate((element, value) => {
      (element as HTMLInputElement).value = value;
    }, fixture);
  await page
    .getByRole("button", { name: "Unlock Live AI", exact: true })
    .click();
  await expect(page.locator(".mode-pill")).toHaveText("Live AI unlocked");
  expect(verified).toBe(true);
});

test("unlock form renders accessibly at the current viewport", async ({
  page,
}, info) => {
  await page.route("**/api/live-access", async (route) =>
    route.fulfill({
      json: {
        unlocked: true,
        message:
          "Live AI unlocked for this tab. You can now request recommendations. Provider availability is checked when you request activities.",
      },
    }),
  );
  await setup(page);
  await page.getByLabel("Classroom access code", { exact: true }).fill(fixture);
  await page
    .getByRole("button", { name: "Unlock Live AI", exact: true })
    .click();
  await expect(page.locator(".mode-pill")).toHaveText("Live AI unlocked");
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    scan.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `test-results/${info.project.name}-unlock-fixture.png`,
    fullPage: true,
    animations: "disabled",
  });
});
