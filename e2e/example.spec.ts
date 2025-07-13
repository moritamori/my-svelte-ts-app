import { test, expect } from './fixtures';

test('has title', async ({ page, extensionUrl }) => {
  await page.goto(extensionUrl('popup.html'));
  await expect(page).toHaveTitle("Vite + Svelte + TS");
});

test('Click SvelteKit link', async ({ page, extensionId, context }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const pagePromise = context.waitForEvent('page');

  await page.getByRole('link', { name: 'SvelteKit' }).click();
  const newPage = await pagePromise;

  await expect(newPage).toHaveTitle("GitHub - sveltejs/kit: web development, streamlined");
});
