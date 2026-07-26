import { readFile, writeFile } from "node:fs/promises";

const files = process.argv.slice(2);

if (files.length === 0) {
  throw new Error("Provide at least one generated snake SVG.");
}

for (const file of files) {
  let svg = await readFile(file, "utf8");

  if (svg.includes("@keyframes snakeColor")) {
    throw new Error(`${file} is already colorized.`);
  }

  const events = new Map();
  const contributionFrames = /@keyframes c[0-9a-z]+\{([\d.]+)%\{fill:var\(--(c[1-4])\)\}/g;

  for (const match of svg.matchAll(contributionFrames)) {
    events.set(Number(match[1]), match[2]);
  }

  if (events.size === 0) {
    throw new Error(`No contribution-eating events found in ${file}.`);
  }

  let activeColor = "cs";
  let colorStops = "";

  for (const [percentage, color] of [...events.entries()].sort(([left], [right]) => left - right)) {
    const changedAt = Number(Math.min(percentage + 0.01, 99.98).toFixed(2));
    colorStops += `${percentage}%{fill:var(--${activeColor})}`;
    colorStops += `${changedAt}%{fill:var(--${color})}`;
    activeColor = color;
  }

  const colorAnimation = `@keyframes snakeColor{0%{fill:var(--cs)}${colorStops}99.99%{fill:var(--${activeColor})}100%{fill:var(--cs)}}`;
  svg = svg.replace("</style>", `${colorAnimation}</style>`);

  let coloredSegments = 0;
  svg = svg.replace(
    /\.s\.s([0-9a-z]+)\{([^}]*)animation-name:s\1\}/g,
    (_, segment, rules) => {
      coloredSegments += 1;
      return `.s.s${segment}{${rules}animation-name:s${segment},snakeColor}`;
    },
  );

  if (coloredSegments === 0) {
    throw new Error(`No animated snake segments found in ${file}.`);
  }

  await writeFile(file, svg);
  console.log(`${file}: ${events.size} color changes applied to ${coloredSegments} snake segments.`);
}
