import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: "./tests/browser", workers: 1, fullyParallel: false,
    use: { baseURL: "http://127.0.0.1:5180", browserName: "chromium", channel: process.env.PLAYWRIGHT_CHANNEL || "msedge", headless: true },
    webServer: { command: "npm run dev -- --host 127.0.0.1 --port 5180 --strictPort", url: "http://127.0.0.1:5180", reuseExistingServer: false },
    outputDir: "test-results", reporter: "list",
});
