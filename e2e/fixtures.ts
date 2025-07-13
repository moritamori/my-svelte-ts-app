import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  extensionUrl: (path: string) => string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "../dist");
    const context = await chromium.launchPersistentContext("", {
      // CI環境では自動的にtrueになり、ヘッドレスで実行されます。
      // ローカルではfalseになり、デバッグのためにブラウザが表示されます。常にヘッドレスで良い場合は削除してください。
      headless: !!process.env.CI,
      args: [ `--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const serviceWorker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    if (!serviceWorker) {
      throw new Error("Couldn't find a service worker for the extension");
    }
    const extensionId = serviceWorker.url().split('/')[2];
    await use(extensionId);
  },
  extensionUrl: async ({ extensionId }, use) => {
    // popup.htmlやoptions.htmlなど、様々なページに対応できるよう関数を返す
    const buildUrl = (path: string) => `chrome-extension://${extensionId}/${path}`;
    await use(buildUrl);
  },
});

export const expect = test.expect;