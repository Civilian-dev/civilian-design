/**
 * brand-audit: load pages in Chrome and check them against the fixed part
 * of the Civilian theme contract.
 *
 *   brand-audit <url> [<url> ...]   check any pages, e.g. a site in development
 *   brand-audit --seeds             check every specimen page in docs/brand-seeds
 *
 * Exits 1 when any check fails. Uses the installed Google Chrome (set
 * BRAND_AUDIT_CHROME to a browser binary to use another).
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { type Finding, inspect } from "./checks";

const seedsDir = fileURLToPath(
  new URL("../../../docs/brand-seeds/", import.meta.url),
);

function seedUrls(): string[] {
  return readdirSync(seedsDir)
    .filter((f) => f.endsWith(".html"))
    .sort()
    .map((f) => pathToFileURL(join(seedsDir, f)).href);
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const urls = args.includes("--seeds")
    ? seedUrls()
    : args.filter((a) => !a.startsWith("--"));
  if (urls.length === 0) {
    console.error("usage: brand-audit <url> [<url> ...] | --seeds");
    return 2;
  }

  const executable = process.env.BRAND_AUDIT_CHROME;
  const browser = await chromium.launch(
    executable ? { executablePath: executable } : { channel: "chrome" },
  );
  let failures = 0;
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    // tsx keeps function names with a __name() helper the page does not have.
    await page.addInitScript("globalThis.__name = (fn) => fn;");
    for (const url of urls) {
      await page.goto(url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const sheet = await page.evaluate(
        () => document.querySelector("[data-audit='sheet']") !== null,
      );
      const findings: Finding[] = await page.evaluate(inspect, { sheet });
      const name = url.startsWith("file:") ? url.split("/").pop() : url;
      if (findings.length === 0) {
        console.log(`pass  ${name}${sheet ? " (sheet)" : ""}`);
        continue;
      }
      failures += findings.length;
      const counts = new Map<string, number>();
      for (const f of findings)
        counts.set(f.check, (counts.get(f.check) ?? 0) + 1);
      const summary = [...counts]
        .map(([check, n]) => `${check} ${n}`)
        .join(", ");
      console.log(`FAIL  ${name} (${summary})`);
      for (const f of findings) console.log(`      ${f.check}: ${f.detail}`);
    }
  } finally {
    await browser.close();
  }
  console.log(
    failures === 0
      ? `brand-audit: ${urls.length} pages pass`
      : `brand-audit: ${failures} findings`,
  );
  return failures === 0 ? 0 : 1;
}

process.exitCode = await main();
