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
  const height = mobile ? 840 : 540;
  const desktopBody = `${surface(width, height)}
    <rect x="64" y="62" width="44" height="44" rx="12" fill="#18212b" stroke="${colors.border}"/>
    ${text({ x: 86, y: 91, value: "ME", size: 15, fill: colors.amber, weight: 800, anchor: "middle", spacing: 1 })}
    ${status(985, 90, "HYDERABAD / IST")}
    ${kicker(64, 158, "Agentic AI · Security automation")}
    ${text({ x: 64, y: 230, value: "Manohar Eldhandi", size: 66, weight: 780, spacing: -2.7 })}
    ${text({ x: 66, y: 278, value: "Software Engineer", size: 29, fill: colors.amber, weight: 720, spacing: -0.4 })}
    ${lines({ x: 66, y: 322, values: ["I build agentic AI systems for security automation.", "My Cisco work covered prompting, RAG architecture,", "and MCP tools for security-compliance review automation.", "Now I’m building Model Logger and Carivyo."], size: 21, lineHeight: 28 })}
    <path d="M790 126 V356" stroke="${colors.borderSoft}" stroke-width="1.4"/>
    <path d="M812 126 V356" stroke="#b88a4d" stroke-opacity="0.58" stroke-width="1.4"/>
    ${kicker(842, 158, "Cisco · 2025–2026")}
    ${text({ x: 842, y: 205, value: "Software Engineer", size: 27, weight: 740 })}
    ${lines({ x: 842, y: 234, values: ["India Technical", "Apprentice Program"], size: 12, lineHeight: 16, fill: colors.amber, weight: 700, family: mono, spacing: 0.2 })}
    <path d="M842 267 H1136" stroke="${colors.borderSoft}"/>
    ${kicker(842, 294, "Focus")}
    ${text({ x: 842, y: 325, value: "Agentic AI", size: 22, weight: 720 })}
    ${text({ x: 842, y: 353, value: "Prompts, RAG, and guardrails.", size: 16, fill: colors.muted, weight: 500 })}
    <path d="M64 438 H1136" stroke="${colors.borderSoft}"/>
    ${text({ x: 230, y: 478, value: "AGENTIC AI", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}
    <path d="M405 452 V490" stroke="${colors.borderSoft}"/>
    ${text({ x: 600, y: 478, value: "SECURITY AUTOMATION", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}
    <path d="M795 452 V490" stroke="${colors.borderSoft}"/>
    ${text({ x: 970, y: 478, value: "GUARDRAILS", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1.2, anchor: "middle" })}`;

  const mobileBody = `${surface(width, height)}
    <rect x="44" y="48" width="44" height="44" rx="12" fill="#18212b" stroke="${colors.border}"/>
    ${text({ x: 66, y: 77, value: "ME", size: 15, fill: colors.amber, weight: 800, anchor: "middle", spacing: 1 })}
    ${status(418, 76, "HYDERABAD / IST")}
    ${kicker(44, 146, "Agentic AI · Security automation")}
    ${lines({ x: 44, y: 211, values: ["Manohar", "Eldhandi"], size: 58, lineHeight: 60, fill: colors.text, weight: 780, spacing: -2.2 })}
    ${text({ x: 46, y: 352, value: "Software Engineer", size: 27, fill: colors.amber, weight: 730 })}
    ${lines({ x: 46, y: 401, values: ["I build agentic AI for security automation.", "At Cisco, I worked on prompt engineering,", "RAG architecture, and MCP integrations for", "security-compliance review automation.", "Now I’m building Model Logger and Carivyo."], size: 19, lineHeight: 29 })}
    ${card(44, 565, 512, 160, 18, true)}
    ${kicker(68, 600, "Cisco · 2025–2026")}
    ${text({ x: 68, y: 638, value: "Software Engineer", size: 24, weight: 740 })}
    ${text({ x: 68, y: 663, value: "India Technical Apprentice Program", size: 12, fill: colors.amber, weight: 700, family: mono, spacing: 0.1 })}
    ${text({ x: 68, y: 698, value: "Security-compliance review automation.", size: 15, fill: colors.muted, weight: 450 })}
    <path d="M44 764 H556" stroke="${colors.borderSoft}"/>
    ${text({ x: 300, y: 795, value: "AGENTIC AI / SECURITY AUTOMATION / GUARDRAILS", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1, anchor: "middle" })}`;

  return svgDocument({
    width,
    height,
    title: "Manohar Eldhandi — Software Engineer",
    description: "Manohar Eldhandi builds agentic AI systems for security automation, with Cisco experience in prompt engineering, RAG architecture, and MCP integrations. Building Model Logger and Carivyo for agent observability, retrieval, and security guardrails.",
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
  const height = mobile ? 910 : 620;
  const metrics = [
    ["50+", "ENGINEERS", ["Across four Cisco", "product teams."]],
    ["80%", "LESS REVIEW TIME", ["80 to 16 hours", "per review cycle."]],
    ["20K+", "SOURCE FILES", ["An 11-stage RAG and", "code-graph pipeline."]],
    ["10×", "FEWER MODEL CALLS", ["With source evidence", "kept traceable."]],
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
      description: "Agentic AI for security-compliance review automation at Cisco, October 2025 to October 2026. Prompt engineering, RAG architecture, and MCP integrations. Review time reduced from 80 to 16 hours per cycle for 50+ engineers across four product teams.",
      body: `${surface(width, height)}
        ${kicker(64, 78, "Engineering profile")}
        ${text({ x: 64, y: 126, value: "Security-compliance review automation.", size: 36, weight: 760, spacing: -1.1 })}
        ${card(64, 166, 520, 160, 18)}
        ${text({ x: 90, y: 207, value: "The work", size: 24, weight: 740 })}
        ${lines({ x: 90, y: 245, values: ["LangGraph, LangChain, and two LLM providers.", "MCP tools for Jira and security data.", "Prompt engineering and structured outputs."], size: 19, lineHeight: 27 })}
        ${card(602, 166, 534, 160, 18, true)}
        ${text({ x: 628, y: 207, value: "RAG and testing", size: 24, weight: 740 })}
        ${lines({ x: 628, y: 245, values: ["RAG architecture with traceable source evidence.", "Code reviews and automated UI checks.", "97% Playwright UI coverage."], size: 19, lineHeight: 27 })}
        ${metricCards}`,
    });
  }

  const metricCards = metrics.map(([value, label, copy], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 44 + column * 256;
    const y = 550 + row * 178;
    return `${card(x, y, 240, 158, 16, index === 0 || index === 3)}
      ${text({ x: x + 18, y: y + 43, value, size: 30, weight: 780 })}
      ${text({ x: x + 18, y: y + 70, value: label, size: 12, fill: colors.sage, weight: 750, family: mono, spacing: 0.8 })}
      ${lines({ x: x + 18, y: y + 108, values: copy, size: 15, lineHeight: 22 })}`;
  }).join("");
  return svgDocument({
    width,
    height,
    title: "Engineering profile and selected impact",
    description: "Agentic AI for security-compliance review automation at Cisco, October 2025 to October 2026. Prompt engineering, RAG architecture, and MCP integrations. Review time reduced from 80 to 16 hours per cycle for 50+ engineers across four product teams.",
    body: `${surface(width, height)}
      ${kicker(44, 70, "Engineering profile")}
      ${lines({ x: 44, y: 116, values: ["Security-compliance", "review automation."], size: 30, lineHeight: 38, fill: colors.text, weight: 760, spacing: -0.7 })}
      ${card(44, 205, 512, 145, 18)}
      ${text({ x: 68, y: 245, value: "The work", size: 23, weight: 740 })}
      ${lines({ x: 68, y: 282, values: ["LangGraph, LangChain, and two LLM providers.", "MCP tools for Jira and security data.", "Prompt engineering and structured outputs."], size: 18, lineHeight: 27 })}
      ${card(44, 370, 512, 145, 18, true)}
      ${text({ x: 68, y: 410, value: "RAG and testing", size: 23, weight: 740 })}
      ${lines({ x: 68, y: 447, values: ["RAG architecture with traceable source evidence.", "Code reviews and automated UI checks.", "97% Playwright UI coverage."], size: 18, lineHeight: 27 })}
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
    description: "Model Logger and Carivyo: agent observability, hybrid retrieval, and career workflows with security guardrails.",
    body: `${text({ x: width / 2, y: mobile ? 30 : 31, value: "PROJECTS", size: mobile ? 13 : 14, fill: colors.sage, weight: 750, family: mono, spacing: 2.1, anchor: "middle" })}
      ${mobile
        ? lines({ x: width / 2, y: 74, values: ["Model Logger", "and Carivyo."], size: 27, lineHeight: 35, fill: colors.text, weight: 760, anchor: "middle" })
        : text({ x: width / 2, y: 82, value: "What I’m building.", size: 36, weight: 760, spacing: -1, anchor: "middle" })}
      <path d="M${mobile ? 78 : 110} ${mobile ? 143 : 111} H${mobile ? 255 : 514}" stroke="#b88a4d" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path d="M${mobile ? 345 : 686} ${mobile ? 143 : 111} H${mobile ? 522 : 1090}" stroke="#b88a4d" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path d="M${width / 2} ${mobile ? 137 : 105} l6 6 -6 6 -6 -6z" fill="${colors.amber}"/>`,
  });
}

const projects = {
  modelLogger: {
    index: "01 / AGENT OBSERVABILITY",
    title: "Model Logger",
    copy: ["Local traces for AI agents: tool calls, failures, and token usage.", "Redacts sensitive logs; hybrid search is available on main."],
    mobileCopy: ["Redacted agent traces: tool calls, failures,", "and token usage. Hybrid log search is", "available in the source checkout."],
    chips: ["TypeScript", "Node.js", "ChromaDB", "BM25 · RRF", "Reranking"],
    meta: "v2.1.0 tracing / SDK and VS Code / RAG on main",
    side: "right",
    visual: "logs",
  },
  carivyo: {
    index: "02 / CAREER INTELLIGENCE",
    title: "Carivyo",
    copy: ["Find jobs and prepare materials from approved resume evidence.", "Codex-assisted workflows, local Ollama chat, and user review."],
    mobileCopy: ["Find jobs and prepare application materials", "from approved resume evidence. Codex-assisted", "workflows, local Ollama chat, and user review."],
    chips: ["Python", "FastAPI", "SQLite", "Ollama"],
    meta: "4 ATS connectors / 120 boards / 27 resume checks",
    side: "left",
    visual: "career",
  },
};

function projectVisual(kind, x, y, width, height) {
  const base = `${card(x, y, width, height, 20, true)}`;
  const names = kind === "career" ? ["RESUME", "MATCH", "REVIEW"] : ["CAPTURE", "SEARCH", "REVIEW"];
  const label = kind === "career" ? "CAREER WORKSPACE" : "LOG RETRIEVAL";
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
  const height = mobile ? 824 : 500;
  const groups = [
    { icon: "backend", label: "Python", details: ["FastAPI · asyncio", "SQL · SQLite"] },
    { icon: "ai", label: "Agentic AI", details: ["LangGraph · LangChain", "MCP · LLM APIs", "Prompts · guardrails"] },
    { icon: "backend", label: "Retrieval", details: ["ChromaDB · BM25", "RRF · embeddings", "Reranking"] },
    { icon: "tools", label: "Testing", details: ["Playwright · pytest", "Git · CI/CD"] },
    { icon: "tools", label: "Tools", details: ["Docker · Linux", "TypeScript · Node.js"] },
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
      description: "Python, agentic AI, prompt engineering, security guardrails, retrieval, testing, and development tools.",
      body: `${surface(width, height)}${kicker(64, 76, "Engineering toolkit")}${text({ x: 64, y: 126, value: "Tools I use.", size: 38, weight: 760, spacing: -1 })}${cards}`,
    });
  }

  const compactCards = groups.slice(0, 4).map((group, index) => {
    const x = 44 + (index % 2) * 264;
    const y = 180 + Math.floor(index / 2) * 226;
    const center = x + 124;
    return `${card(x, y, 248, 210, 17, index === 0)}
      ${toolkitIcon(group.icon, center - 28, y + 20, 56)}
      ${text({ x: center, y: y + 108, value: group.label, size: 21, weight: 760, anchor: "middle" })}
      ${lines({ x: center, y: y + 139, values: group.details, size: 13, lineHeight: 23, fill: colors.muted, weight: 560, anchor: "middle" })}`;
  }).join("");
  const tools = groups[4];
  const toolsCard = `${card(44, 636, 512, 128, 17, true)}${toolkitIcon(tools.icon, 68, 662, 72)}
    ${text({ x: 170, y: 689, value: tools.label, size: 23, weight: 760 })}
    ${lines({ x: 170, y: 720, values: tools.details, size: 14, lineHeight: 23, fill: colors.muted, weight: 560 })}`;
  return svgDocument({
    width,
    height,
    title: "Engineering toolkit",
    description: "Python, agentic AI, prompt engineering, security guardrails, retrieval, testing, and development tools.",
    body: `${surface(width, height)}${kicker(44, 70, "Engineering toolkit")}${lines({ x: 44, y: 116, values: ["Tools I use.", "Agents, retrieval, and testing."], size: 30, lineHeight: 37, fill: colors.text, weight: 760 })}${compactCards}${toolsCard}`,
  });
}

function highlights(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 850 : 570;
  const items = [
    ["COMPETITIVE PROGRAMMING", "Master / 2141", "CodeChef 4-star / 1893"],
    ["NATIONAL SELECTION", "Top 1%", "Amazon ML Summer School / 50,000+ applicants"],
    ["CISCO WEBEX PLAYTIME", "Top 35", "AI security automation / 2,000+ teams"],
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
      body: `${surface(width, height)}${kicker(64, 76, "Selected highlights")}${text({ x: 64, y: 126, value: "A few milestones.", size: 38, weight: 760, spacing: -1 })}${cards}`,
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
    body: `${surface(width, height)}${kicker(44, 70, "Selected highlights")}${lines({ x: 44, y: 116, values: ["A few", "milestones."], size: 30, lineHeight: 37, fill: colors.text, weight: 760 })}${cards}`,
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
        ? lines({ x: width / 2, y: 74, values: ["GitHub", "activity."], size: 29, lineHeight: 35, fill: colors.text, weight: 760, anchor: "middle" })
        : text({ x: width / 2, y: 82, value: "GitHub activity.", size: 36, weight: 760, spacing: -1, anchor: "middle" })}
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
      description: "Email Manohar about agentic AI, security automation, and developer tooling roles.",
      body: `${surface(width, height)}${kicker(64, 84, "Contact")}${text({ x: 64, y: 145, value: "Get in touch.", size: 46, weight: 770, spacing: -1.4 })}${text({ x: 66, y: 190, value: "AGENTIC AI / SECURITY AUTOMATION / DEVELOPER TOOLING", size: 14, fill: colors.muted, weight: 700, family: mono, spacing: 1 })}
        ${card(854, 91, 282, 102, 18, true)}${text({ x: 882, y: 150, value: "EMAIL ME", size: 18, weight: 760 })}${text({ x: 1104, y: 154, value: "↗", size: 27, fill: colors.amber, weight: 700, anchor: "middle" })}`,
    });
  }
  return svgDocument({
    width,
    height,
    title: "Contact Manohar Eldhandi",
    description: "Email Manohar about agentic AI, security automation, and developer tooling roles.",
    body: `${surface(width, height)}${kicker(44, 76, "Contact")}${lines({ x: 44, y: 130, values: ["Get in touch.", "I’d like to hear from you."], size: 39, lineHeight: 47, fill: colors.text, weight: 770, spacing: -1 })}${lines({ x: 46, y: 241, values: ["AGENTIC AI / SECURITY AUTOMATION", "DEVELOPER TOOLING"], size: 13, lineHeight: 25, fill: colors.muted, weight: 700, family: mono, spacing: 0.7 })}${card(44, 292, 512, 76, 16, true)}${text({ x: 68, y: 339, value: "EMAIL ME", size: 19, weight: 760 })}${text({ x: 524, y: 343, value: "↗", size: 27, fill: colors.amber, weight: 700, anchor: "middle" })}`,
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
  ["project-model-logger.svg", projectAsset("modelLogger", false)],
  ["project-model-logger-mobile.svg", projectAsset("modelLogger", true)],
  ["project-carivyo.svg", projectAsset("carivyo", false)],
  ["project-carivyo-mobile.svg", projectAsset("carivyo", true)],
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
