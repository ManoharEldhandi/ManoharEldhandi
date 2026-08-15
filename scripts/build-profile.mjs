import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const outputDirectory = path.join(repositoryRoot, "assets", "profile");

const colors = {
  bg: "#0b0f14",
  panel: "#121922",
  panelDeep: "#0f151d",
  card: "#161f29",
  cardDeep: "#121a23",
  border: "#34404d",
  borderSoft: "#25303b",
  text: "#f3efe7",
  muted: "#aab2bc",
  faint: "#707b87",
  amber: "#dda756",
  sage: "#91aba5",
  red: "#a76059",
};

const sans = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
const mono = `'SFMono-Regular', Consolas, 'Liberation Mono', monospace`;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgDocument({ width, height, title, description, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">${escapeXml(description)}</desc>
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#17212b"/>
      <stop offset="0.58" stop-color="#111820"/>
      <stop offset="1" stop-color="#0e141b"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#19232e"/>
      <stop offset="1" stop-color="#121a23"/>
    </linearGradient>
    <linearGradient id="amberLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${colors.amber}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${colors.amber}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${colors.amber}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g font-family="${sans}">${body}</g>
</svg>`;
}

function surface(width, height, radius = 28) {
  return `<g>
    <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="url(#panel)" stroke="#b88a4d" stroke-opacity="0.92" stroke-width="1" vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision"/>
  </g>`;
}

function card(x, y, width, height, radius = 18, emphasis = false) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${emphasis ? colors.card : colors.cardDeep}" stroke="${colors.borderSoft}" stroke-width="1.4"/>
    <path d="M${x + 18} ${y + 1} H${x + width - 18}" stroke="#ffffff" stroke-opacity="0.055"/>
  </g>`;
}

function text({ x, y, value, size = 18, fill = colors.text, weight = 500, family = sans, spacing = 0, anchor = "start" }) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}

function lines({ x, y, values, size = 18, lineHeight = 28, fill = colors.muted, weight = 450, family = sans, spacing = 0, anchor = "start" }) {
  const spans = values.map((value, index) => `<tspan x="${x}" y="${y + index * lineHeight}">${escapeXml(value)}</tspan>`).join("");
  return `<text fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" text-anchor="${anchor}">${spans}</text>`;
}

function kicker(x, y, value) {
  return text({ x, y, value: value.toUpperCase(), size: 15, fill: colors.sage, weight: 750, family: mono, spacing: 2.4 });
}

function status(x, y, value) {
  return `<circle cx="${x}" cy="${y - 5}" r="5" fill="${colors.sage}"/><circle cx="${x}" cy="${y - 5}" r="9" fill="none" stroke="${colors.sage}" stroke-opacity="0.16"/>${text({ x: x + 18, y, value, size: 13, fill: colors.muted, weight: 700, family: mono, spacing: 0.7 })}`;
}

function chipLayout(chips, startX, startY, maxWidth, fontSize = 15, rowHeight = 39) {
  let x = startX;
  let y = startY;
  let output = "";
  for (const chip of chips) {
    const width = Math.max(58, Math.round(chip.length * fontSize * 0.61 + 24));
    if (x + width > startX + maxWidth) {
      x = startX;
      y += rowHeight;
    }
    output += `<rect x="${x}" y="${y - 24}" width="${width}" height="31" rx="9" fill="#1c2632" stroke="${colors.border}" stroke-width="1"/>`;
    output += text({ x: x + width / 2, y: y - 4, value: chip, size: fontSize, fill: "#dce1e5", weight: 650, family: mono, anchor: "middle" });
    x += width + 9;
  }
  return output;
}

function hero(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 780 : 520;
  const desktopBody = `${surface(width, height)}
    <rect x="64" y="62" width="44" height="44" rx="12" fill="#18212b" stroke="${colors.border}"/>
    ${text({ x: 86, y: 91, value: "ME", size: 15, fill: colors.amber, weight: 800, anchor: "middle", spacing: 1 })}
    ${status(985, 90, "BENGALURU / IST")}
    ${kicker(64, 158, "AI + Security + Backend Engineering")}
    ${text({ x: 64, y: 230, value: "Manohar Eldhandi", size: 66, weight: 780, spacing: -2.7 })}
    ${text({ x: 66, y: 278, value: "Software Engineer", size: 29, fill: colors.amber, weight: 720, spacing: -0.4 })}
    ${lines({ x: 66, y: 331, values: ["I build Python agentic-AI security workflows at Cisco,", "Java and Spring Boot systems, and full-stack products", "with measurable evidence and reliable delivery."], size: 21, lineHeight: 29 })}
    ${card(820, 126, 314, 230, 20, true)}
    ${kicker(850, 165, "Current role")}
    ${text({ x: 850, y: 211, value: "Software Engineer", size: 26, weight: 740 })}
    ${text({ x: 850, y: 243, value: "at Cisco", size: 26, weight: 740 })}
    ${lines({ x: 850, y: 281, values: ["Applying agentic AI and", "backend engineering to", "security-compliance workflows", "across product teams."], size: 17, lineHeight: 24 })}
    <path d="M64 418 H1136" stroke="${colors.borderSoft}"/>
    ${text({ x: 230, y: 458, value: "BACKEND SYSTEMS", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}
    <path d="M405 432 V470" stroke="${colors.borderSoft}"/>
    ${text({ x: 600, y: 458, value: "APPLIED AI", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}
    <path d="M795 432 V470" stroke="${colors.borderSoft}"/>
    ${text({ x: 970, y: 458, value: "PRODUCT ENGINEERING", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}`;

  const mobileBody = `${surface(width, height)}
    <rect x="44" y="48" width="44" height="44" rx="12" fill="#18212b" stroke="${colors.border}"/>
    ${text({ x: 66, y: 77, value: "ME", size: 15, fill: colors.amber, weight: 800, anchor: "middle", spacing: 1 })}
    ${status(418, 76, "BENGALURU / IST")}
    ${kicker(44, 146, "AI + Security + Backend")}
    ${lines({ x: 44, y: 211, values: ["Manohar", "Eldhandi"], size: 58, lineHeight: 60, fill: colors.text, weight: 780, spacing: -2.2 })}
    ${text({ x: 46, y: 352, value: "Software Engineer", size: 27, fill: colors.amber, weight: 730 })}
    ${lines({ x: 46, y: 401, values: ["I build Python agentic-AI security workflows at Cisco,", "Java and Spring Boot systems, and full-stack products", "with measurable evidence and reliable delivery."], size: 19, lineHeight: 29 })}
    ${card(44, 505, 512, 160, 18, true)}
    ${kicker(68, 540, "Current role")}
    ${text({ x: 68, y: 578, value: "Software Engineer at Cisco", size: 24, weight: 740 })}
    ${lines({ x: 68, y: 614, values: ["Agentic AI + backend engineering for security-compliance", "workflows used across Cisco product teams."], size: 17, lineHeight: 26 })}
    <path d="M44 704 H556" stroke="${colors.borderSoft}"/>
    ${text({ x: 300, y: 735, value: "BACKEND  /  APPLIED AI  /  PRODUCT", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1, anchor: "middle" })}`;

  return svgDocument({
    width,
    height,
    title: "Manohar Eldhandi — Software Engineer",
    description: "Software Engineer at Cisco in Bengaluru focused on AI security, backend systems, and product engineering.",
    body: mobile ? mobileBody : desktopBody,
  });
}

function navButton(label, mobile = false) {
  const width = mobile ? 76 : 140;
  const height = mobile ? 40 : 46;
  const labelSize = mobile ? (label.length > 8 ? 9 : 10) : 15;
  return svgDocument({
    width,
    height,
    title: label,
    description: `Open ${label}`,
    body: `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${mobile ? 11 : 12}" fill="url(#panel)" stroke="#b88a4d" stroke-opacity="0.92" stroke-width="1" vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision"/>
      ${text({ x: width / 2, y: mobile ? 25 : 29, value: label, size: labelSize, weight: 740, anchor: "middle", spacing: 0.1 })}`,
  });
}

function profile(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 980 : 620;
  const metrics = [
    ["50+", "ENGINEERS", ["Adopted across four Cisco", "product teams."]],
    ["70%", "LESS REVIEW", ["Traceable automation reduced", "manual effort."]],
    ["10×", "FEWER CALLS", ["A grounded, code-aware", "11-stage AI pipeline."]],
    ["736", "TESTS / 97% UI", ["Automation covered 10+", "CI/CD releases."]],
  ];

  if (!mobile) {
    const metricCards = metrics.map(([value, label, copy], index) => {
      const x = 64 + index * 270;
      return `${card(x, 366, 252, 180, 17, index === 0 || index === 3)}
        ${text({ x: x + 22, y: 414, value, size: 34, weight: 780, spacing: -1 })}
        ${text({ x: x + 22, y: 445, value: label, size: 13, fill: colors.sage, weight: 750, family: mono, spacing: 1 })}
        ${lines({ x: x + 22, y: 484, values: copy, size: 16, lineHeight: 24 })}`;
    }).join("");
    return svgDocument({
      width,
      height,
      title: "Engineering profile and selected impact",
      description: "Backend and applied-AI engineering profile with measurable outcomes at Cisco.",
      body: `${surface(width, height)}
        ${kicker(64, 78, "Engineering profile")}
        ${text({ x: 64, y: 126, value: "Build the foundation. Apply intelligence where it earns its place.", size: 36, weight: 760, spacing: -1.1 })}
        ${card(64, 166, 520, 160, 18)}
        ${text({ x: 90, y: 207, value: "What I build", size: 24, weight: 740 })}
        ${lines({ x: 90, y: 245, values: ["Reliable APIs, event-driven services,", "agent tooling, grounded retrieval,", "and code-aware LLM pipelines."], size: 19, lineHeight: 27 })}
        ${card(602, 166, 534, 160, 18, true)}
        ${text({ x: 628, y: 207, value: "Current focus", size: 24, weight: 740 })}
        ${lines({ x: 628, y: 245, values: ["At Cisco, I apply AI and backend engineering", "to automate security-compliance workflows", "used across product teams."], size: 19, lineHeight: 27 })}
        ${metricCards}`,
    });
  }

  const metricCards = metrics.map(([value, label, copy], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 44 + column * 256;
    const y = 610 + row * 178;
    return `${card(x, y, 240, 158, 16, index === 0 || index === 3)}
      ${text({ x: x + 18, y: y + 43, value, size: 30, weight: 780 })}
      ${text({ x: x + 18, y: y + 70, value: label, size: 12, fill: colors.sage, weight: 750, family: mono, spacing: 0.8 })}
      ${lines({ x: x + 18, y: y + 108, values: copy, size: 15, lineHeight: 22 })}`;
  }).join("");
  return svgDocument({
    width,
    height,
    title: "Engineering profile and selected impact",
    description: "Backend and applied-AI engineering profile with measurable outcomes at Cisco.",
    body: `${surface(width, height)}
      ${kicker(44, 70, "Engineering profile")}
      ${lines({ x: 44, y: 116, values: ["Build the foundation.", "Apply intelligence where", "it earns its place."], size: 30, lineHeight: 38, fill: colors.text, weight: 760, spacing: -0.7 })}
      ${card(44, 250, 512, 145, 18)}
      ${text({ x: 68, y: 290, value: "What I build", size: 23, weight: 740 })}
      ${lines({ x: 68, y: 327, values: ["Reliable APIs, event-driven services,", "agent tooling, and deterministic-first", "LLM pipelines."], size: 18, lineHeight: 27 })}
      ${card(44, 415, 512, 155, 18, true)}
      ${text({ x: 68, y: 456, value: "Current focus", size: 23, weight: 740 })}
      ${lines({ x: 68, y: 493, values: ["At Cisco, I apply AI and backend", "engineering to security-compliance", "workflows across product teams."], size: 18, lineHeight: 27 })}
      ${metricCards}`,
  });
}

function projectsHeader(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 170 : 140;
  return svgDocument({
    width,
    height,
    title: "Selected projects",
    description: "Three selected projects showing backend, applied AI, and machine-learning engineering.",
    body: `${text({ x: width / 2, y: mobile ? 30 : 31, value: "SELECTED BUILDS", size: mobile ? 13 : 14, fill: colors.sage, weight: 750, family: mono, spacing: 2.1, anchor: "middle" })}
      ${mobile
        ? lines({ x: width / 2, y: 74, values: ["Three systems.", "Three different engineering problems."], size: 27, lineHeight: 35, fill: colors.text, weight: 760, anchor: "middle" })
        : text({ x: width / 2, y: 82, value: "Three systems. Three different engineering problems.", size: 36, weight: 760, spacing: -1, anchor: "middle" })}
      <path d="M${mobile ? 78 : 110} ${mobile ? 143 : 111} H${mobile ? 255 : 514}" stroke="#b88a4d" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path d="M${mobile ? 345 : 686} ${mobile ? 143 : 111} H${mobile ? 522 : 1090}" stroke="#b88a4d" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path d="M${width / 2} ${mobile ? 137 : 105} l6 6 -6 6 -6 -6z" fill="${colors.amber}"/>`,
  });
}

const projects = {
  ontheway: {
    index: "01 / EVENT-DRIVEN PLATFORM",
    title: "OnTheWay",
    copy: ["Route-aware pickup that synchronizes preparation with a customer's", "live ETA across customer, merchant, and admin workflows."],
    mobileCopy: ["Route-aware pickup that synchronizes preparation", "with a customer's live ETA across customer,", "merchant, and admin workflows."],
    chips: ["Java 17", "Spring Boot", "Kafka", "Elasticsearch", "React", "Kubernetes"],
    meta: "47 REST + 3 GraphQL  /  85 tests  /  730 sessions/sec  /  p99 884 ms",
    side: "right",
    visual: "flow",
  },
  carivyo: {
    index: "02 / LOCAL-FIRST AI",
    title: "Carivyo-AI",
    copy: ["Career intelligence with official ATS connectors, evidence-grounded AI,", "explicit approval gates, and a transparent 27-check diagnostic."],
    mobileCopy: ["Career intelligence with official ATS connectors,", "evidence-grounded AI, explicit approval gates,", "and a transparent 27-check diagnostic."],
    chips: ["React", "TypeScript", "FastAPI", "Python", "SQLite", "LLM APIs"],
    meta: "2 runtimes  /  4 connectors  /  27 ATS checks  /  120 boards",
    side: "left",
    visual: "evidence",
  },
  waternet: {
    index: "03 / APPLIED MACHINE LEARNING",
    title: "WaterNet",
    copy: ["Reproducible water-quality classification with a cached ensemble,", "traceable predictions, batch inference, and a hardened Django API."],
    mobileCopy: ["Reproducible water-quality classification with", "a cached ensemble, traceable predictions, batch", "inference, and a hardened Django API."],
    chips: ["Python", "Django", "scikit-learn", "XGBoost"],
    meta: "95%+ accuracy  /  0.96 AUC  /  sub-50 ms inference",
    side: "right",
    visual: "gauge",
  },
};

function projectVisual(kind, x, y, width, height) {
  const base = `${card(x, y, width, height, 20, true)}`;
  if (kind === "gauge") {
    return `${base}
      ${kicker(x + 26, y + 42, "Model readout")}
      <circle cx="${x + width / 2}" cy="${y + 125}" r="59" fill="none" stroke="${colors.border}" stroke-width="12"/>
      <circle cx="${x + width / 2}" cy="${y + 125}" r="59" fill="none" stroke="${colors.amber}" stroke-width="12" stroke-linecap="round" stroke-dasharray="356 371" transform="rotate(-90 ${x + width / 2} ${y + 125})"/>
      ${text({ x: x + width / 2, y: y + 122, value: "0.96", size: 34, fill: colors.text, weight: 780, anchor: "middle" })}
      ${text({ x: x + width / 2, y: y + 147, value: "AUC", size: 13, fill: colors.sage, weight: 750, family: mono, anchor: "middle", spacing: 1 })}`;
  }
  const names = kind === "flow" ? ["ROUTE", "PREP", "PICKUP"] : ["SOURCE", "EVIDENCE", "REVIEW"];
  const label = kind === "flow" ? "ETA-SYNCHRONIZED FLOW" : "EVIDENCE-GROUNDED FLOW";
  const nodeWidth = Math.floor((width - 82) / 3);
  const nodeY = y + 100;
  return `${base}
    ${kicker(x + 24, y + 44, label)}
    ${names.map((name, index) => {
      const nodeX = x + 24 + index * (nodeWidth + 17);
      return `<rect x="${nodeX}" y="${nodeY}" width="${nodeWidth}" height="54" rx="12" fill="#1b2632" stroke="${colors.border}"/>${text({ x: nodeX + nodeWidth / 2, y: nodeY + 34, value: name, size: 13, weight: 750, family: mono, anchor: "middle" })}${index < 2 ? text({ x: nodeX + nodeWidth + 8, y: nodeY + 35, value: "›", size: 24, fill: colors.amber, weight: 700, anchor: "middle" }) : ""}`;
    }).join("")}`;
}

function projectAsset(key, mobile = false) {
  const project = projects[key];
  const width = mobile ? 600 : 1200;
  const height = mobile ? 600 : 390;
  if (mobile) {
    return svgDocument({
      width,
      height,
      title: `${project.title} project`,
      description: project.mobileCopy.join(" "),
      body: `${surface(width, height)}
        ${text({ x: 44, y: 67, value: project.index, size: 15, fill: colors.amber, weight: 750, family: mono, spacing: 1.2 })}
        ${text({ x: 44, y: 119, value: `${project.title} ↗`, size: 38, weight: 780, spacing: -1 })}
        ${lines({ x: 44, y: 160, values: project.mobileCopy, size: 18, lineHeight: 27 })}
        ${chipLayout(project.chips, 44, 259, 512, 15, 37)}
        ${text({ x: 44, y: 337, value: project.meta, size: 13, fill: colors.muted, weight: 650, family: mono })}
        ${projectVisual(project.visual, 44, 374, 512, 172)}`,
    });
  }

  const textX = project.side === "left" ? 430 : 64;
  const visualX = project.side === "left" ? 64 : 820;
  return svgDocument({
    width,
    height,
    title: `${project.title} project`,
    description: project.copy.join(" "),
    body: `${surface(width, height)}
      ${text({ x: textX, y: 75, value: project.index, size: 15, fill: colors.amber, weight: 750, family: mono, spacing: 1.3 })}
      ${text({ x: textX, y: 133, value: `${project.title} ↗`, size: 42, weight: 780, spacing: -1.2 })}
      ${lines({ x: textX, y: 176, values: project.copy, size: 19, lineHeight: 29 })}
      ${chipLayout(project.chips, textX, 255, 710, 15, 38)}
      ${text({ x: textX, y: 317, value: project.meta, size: 14, fill: colors.muted, weight: 650, family: mono })}
      ${projectVisual(project.visual, visualX, 70, 316, 240)}`,
  });
}

function toolkitIcon(kind, x, y, size) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const frame = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.27}" fill="#18232e" stroke="${colors.border}" stroke-width="1.4"/>`;
  const stroke = `fill="none" stroke="${colors.amber}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;

  if (kind === "ai") {
    return `${frame}<path d="M${cx} ${cy} L${cx - 17} ${cy - 14} M${cx} ${cy} L${cx + 18} ${cy - 13} M${cx} ${cy} L${cx} ${cy + 20}" ${stroke}/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="${colors.amber}"/><circle cx="${cx - 19}" cy="${cy - 16}" r="5" fill="${colors.sage}"/><circle cx="${cx + 20}" cy="${cy - 15}" r="5" fill="${colors.sage}"/><circle cx="${cx}" cy="${cy + 23}" r="5" fill="${colors.sage}"/>`;
  }
  if (kind === "backend") {
    return `${frame}${[-17, 0, 17].map((offset) => `<rect x="${cx - 23}" y="${cy + offset - 6}" width="46" height="12" rx="4" ${stroke}/><circle cx="${cx + 15}" cy="${cy + offset}" r="2.5" fill="${colors.sage}"/>`).join("")}`;
  }
  if (kind === "frontend") {
    return `${frame}<rect x="${cx - 25}" y="${cy - 21}" width="50" height="42" rx="6" ${stroke}/><path d="M${cx - 25} ${cy - 10} H${cx + 25} M${cx - 5} ${cy - 10} V${cy + 21}" ${stroke}/><circle cx="${cx - 17}" cy="${cy - 16}" r="2" fill="${colors.sage}"/><circle cx="${cx - 10}" cy="${cy - 16}" r="2" fill="${colors.sage}"/>`;
  }
  if (kind === "cloud") {
    return `${frame}<path d="M${cx - 25} ${cy + 12} H${cx + 23} C${cx + 33} ${cy + 12} ${cx + 34} ${cy - 4} ${cx + 23} ${cy - 7} C${cx + 20} ${cy - 25} ${cx - 5} ${cy - 27} ${cx - 12} ${cy - 11} C${cx - 31} ${cy - 14} ${cx - 36} ${cy + 8} ${cx - 25} ${cy + 12} Z" ${stroke}/><path d="M${cx - 10} ${cy + 2} L${cx} ${cy - 8} L${cx + 10} ${cy + 2}" ${stroke}/>`;
  }
  return `${frame}<path d="M${cx - 21} ${cy + 20} L${cx + 17} ${cy - 18} M${cx - 17} ${cy - 17} L${cx + 20} ${cy + 20}" ${stroke}/><circle cx="${cx - 21}" cy="${cy + 20}" r="6" ${stroke}/><path d="M${cx + 10} ${cy - 25} L${cx + 24} ${cy - 20} L${cx + 17} ${cy - 9}" ${stroke}/>`;
}

function toolkit(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 780 : 500;
  const groups = [
    { icon: "ai", label: "AI", details: ["MCP · RAG", "LLM APIs"] },
    { icon: "backend", label: "Backend", details: ["Java · Python", "Spring · FastAPI"] },
    { icon: "frontend", label: "Frontend", details: ["React · TypeScript", "JavaScript"] },
    { icon: "cloud", label: "Cloud", details: ["Docker · Kubernetes", "GitHub Actions"] },
    { icon: "tools", label: "Tools", details: ["Kafka · Elasticsearch", "MySQL · Playwright"] },
  ];

  if (!mobile) {
    const cards = groups.map((group, index) => {
      const x = 64 + index * 217;
      const center = x + 101.5;
      return `${card(x, 166, 203, 270, 18, index === 0 || index === 4)}
        ${toolkitIcon(group.icon, x + 67.5, 190, 68)}
        ${text({ x: center, y: 300, value: group.label, size: 24, weight: 760, anchor: "middle" })}
        <path d="M${x + 28} 320 H${x + 175}" stroke="${colors.borderSoft}"/>
        ${lines({ x: center, y: 354, values: group.details, size: 14, lineHeight: 26, fill: colors.muted, weight: 560, anchor: "middle" })}`;
    }).join("");
    return svgDocument({
      width,
      height,
      title: "Engineering toolkit",
      description: "Applied AI, backend, frontend, cloud, and engineering tools used to ship complete systems.",
      body: `${surface(width, height)}${kicker(64, 76, "Engineering toolkit")}${text({ x: 64, y: 126, value: "Five disciplines. One complete engineering workflow.", size: 38, weight: 760, spacing: -1 })}${cards}`,
    });
  }

  const compactCards = groups.slice(0, 4).map((group, index) => {
    const x = 44 + (index % 2) * 264;
    const y = 180 + Math.floor(index / 2) * 206;
    const center = x + 124;
    return `${card(x, y, 248, 190, 17, index === 0)}
      ${toolkitIcon(group.icon, center - 28, y + 20, 56)}
      ${text({ x: center, y: y + 108, value: group.label, size: 21, weight: 760, anchor: "middle" })}
      ${lines({ x: center, y: y + 139, values: group.details, size: 13, lineHeight: 23, fill: colors.muted, weight: 560, anchor: "middle" })}`;
  }).join("");
  const tools = groups[4];
  const toolsCard = `${card(44, 592, 512, 128, 17, true)}${toolkitIcon(tools.icon, 68, 618, 72)}
    ${text({ x: 170, y: 645, value: tools.label, size: 23, weight: 760 })}
    ${lines({ x: 170, y: 676, values: tools.details, size: 14, lineHeight: 23, fill: colors.muted, weight: 560 })}`;
  return svgDocument({
    width,
    height,
    title: "Engineering toolkit",
    description: "Applied AI, backend, frontend, cloud, and engineering tools used to ship complete systems.",
    body: `${surface(width, height)}${kicker(44, 70, "Engineering toolkit")}${lines({ x: 44, y: 116, values: ["Five disciplines. One complete", "engineering workflow."], size: 30, lineHeight: 37, fill: colors.text, weight: 760 })}${compactCards}${toolsCard}`,
  });
}

function highlights(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 850 : 570;
  const items = [
    ["COMPETITIVE PROGRAMMING", "Master / 2141", "CodeChef 4-star / 1893"],
    ["NATIONAL SELECTION", "Top 1%", "Amazon ML Summer School / 50,000+ applicants"],
    ["ENGINEERING COMPETITION", "Top 35", "Cisco Webex Playtime / 2,000+ teams"],
    ["OPEN-SOURCE EDUCATION", "500+ learners", "LER_DSA / 30 days / 20 modules"],
  ];
  if (!mobile) {
    const cards = items.map(([label, value, copy], index) => {
      const x = 64 + (index % 2) * 544;
      const y = 166 + Math.floor(index / 2) * 176;
      return `${card(x, y, 526, 156, 18, index === 0 || index === 3)}
        ${text({ x: x + 24, y: y + 36, value: label, size: 13, fill: colors.sage, weight: 750, family: mono, spacing: 1 })}
        ${text({ x: x + 24, y: y + 82, value, size: 31, weight: 780, spacing: -0.8 })}
        ${text({ x: x + 24, y: y + 119, value: copy, size: 17, fill: colors.muted, weight: 500 })}`;
    }).join("");
    return svgDocument({
      width,
      height,
      title: "Selected highlights",
      description: "Competitive programming, national selection, engineering competition, and open-source education highlights.",
      body: `${surface(width, height)}${kicker(64, 76, "Selected highlights")}${text({ x: 64, y: 126, value: "Signals beyond the technology list.", size: 38, weight: 760, spacing: -1 })}${cards}`,
    });
  }
  const cards = items.map(([label, value, copy], index) => {
    const y = 176 + index * 158;
    return `${card(44, y, 512, 140, 17, index === 0 || index === 3)}
      ${text({ x: 68, y: y + 32, value: label, size: 12, fill: colors.sage, weight: 750, family: mono, spacing: 0.8 })}
      ${text({ x: 68, y: y + 75, value, size: 29, weight: 780 })}
      ${text({ x: 68, y: y + 108, value: copy, size: 16, fill: colors.muted })}`;
  }).join("");
  return svgDocument({
    width,
    height,
    title: "Selected highlights",
    description: "Competitive programming, national selection, engineering competition, and open-source education highlights.",
    body: `${surface(width, height)}${kicker(44, 70, "Selected highlights")}${lines({ x: 44, y: 116, values: ["Signals beyond", "the technology list."], size: 30, lineHeight: 37, fill: colors.text, weight: 760 })}${cards}`,
  });
}

function contributions(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 170 : 140;
  return svgDocument({
    width,
    height,
    title: "Contribution activity",
    description: "Contribution activity with a color-changing snake animation below.",
    body: `${text({ x: width / 2, y: mobile ? 30 : 31, value: "CONTRIBUTIONS", size: mobile ? 13 : 14, fill: colors.sage, weight: 750, family: mono, spacing: 2.1, anchor: "middle" })}
      ${mobile
        ? lines({ x: width / 2, y: 74, values: ["Consistency", "leaves a trail."], size: 29, lineHeight: 35, fill: colors.text, weight: 760, anchor: "middle" })
        : text({ x: width / 2, y: 82, value: "Consistency leaves a trail.", size: 36, weight: 760, spacing: -1, anchor: "middle" })}
      <path d="M${mobile ? 104 : 210} ${mobile ? 143 : 111} H${mobile ? 250 : 514}" stroke="#b88a4d" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path d="M${mobile ? 350 : 686} ${mobile ? 143 : 111} H${mobile ? 496 : 990}" stroke="#b88a4d" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <g transform="translate(${mobile ? 268 : 558} ${mobile ? 135 : 103})">
        <rect x="0" y="0" width="12" height="12" rx="3" fill="#5f3745"/>
        <rect x="18" y="0" width="12" height="12" rx="3" fill="#8c4f4f"/>
        <rect x="36" y="0" width="12" height="12" rx="3" fill="#c17649"/>
        <rect x="54" y="0" width="12" height="12" rx="3" fill="#e6b85c"/>
      </g>`,
  });
}

function footer(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 420 : 300;
  if (!mobile) {
    return svgDocument({
      width,
      height,
      title: "Contact Manohar Eldhandi",
      description: "Email Manohar about backend, applied AI, developer tooling, or product engineering.",
      body: `${surface(width, height)}${kicker(64, 84, "Contact")}${text({ x: 64, y: 145, value: "Let's build something useful.", size: 46, weight: 770, spacing: -1.4 })}${text({ x: 66, y: 190, value: "BACKEND  /  APPLIED AI  /  DEVTOOLS  /  PRODUCT", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1 })}
        ${card(854, 91, 282, 102, 18, true)}${text({ x: 882, y: 150, value: "EMAIL ME", size: 18, weight: 760 })}${text({ x: 1104, y: 154, value: "↗", size: 27, fill: colors.amber, weight: 700, anchor: "middle" })}`,
    });
  }
  return svgDocument({
    width,
    height,
    title: "Contact Manohar Eldhandi",
    description: "Email Manohar about backend, applied AI, developer tooling, or product engineering.",
    body: `${surface(width, height)}${kicker(44, 76, "Contact")}${lines({ x: 44, y: 130, values: ["Let's build", "something useful."], size: 39, lineHeight: 47, fill: colors.text, weight: 770, spacing: -1 })}${text({ x: 46, y: 253, value: "BACKEND / APPLIED AI / DEVTOOLS / PRODUCT", size: 13, fill: colors.muted, weight: 700, family: mono, spacing: 0.7 })}${card(44, 292, 512, 76, 16, true)}${text({ x: 68, y: 339, value: "EMAIL ME", size: 19, weight: 760 })}${text({ x: 524, y: 343, value: "↗", size: 27, fill: colors.amber, weight: 700, anchor: "middle" })}`,
  });
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const assets = new Map([
  ["hero.svg", hero(false)],
  ["hero-mobile.svg", hero(true)],
  ["profile.svg", profile(false)],
  ["profile-mobile.svg", profile(true)],
  ["projects-header.svg", projectsHeader(false)],
  ["projects-header-mobile.svg", projectsHeader(true)],
  ["project-ontheway.svg", projectAsset("ontheway", false)],
  ["project-ontheway-mobile.svg", projectAsset("ontheway", true)],
  ["project-carivyo.svg", projectAsset("carivyo", false)],
  ["project-carivyo-mobile.svg", projectAsset("carivyo", true)],
  ["project-waternet.svg", projectAsset("waternet", false)],
  ["project-waternet-mobile.svg", projectAsset("waternet", true)],
  ["toolkit.svg", toolkit(false)],
  ["toolkit-mobile.svg", toolkit(true)],
  ["highlights.svg", highlights(false)],
  ["highlights-mobile.svg", highlights(true)],
  ["contributions.svg", contributions(false)],
  ["contributions-mobile.svg", contributions(true)],
  ["footer.svg", footer(false)],
  ["footer-mobile.svg", footer(true)],
  ["nav-portfolio.svg", navButton("Portfolio")],
  ["nav-portfolio-mobile.svg", navButton("Portfolio", true)],
  ["nav-resume.svg", navButton("Resume")],
  ["nav-resume-mobile.svg", navButton("Resume", true)],
  ["nav-linkedin.svg", navButton("LinkedIn")],
  ["nav-linkedin-mobile.svg", navButton("LinkedIn", true)],
  ["nav-email.svg", navButton("Email")],
  ["nav-email-mobile.svg", navButton("Email", true)],
  ["nav-codeforces.svg", navButton("Codeforces")],
  ["nav-codeforces-mobile.svg", navButton("Codeforces", true)],
  ["nav-codechef.svg", navButton("CodeChef")],
  ["nav-codechef-mobile.svg", navButton("CodeChef", true)],
  ["nav-lerdsa.svg", navButton("LER_DSA")],
  ["nav-lerdsa-mobile.svg", navButton("LER_DSA", true)],
]);

for (const [filename, svg] of assets) {
  await writeFile(path.join(outputDirectory, filename), `${svg}\n`, "utf8");
}

console.log(`Generated ${assets.size} pure-SVG profile assets in ${outputDirectory}`);
