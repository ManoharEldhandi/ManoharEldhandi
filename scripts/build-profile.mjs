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
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity="0.34"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="${colors.bg}"/>
  <g font-family="${sans}">${body}</g>
</svg>`;
}

function surface(width, height, radius = 28) {
  return `<g filter="url(#shadow)">
    <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="${radius}" fill="url(#panel)" stroke="${colors.border}" stroke-width="1.5"/>
    <rect x="26" y="26" width="${width - 52}" height="${height - 52}" rx="${Math.max(12, radius - 9)}" fill="none" stroke="#ffffff" stroke-opacity="0.035"/>
    <path d="M54 17 H${width - 54}" stroke="#ffffff" stroke-opacity="0.08"/>
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
    ${kicker(64, 158, "Applied AI + Backend Engineering")}
    ${text({ x: 64, y: 230, value: "Manohar Eldhandi", size: 66, weight: 780, spacing: -2.7 })}
    ${text({ x: 66, y: 278, value: "AI & Backend Engineer", size: 29, fill: colors.amber, weight: 720, spacing: -0.4 })}
    ${lines({ x: 66, y: 331, values: ["I build dependable backend platforms and applied-AI products with Java and Python—", "designed for real users, observable decisions, and production reliability."], size: 19, lineHeight: 31 })}
    ${card(820, 126, 314, 230, 20, true)}
    ${kicker(850, 165, "Current role")}
    ${text({ x: 850, y: 211, value: "Software Engineer", size: 26, weight: 740 })}
    ${text({ x: 850, y: 243, value: "at Cisco", size: 26, weight: 740 })}
    ${lines({ x: 850, y: 281, values: ["Applying agentic AI and backend", "engineering to security-compliance", "workflows across product teams."], size: 16, lineHeight: 25 })}
    <path d="M64 418 H1136" stroke="${colors.borderSoft}"/>
    ${text({ x: 230, y: 458, value: "BACKEND SYSTEMS", size: 13, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}
    <path d="M405 432 V470" stroke="${colors.borderSoft}"/>
    ${text({ x: 600, y: 458, value: "APPLIED AI", size: 13, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}
    <path d="M795 432 V470" stroke="${colors.borderSoft}"/>
    ${text({ x: 970, y: 458, value: "PRODUCT ENGINEERING", size: 13, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}`;

  const mobileBody = `${surface(width, height)}
    <rect x="44" y="48" width="44" height="44" rx="12" fill="#18212b" stroke="${colors.border}"/>
    ${text({ x: 66, y: 77, value: "ME", size: 15, fill: colors.amber, weight: 800, anchor: "middle", spacing: 1 })}
    ${status(418, 76, "BENGALURU / IST")}
    ${kicker(44, 146, "Applied AI + Backend")}
    ${lines({ x: 44, y: 211, values: ["Manohar", "Eldhandi"], size: 58, lineHeight: 60, fill: colors.text, weight: 780, spacing: -2.2 })}
    ${text({ x: 46, y: 352, value: "AI & Backend Engineer", size: 27, fill: colors.amber, weight: 730 })}
    ${lines({ x: 46, y: 401, values: ["I build dependable backend platforms and applied-AI", "products with Java and Python—designed for real users,", "observable decisions, and production reliability."], size: 17, lineHeight: 27 })}
    ${card(44, 505, 512, 160, 18, true)}
    ${kicker(68, 540, "Current role")}
    ${text({ x: 68, y: 578, value: "Software Engineer at Cisco", size: 24, weight: 740 })}
    ${lines({ x: 68, y: 614, values: ["Agentic AI + backend engineering for security-compliance", "workflows used across Cisco product teams."], size: 15, lineHeight: 24 })}
    <path d="M44 704 H556" stroke="${colors.borderSoft}"/>
    ${text({ x: 300, y: 735, value: "BACKEND  /  APPLIED AI  /  PRODUCT", size: 13, fill: colors.muted, weight: 700, family: mono, spacing: 1, anchor: "middle" })}`;

  return svgDocument({
    width,
    height,
    title: "Manohar Eldhandi — AI and Backend Engineer",
    description: "Software Engineer at Cisco in Bengaluru focused on applied AI, backend systems, and product engineering.",
    body: mobile ? mobileBody : desktopBody,
  });
}

function navButton(label, caption) {
  const width = 280;
  const height = 82;
  return svgDocument({
    width,
    height,
    title: label,
    description: `Open ${label}`,
    body: `<rect x="4" y="4" width="272" height="74" rx="18" fill="url(#panel)" stroke="${colors.border}"/>
      <rect x="12" y="12" width="256" height="58" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.035"/>
      ${text({ x: 24, y: 36, value: label.toUpperCase(), size: 20, weight: 760, spacing: -0.2 })}
      ${text({ x: 24, y: 58, value: caption, size: 10, fill: colors.sage, weight: 700, family: mono, spacing: 1.1 })}
      ${text({ x: 252, y: 51, value: "↗", size: 26, fill: colors.amber, weight: 700, anchor: "middle" })}`,
  });
}

function profile(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 980 : 620;
  const metrics = [
    ["50+", "ENGINEERS", ["Adopted across four Cisco", "product teams."]],
    ["70%", "LESS REVIEW", ["Traceable automation reduced", "manual effort."]],
    ["10×", "FEWER CALLS", ["A deterministic-first", "11-phase AI pipeline."]],
    ["736", "TESTS / 96% UI", ["Automation strengthened", "release confidence."]],
  ];

  if (!mobile) {
    const metricCards = metrics.map(([value, label, copy], index) => {
      const x = 64 + index * 270;
      return `${card(x, 366, 252, 180, 17, index === 0 || index === 3)}
        ${text({ x: x + 22, y: 414, value, size: 34, weight: 780, spacing: -1 })}
        ${text({ x: x + 22, y: 445, value: label, size: 12, fill: colors.sage, weight: 750, family: mono, spacing: 1 })}
        ${lines({ x: x + 22, y: 484, values: copy, size: 14, lineHeight: 22 })}`;
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
        ${lines({ x: 90, y: 245, values: ["Reliable APIs, event-driven services, agent tooling, and", "deterministic-first LLM pipelines that hold up in production."], size: 17, lineHeight: 28 })}
        ${card(602, 166, 534, 160, 18, true)}
        ${text({ x: 628, y: 207, value: "Current focus", size: 24, weight: 740 })}
        ${lines({ x: 628, y: 245, values: ["At Cisco, I apply AI and backend engineering to automate", "security-compliance workflows used across product teams."], size: 17, lineHeight: 28 })}
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
      ${text({ x: x + 18, y: y + 70, value: label, size: 11, fill: colors.sage, weight: 750, family: mono, spacing: 0.8 })}
      ${lines({ x: x + 18, y: y + 108, values: copy, size: 13, lineHeight: 20 })}`;
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
      ${lines({ x: 68, y: 327, values: ["Reliable APIs, event-driven services, agent tooling,", "and deterministic-first LLM pipelines."], size: 16, lineHeight: 26 })}
      ${card(44, 415, 512, 155, 18, true)}
      ${text({ x: 68, y: 456, value: "Current focus", size: 23, weight: 740 })}
      ${lines({ x: 68, y: 493, values: ["At Cisco, I apply AI and backend engineering to", "security-compliance automation across product teams."], size: 16, lineHeight: 26 })}
      ${metricCards}`,
  });
}

function projectsHeader(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 230 : 190;
  return svgDocument({
    width,
    height,
    title: "Selected projects",
    description: "Three selected projects showing backend, applied AI, and machine-learning engineering.",
    body: `${surface(width, height, 24)}
      ${kicker(mobile ? 44 : 64, mobile ? 70 : 72, "Selected builds")}
      ${mobile
        ? lines({ x: 44, y: 116, values: ["Three systems.", "Three different engineering problems."], size: 30, lineHeight: 38, fill: colors.text, weight: 760 })
        : text({ x: 64, y: 128, value: "Three systems. Three different engineering problems.", size: 38, weight: 760, spacing: -1 })}
    `,
  });
}

const projects = {
  ontheway: {
    index: "01 / EVENT-DRIVEN PLATFORM",
    title: "OnTheWay",
    copy: ["Route-aware pickup that synchronizes preparation with a customer's", "live ETA across customer, merchant, and admin workflows."],
    mobileCopy: ["Route-aware pickup that synchronizes preparation", "with a customer's live ETA across customer,", "merchant, and admin workflows."],
    chips: ["Java 17", "Spring Boot", "Kafka", "Elasticsearch", "React", "Kubernetes"],
    meta: "115 shops  /  507 items  /  70+ tests  /  1,000-user load test",
    side: "right",
    visual: "flow",
  },
  carivyo: {
    index: "02 / LOCAL-FIRST AI",
    title: "Carivyo",
    copy: ["Career intelligence with official ATS connectors, evidence-grounded AI,", "explicit approval gates, and a transparent 27-check diagnostic."],
    mobileCopy: ["Career intelligence with official ATS connectors,", "evidence-grounded AI, explicit approval gates,", "and a transparent 27-check diagnostic."],
    chips: ["React", "TypeScript", "FastAPI", "Python", "SQLite", "LLM APIs"],
    meta: "4 ATS connectors  /  local-model support  /  explicit trust boundaries",
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
      ${text({ x: x + width / 2, y: y + 147, value: "AUC", size: 12, fill: colors.sage, weight: 750, family: mono, anchor: "middle", spacing: 1 })}`;
  }
  const names = kind === "flow" ? ["ROUTE", "PREP", "PICKUP"] : ["SOURCE", "EVIDENCE", "REVIEW"];
  const label = kind === "flow" ? "ETA-SYNCHRONIZED FLOW" : "EVIDENCE-GROUNDED FLOW";
  const nodeWidth = Math.floor((width - 82) / 3);
  const nodeY = y + 100;
  return `${base}
    ${kicker(x + 24, y + 44, label)}
    ${names.map((name, index) => {
      const nodeX = x + 24 + index * (nodeWidth + 17);
      return `<rect x="${nodeX}" y="${nodeY}" width="${nodeWidth}" height="54" rx="12" fill="#1b2632" stroke="${colors.border}"/>${text({ x: nodeX + nodeWidth / 2, y: nodeY + 34, value: name, size: 12, weight: 750, family: mono, anchor: "middle" })}${index < 2 ? text({ x: nodeX + nodeWidth + 8, y: nodeY + 35, value: "›", size: 24, fill: colors.amber, weight: 700, anchor: "middle" }) : ""}`;
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
        ${text({ x: 44, y: 67, value: project.index, size: 14, fill: colors.amber, weight: 750, family: mono, spacing: 1.2 })}
        ${text({ x: 44, y: 119, value: `${project.title} ↗`, size: 38, weight: 780, spacing: -1 })}
        ${lines({ x: 44, y: 160, values: project.mobileCopy, size: 16, lineHeight: 25 })}
        ${chipLayout(project.chips, 44, 259, 512, 14, 37)}
        ${text({ x: 44, y: 337, value: project.meta, size: 12, fill: colors.muted, weight: 650, family: mono })}
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
      ${text({ x: textX, y: 75, value: project.index, size: 14, fill: colors.amber, weight: 750, family: mono, spacing: 1.3 })}
      ${text({ x: textX, y: 133, value: `${project.title} ↗`, size: 42, weight: 780, spacing: -1.2 })}
      ${lines({ x: textX, y: 176, values: project.copy, size: 17, lineHeight: 27 })}
      ${chipLayout(project.chips, textX, 255, 710, 14, 38)}
      ${text({ x: textX, y: 317, value: project.meta, size: 13, fill: colors.muted, weight: 650, family: mono })}
      ${projectVisual(project.visual, visualX, 70, 316, 240)}`,
  });
}

function toolkit(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 740 : 500;
  const groups = [
    ["BACKEND + DATA", ["Java", "Python", "Spring Boot", "FastAPI", "Kafka", "Elasticsearch", "MySQL"]],
    ["APPLIED AI + PRODUCT", ["MCP", "RAG", "LLM APIs", "React", "TypeScript", "WebSockets"]],
    ["QUALITY + DELIVERY", ["JUnit 5", "pytest", "Playwright", "Docker", "Kubernetes", "GitHub Actions"]],
  ];
  if (!mobile) {
    const rows = groups.map(([label, chips], index) => {
      const y = 168 + index * 98;
      return `${card(64, y, 1072, 82, 15, index === 1)}
        ${text({ x: 90, y: y + 48, value: label, size: 14, fill: colors.sage, weight: 750, family: mono, spacing: 1 })}
        <path d="M310 ${y + 18} V${y + 64}" stroke="${colors.border}"/>
        ${chipLayout(chips, 338, y + 49, 760, 14, 35)}`;
    }).join("");
    return svgDocument({
      width,
      height,
      title: "Engineering toolkit",
      description: "A focused toolkit across backend, applied AI, product engineering, quality, and delivery.",
      body: `${surface(width, height)}${kicker(64, 76, "Engineering toolkit")}${text({ x: 64, y: 126, value: "A focused stack for shipping complete systems.", size: 38, weight: 760, spacing: -1 })}${rows}`,
    });
  }
  const rows = groups.map(([label, chips], index) => {
    const y = 180 + index * 170;
    return `${card(44, y, 512, 150, 17, index === 1)}
      ${text({ x: 68, y: y + 38, value: label, size: 13, fill: colors.sage, weight: 750, family: mono, spacing: 0.9 })}
      ${chipLayout(chips, 68, y + 86, 462, 14, 38)}`;
  }).join("");
  return svgDocument({
    width,
    height,
    title: "Engineering toolkit",
    description: "A focused toolkit across backend, applied AI, product engineering, quality, and delivery.",
    body: `${surface(width, height)}${kicker(44, 70, "Engineering toolkit")}${lines({ x: 44, y: 116, values: ["A focused stack for shipping", "complete systems."], size: 30, lineHeight: 37, fill: colors.text, weight: 760 })}${rows}`,
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
        ${text({ x: x + 24, y: y + 36, value: label, size: 12, fill: colors.sage, weight: 750, family: mono, spacing: 1 })}
        ${text({ x: x + 24, y: y + 82, value, size: 31, weight: 780, spacing: -0.8 })}
        ${text({ x: x + 24, y: y + 119, value: copy, size: 15, fill: colors.muted, weight: 500 })}`;
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
      ${text({ x: 68, y: y + 32, value: label, size: 11, fill: colors.sage, weight: 750, family: mono, spacing: 0.8 })}
      ${text({ x: 68, y: y + 75, value, size: 29, weight: 780 })}
      ${text({ x: 68, y: y + 108, value: copy, size: 14, fill: colors.muted })}`;
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
  const height = mobile ? 250 : 190;
  const x = mobile ? 44 : 64;
  return svgDocument({
    width,
    height,
    title: "Contribution activity",
    description: "Contribution activity with a color-changing snake animation below.",
    body: `${surface(width, height, 24)}
      ${kicker(x, mobile ? 70 : 72, "Contributions")}
      ${mobile
        ? lines({ x, y: 116, values: ["Consistency", "leaves a trail."], size: 31, lineHeight: 38, fill: colors.text, weight: 760 })
        : text({ x, y: 128, value: "Consistency leaves a trail.", size: 38, weight: 760, spacing: -1 })}
      <g transform="translate(${mobile ? 410 : 1008} ${mobile ? 176 : 100})">
        <rect x="0" y="0" width="16" height="16" rx="4" fill="#5f3745"/>
        <rect x="24" y="0" width="16" height="16" rx="4" fill="#8c4f4f"/>
        <rect x="48" y="0" width="16" height="16" rx="4" fill="#c17649"/>
        <rect x="72" y="0" width="16" height="16" rx="4" fill="#e6b85c"/>
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
      body: `${surface(width, height)}${kicker(64, 84, "Contact")}${text({ x: 64, y: 145, value: "Let's build something useful.", size: 46, weight: 770, spacing: -1.4 })}${text({ x: 66, y: 190, value: "BACKEND  /  APPLIED AI  /  DEVTOOLS  /  PRODUCT", size: 13, fill: colors.muted, weight: 700, family: mono, spacing: 1 })}
        ${card(854, 91, 282, 102, 18, true)}${text({ x: 882, y: 150, value: "EMAIL MANOHAR", size: 18, weight: 760 })}${text({ x: 1104, y: 154, value: "↗", size: 27, fill: colors.amber, weight: 700, anchor: "middle" })}`,
    });
  }
  return svgDocument({
    width,
    height,
    title: "Contact Manohar Eldhandi",
    description: "Email Manohar about backend, applied AI, developer tooling, or product engineering.",
    body: `${surface(width, height)}${kicker(44, 76, "Contact")}${lines({ x: 44, y: 130, values: ["Let's build", "something useful."], size: 39, lineHeight: 47, fill: colors.text, weight: 770, spacing: -1 })}${text({ x: 46, y: 253, value: "BACKEND / APPLIED AI / DEVTOOLS / PRODUCT", size: 12, fill: colors.muted, weight: 700, family: mono, spacing: 0.7 })}${card(44, 292, 512, 76, 16, true)}${text({ x: 68, y: 339, value: "EMAIL MANOHAR", size: 19, weight: 760 })}${text({ x: 524, y: 343, value: "↗", size: 27, fill: colors.amber, weight: 700, anchor: "middle" })}`,
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
  ["nav-portfolio.svg", navButton("Portfolio", "SELECTED WORK")],
  ["nav-resume.svg", navButton("Resume", "EXPERIENCE")],
  ["nav-linkedin.svg", navButton("LinkedIn", "CONNECT")],
  ["nav-email.svg", navButton("Email", "START A CONVERSATION")],
  ["nav-codeforces.svg", navButton("Codeforces", "MASTER / 2141")],
  ["nav-lerdsa.svg", navButton("LER_DSA", "OPEN ROADMAP")],
]);

for (const [filename, svg] of assets) {
  await writeFile(path.join(outputDirectory, filename), `${svg}\n`, "utf8");
}

console.log(`Generated ${assets.size} pure-SVG profile assets in ${outputDirectory}`);
