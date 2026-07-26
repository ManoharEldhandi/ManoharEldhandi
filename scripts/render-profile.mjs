import { chromium } from "playwright";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const sourceFile = path.join(repositoryRoot, "profile-src", "index.html");
const assetDirectory = path.join(repositoryRoot, "assets", "profile");
const previewDirectory = path.join(repositoryRoot, "output", "playwright");
const previewFile = path.join(previewDirectory, "profile-preview.png");

await mkdir(assetDirectory, { recursive: true });
await mkdir(previewDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1200, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  reducedMotion: "reduce",
});

const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") pageErrors.push(message.text());
});

await page.goto(pathToFileURL(sourceFile).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

const layout = await page.evaluate(() => ({
  bodyWidth: document.body.scrollWidth,
  viewportWidth: document.documentElement.clientWidth,
  title: document.title,
}));

if (layout.bodyWidth > layout.viewportWidth) {
  throw new Error(`Horizontal overflow detected: ${layout.bodyWidth}px > ${layout.viewportWidth}px`);
}

const exports = page.locator("[data-export]");
const exportCount = await exports.count();
if (exportCount !== 12) {
  throw new Error(`Expected 12 exported sections, found ${exportCount}`);
}

const manifest = [];
for (let index = 0; index < exportCount; index += 1) {
  const target = exports.nth(index);
  const filename = await target.getAttribute("data-export");
  if (!filename || !/^[a-z0-9-]+\.png$/.test(filename)) {
    throw new Error(`Invalid export filename at index ${index}: ${filename}`);
  }

  const box = await target.boundingBox();
  if (!box || box.width < 200 || box.height < 60) {
    throw new Error(`Invalid capture geometry for ${filename}`);
  }

  const output = path.join(assetDirectory, filename);
  await target.screenshot({ path: output, animations: "disabled" });
  const file = await stat(output);
  manifest.push({ filename, width: Math.round(box.width), height: Math.round(box.height), bytes: file.size });
}

await page.screenshot({ path: previewFile, fullPage: true, animations: "disabled" });
await browser.close();

if (pageErrors.length > 0) {
  throw new Error(`Browser errors:\n${pageErrors.join("\n")}`);
}

const readme = await readFile(path.join(repositoryRoot, "README.md"), "utf8");
for (const { filename } of manifest) {
  if (!readme.includes(`./assets/profile/${filename}`)) {
    throw new Error(`README does not reference generated asset: ${filename}`);
  }
}

console.log(JSON.stringify({ source: sourceFile, preview: previewFile, assets: manifest }, null, 2));
