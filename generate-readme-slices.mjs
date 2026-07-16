import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(root, "assets", "portfolio-board.svg");
const outputDirectory = join(root, "assets", "board-slices");
const boardWidth = 1280;
const boardHeight = 5400;

const rows = [
  {
    y: 0,
    height: 479,
    slices: [["01-header", 0, 1280]],
  },
  {
    y: 479,
    height: 72,
    slices: [
      ["02-nav-left", 0, 80],
      ["02-nav-portfolio", 80, 280],
      ["02-nav-resume", 360, 280],
      ["02-nav-linkedin", 640, 280],
      ["02-nav-email", 920, 280],
      ["02-nav-right", 1200, 80],
    ],
  },
  {
    y: 551,
    height: 264,
    slices: [["03-introduction-proof-heading", 0, 1280]],
  },
  {
    y: 815,
    height: 350,
    slices: [["04-proof-panel", 0, 1280]],
  },
  {
    y: 1165,
    height: 467,
    slices: [["05-selected-work-ontheway", 0, 1280]],
  },
  {
    y: 1632,
    height: 93,
    slices: [
      ["06-ontheway-left", 0, 59],
      ["06-ontheway-repository", 59, 387],
      ["06-ontheway-architecture", 446, 387],
      ["06-ontheway-run", 833, 387],
      ["06-ontheway-right", 1220, 60],
    ],
  },
  {
    y: 1725,
    height: 387,
    slices: [["07-carivyo", 0, 1280]],
  },
  {
    y: 2112,
    height: 93,
    slices: [
      ["08-carivyo-left", 0, 59],
      ["08-carivyo-repository", 59, 387],
      ["08-carivyo-architecture", 446, 387],
      ["08-carivyo-safety", 833, 387],
      ["08-carivyo-right", 1220, 60],
    ],
  },
  {
    y: 2205,
    height: 387,
    slices: [["09-waternet", 0, 1280]],
  },
  {
    y: 2592,
    height: 93,
    slices: [
      ["10-waternet-left", 0, 251],
      ["10-waternet-repository", 251, 389],
      ["10-waternet-model-notes", 640, 389],
      ["10-waternet-right", 1029, 251],
    ],
  },
  {
    y: 2685,
    height: 1645,
    slices: [["11-toolkit-experience", 0, 1280]],
  },
  {
    y: 4330,
    height: 240,
    slices: [
      ["12-competitive-left", 0, 70],
      ["12-competitive-codeforces", 70, 380],
      ["12-competitive-codechef", 450, 390],
      ["12-competitive-leetcode", 840, 370],
      ["12-competitive-right", 1210, 70],
    ],
  },
  {
    y: 4570,
    height: 30,
    slices: [["13-competitive-divider", 0, 1280]],
  },
  {
    y: 4600,
    height: 295,
    slices: [
      ["14-community-amazon", 0, 650],
      ["14-community-ler-dsa", 650, 630],
    ],
  },
  {
    y: 4895,
    height: 505,
    slices: [["15-contact", 0, 1280]],
  },
];

function validateTiling() {
  let nextY = 0;

  for (const row of rows) {
    if (row.y !== nextY) {
      throw new Error(`Row at y=${row.y} does not follow y=${nextY}`);
    }

    let nextX = 0;
    for (const [name, x, width] of row.slices) {
      if (x !== nextX) {
        throw new Error(`${name} starts at x=${x}, expected x=${nextX}`);
      }
      nextX += width;
    }

    if (nextX !== boardWidth) {
      throw new Error(`Row at y=${row.y} covers ${nextX}px, expected ${boardWidth}px`);
    }

    nextY += row.height;
  }

  if (nextY !== boardHeight) {
    throw new Error(`Rows cover ${nextY}px, expected ${boardHeight}px`);
  }
}

function cropSvg(source, x, y, width, height) {
  const openingTag = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}" role="img">`;
  const generatedComment = "\n  <!-- Generated from assets/portfolio-board.svg. Run node generate-readme-slices.mjs after editing the board. -->";
  return source.replace(/^<svg\b[^>]*>/, `${openingTag}${generatedComment}`);
}

validateTiling();

const source = await readFile(sourcePath, "utf8");
if (!source.startsWith("<svg")) {
  throw new Error(`${sourcePath} is not an SVG document`);
}

await mkdir(outputDirectory, { recursive: true });
for (const file of await readdir(outputDirectory)) {
  if (file.endsWith(".svg")) {
    await unlink(join(outputDirectory, file));
  }
}

let generatedCount = 0;
for (const row of rows) {
  for (const [name, x, width] of row.slices) {
    const output = cropSvg(source, x, row.y, width, row.height);
    await writeFile(join(outputDirectory, `${name}.svg`), output);
    generatedCount += 1;
  }
}

console.log(`Generated ${generatedCount} exact board slices in assets/board-slices`);