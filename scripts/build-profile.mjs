import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const outputDirectory = path.join(repositoryRoot, "assets", "profile");

const palette = {
  background: "#0d1117",
  surface: "#121820",
  elevated: "#171f29",
  border: "#303a46",
  borderSoft: "#232c36",
  text: "#f2eee6",
  muted: "#a9b0b8",
  faint: "#69727d",
  amber: "#d7a15b",
  amberSoft: "#8f6b3f",
  sage: "#91aaa4",
};

const commonCss = `
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 100%; height: 100%; }
  .root {
    --bg: ${palette.background};
    --surface: ${palette.surface};
    --elevated: ${palette.elevated};
    --border: ${palette.border};
    --border-soft: ${palette.borderSoft};
    --text: ${palette.text};
    --muted: ${palette.muted};
    --faint: ${palette.faint};
    --amber: ${palette.amber};
    --amber-soft: ${palette.amberSoft};
    --sage: ${palette.sage};
    width: 100%;
    height: 100%;
    padding: 22px;
    color: var(--text);
    background:
      radial-gradient(circle at 12% 0%, rgba(215, 161, 91, .055), transparent 25%),
      radial-gradient(circle at 88% 100%, rgba(145, 170, 164, .045), transparent 28%),
      var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif;
    text-rendering: geometricPrecision;
  }
  .surface {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 26px;
    background: linear-gradient(145deg, #151c24 0%, #10161d 58%, #0f141b 100%);
    box-shadow:
      inset 1px 1px 0 rgba(255,255,255,.045),
      inset -1px -1px 0 rgba(0,0,0,.72),
      0 18px 38px rgba(0,0,0,.28);
  }
  .surface::before {
    content: "";
    position: absolute;
    inset: 10px;
    pointer-events: none;
    border: 1px solid rgba(255,255,255,.025);
    border-radius: 18px;
  }
  .surface::after {
    content: "";
    position: absolute;
    left: 34px;
    right: 34px;
    top: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.13), transparent);
  }
  .content { position: relative; z-index: 1; height: 100%; padding: 42px 48px; }
  .kicker {
    margin: 0 0 14px;
    color: var(--sage);
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .17em;
    text-transform: uppercase;
  }
  h1, h2, h3, p { margin-top: 0; }
  h1 { margin-bottom: 12px; font-size: 64px; line-height: 1.02; letter-spacing: -.045em; font-weight: 780; }
  h2 { margin-bottom: 12px; font-size: 38px; line-height: 1.12; letter-spacing: -.025em; font-weight: 760; }
  h3 { margin-bottom: 10px; font-size: 24px; line-height: 1.2; letter-spacing: -.015em; font-weight: 730; }
  p { color: var(--muted); font-size: 20px; line-height: 1.55; }
  strong { color: var(--text); }
  .accent { color: var(--amber); }
  .muted { color: var(--muted); }
  .mono { font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 9px; }
  .chip {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 6px 11px;
    border: 1px solid #2c3641;
    border-radius: 9px;
    color: #d9dee2;
    background: #1b232d;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 14px;
    font-weight: 650;
    line-height: 1;
  }
  .divider { height: 1px; background: var(--border-soft); }
  .eyebrow-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .index { color: var(--amber); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 15px; font-weight: 700; letter-spacing: .12em; }
  .status { display: inline-flex; align-items: center; gap: 9px; color: var(--muted); font-size: 14px; font-weight: 650; }
  .status-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--sage); box-shadow: 0 0 0 5px rgba(145,170,164,.08); }
  .is-mobile { padding: 14px; }
  .is-mobile .surface { border-radius: 22px; }
  .is-mobile .content { padding: 30px 28px; }
  .is-mobile .kicker { font-size: 13px; margin-bottom: 11px; }
  .is-mobile h1 { font-size: 48px; }
  .is-mobile h2 { font-size: 31px; }
  .is-mobile h3 { font-size: 23px; }
  .is-mobile p { font-size: 18px; line-height: 1.5; }
  .is-mobile .chip { min-height: 28px; padding: 6px 9px; font-size: 13px; }
`;

function svgDocument({ width, height, title, description, html, css = "", mobile = false }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${title}</title>
  <desc id="description">${description}</desc>
  <rect width="${width}" height="${height}" fill="${palette.background}"/>
  <foreignObject x="0" y="0" width="${width}" height="${height}">
    <div xmlns="http://www.w3.org/1999/xhtml" class="root${mobile ? " is-mobile" : ""}">
      <style>${commonCss}${css}</style>
      ${html}
    </div>
  </foreignObject>
</svg>`;
}

const heroCss = `
  .hero .content { display: flex; flex-direction: column; justify-content: space-between; }
  .brand-line { display: flex; justify-content: space-between; align-items: center; }
  .monogram { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid #3a4551; border-radius: 12px; color: var(--amber); background: #171e27; font-size: 14px; font-weight: 800; letter-spacing: .08em; }
  .hero-grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .75fr); align-items: center; gap: 48px; }
  .role { margin: 0 0 14px; color: var(--amber); font-size: 27px; font-weight: 700; letter-spacing: -.01em; }
  .lede { max-width: 700px; margin: 0; }
  .current-card { padding: 24px; border: 1px solid #313c48; border-radius: 18px; background: linear-gradient(145deg, #19222c, #121920); box-shadow: inset 1px 1px 0 rgba(255,255,255,.035), 10px 12px 26px rgba(0,0,0,.22); }
  .current-label { margin-bottom: 10px; color: var(--sage); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 13px; font-weight: 750; letter-spacing: .13em; }
  .current-card h3 { margin-bottom: 6px; }
  .current-card p { margin-bottom: 0; font-size: 16px; }
  .hero-rail { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border-soft); }
  .hero-rail span { padding-top: 18px; color: var(--muted); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 13px; font-weight: 650; letter-spacing: .08em; text-align: center; }
  .hero-rail span + span { border-left: 1px solid var(--border-soft); }
  .is-mobile .hero-grid { grid-template-columns: 1fr; gap: 26px; }
  .is-mobile .brand-line { margin-bottom: 28px; }
  .is-mobile .role { font-size: 24px; }
  .is-mobile .lede { font-size: 18px; }
  .is-mobile .current-card { padding: 20px; }
  .is-mobile .hero-rail { margin-top: 24px; grid-template-columns: 1fr; }
  .is-mobile .hero-rail span { padding: 10px 0; text-align: left; }
  .is-mobile .hero-rail span + span { border-left: 0; border-top: 1px solid var(--border-soft); }
`;

function hero(mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 830 : 520;
  return svgDocument({
    width,
    height,
    mobile,
    title: "Manohar Eldhandi — AI and Backend Engineer",
    description: "Software Engineer at Cisco in Bengaluru focused on applied AI, backend systems, and product engineering.",
    css: heroCss,
    html: `<section class="surface hero">
      <div class="content">
        <div class="brand-line">
          <div class="monogram">ME</div>
          <div class="status"><span class="status-dot"></span><span>BENGALURU / IST</span></div>
        </div>
        <div class="hero-grid">
          <div>
            <p class="kicker">Applied AI &amp; Backend Systems</p>
            <h1>Manohar<br class="desktop-break"/>Eldhandi</h1>
            <p class="role">AI &amp; Backend Engineer</p>
            <p class="lede">I build dependable backend platforms and applied-AI products with Java and Python—designed for real users, observable decisions, and production reliability.</p>
          </div>
          <aside class="current-card">
            <div class="current-label">CURRENT ROLE</div>
            <h3>Software Engineer at Cisco</h3>
            <p>Applying agentic AI and backend engineering to security-compliance workflows used across product teams.</p>
          </aside>
        </div>
        <div class="hero-rail">
          <span>BACKEND ENGINEERING</span>
          <span>APPLIED AI</span>
          <span>PRODUCT SYSTEMS</span>
        </div>
      </div>
    </section>`,
  });
}

const navCss = `
  .root { padding: 8px; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-radius: 18px; }
  .nav-copy { display: flex; align-items: baseline; gap: 12px; }
  .nav-index { color: var(--sage); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 12px; font-weight: 700; }
  .nav-label { color: var(--text); font-size: 20px; font-weight: 750; letter-spacing: -.01em; }
  .nav-arrow { color: var(--amber); font-size: 24px; font-weight: 700; }
  .is-mobile { padding: 5px; }
  .is-mobile .nav { padding: 0 13px; border-radius: 14px; }
  .is-mobile .nav-copy { gap: 6px; }
  .is-mobile .nav-index { display: none; }
  .is-mobile .nav-label { font-size: 22px; }
  .is-mobile .nav-arrow { font-size: 22px; }
`;

function navButton(index, label, mobile = false) {
  const width = mobile ? 600 : 1200;
  const height = mobile ? 70 : 88;
  return svgDocument({
    width,
    height,
    mobile,
    title: label,
    description: `Open ${label}`,
    css: navCss,
    html: `<div class="surface nav"><div class="nav-copy"><span class="nav-index">${index}</span><span class="nav-label">${label}</span></div><span class="nav-arrow">&#8599;</span></div>`,
  });
}

const profileCss = `
  .profile .content { display: grid; grid-template-rows: auto 1fr auto; }
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
  .profile-card { padding: 25px 27px; border: 1px solid var(--border-soft); border-radius: 18px; background: rgba(20,28,36,.72); }
  .profile-card p { margin-bottom: 0; font-size: 18px; }
  .discipline-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; }
  .discipline { padding: 14px 16px; border: 1px solid #29333e; border-radius: 13px; color: var(--muted); background: #141b23; text-align: center; font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 13px; font-weight: 700; letter-spacing: .07em; }
  .is-mobile .profile-grid { grid-template-columns: 1fr; gap: 14px; }
  .is-mobile .profile-card { padding: 21px; }
  .is-mobile .discipline-row { grid-template-columns: 1fr; gap: 8px; margin-top: 16px; }
  .is-mobile .discipline { text-align: left; }
`;

function profile(mobile = false) {
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 720 : 440,
    mobile,
    title: "Engineering profile",
    description: "Manohar builds backend systems and applied-AI products, currently applying those skills to security and compliance at Cisco.",
    css: profileCss,
    html: `<section class="surface profile"><div class="content">
      <div><p class="kicker">Profile</p><h2>Backend foundations. Applied-AI systems. Product outcomes.</h2></div>
      <div class="profile-grid">
        <article class="profile-card"><h3>What I build</h3><p>Reliable APIs, deterministic-first LLM pipelines, agent tooling, event-driven services, and full-stack workflows that hold up beyond the demo.</p></article>
        <article class="profile-card"><h3>Current focus</h3><p>At Cisco, I apply AI and backend engineering to security-compliance automation used across product teams.</p></article>
      </div>
      <div class="discipline-row"><div class="discipline">BACKEND ENGINEERING</div><div class="discipline">APPLIED AI</div><div class="discipline">PRODUCT OWNERSHIP</div></div>
    </div></section>`,
  });
}

const impactCss = `
  .impact .content { display: grid; grid-template-rows: auto 1fr; }
  .impact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .metric { display: flex; flex-direction: column; justify-content: space-between; min-height: 185px; padding: 23px 25px; border: 1px solid var(--border-soft); border-radius: 18px; background: linear-gradient(145deg, #171f28, #121920); }
  .metric-value { margin-bottom: 10px; color: var(--text); font-size: 36px; line-height: 1; font-weight: 780; letter-spacing: -.035em; }
  .metric p { margin: 0; font-size: 16px; line-height: 1.45; }
  .metric-label { margin-top: 18px; color: var(--sage); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 12px; font-weight: 700; letter-spacing: .1em; }
  .is-mobile .impact-grid { grid-template-columns: 1fr; }
  .is-mobile .metric { min-height: 155px; padding: 20px 21px; }
  .is-mobile .metric-value { font-size: 33px; }
`;

function impact(mobile = false) {
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 1030 : 610,
    mobile,
    title: "Selected impact at Cisco",
    description: "Platform adoption, reduced review effort, fewer model calls, and strong automated test coverage.",
    css: impactCss,
    html: `<section class="surface impact"><div class="content">
      <div><p class="kicker">Selected Impact</p><h2>Systems measured by what they change.</h2></div>
      <div class="impact-grid">
        <article class="metric"><div><div class="metric-value">50+ engineers</div><p>Adopted across four Cisco product teams.</p></div><div class="metric-label">PLATFORM ADOPTION</div></article>
        <article class="metric"><div><div class="metric-value">70% less review</div><p>Traceable findings and remediations accelerated manual security review.</p></div><div class="metric-label">WORKFLOW AUTOMATION</div></article>
        <article class="metric"><div><div class="metric-value">10&#215; fewer calls</div><p>An 11-phase pipeline and 100-worker inference engine reduced LLM usage.</p></div><div class="metric-label">AI ORCHESTRATION</div></article>
        <article class="metric"><div><div class="metric-value">736 tests / 96%</div><p>Backend and Playwright coverage reduced manual QA effort by 60%.</p></div><div class="metric-label">RELEASE CONFIDENCE</div></article>
      </div>
    </div></section>`,
  });
}

const projectCss = `
  .project .content { display: grid; grid-template-rows: auto 1fr; }
  .project-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(280px, .7fr); gap: 34px; align-items: center; }
  .project h2 { margin-bottom: 12px; font-size: 40px; }
  .project-description { max-width: 730px; margin-bottom: 20px; font-size: 18px; }
  .project-meta { margin-top: 18px; color: var(--muted); font-size: 14px; font-weight: 650; }
  .project-visual { display: flex; flex-direction: column; justify-content: center; min-height: 205px; padding: 22px; border: 1px solid #2e3945; border-radius: 18px; background: #111820; box-shadow: inset 1px 1px 0 rgba(255,255,255,.03); }
  .visual-label { margin-bottom: 18px; color: var(--sage); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 12px; font-weight: 700; letter-spacing: .1em; }
  .flow { display: flex; align-items: center; gap: 8px; }
  .flow-node { flex: 1; padding: 12px 8px; border: 1px solid #33404c; border-radius: 10px; color: var(--text); background: #18212b; text-align: center; font-size: 12px; font-weight: 700; }
  .flow-arrow { color: var(--amber); font-size: 18px; }
  .visual-number { color: var(--amber); font-size: 36px; font-weight: 780; letter-spacing: -.03em; }
  .visual-copy { margin: 5px 0 0; font-size: 14px; }
  .is-mobile .project-grid { grid-template-columns: 1fr; gap: 20px; }
  .is-mobile .project h2 { font-size: 35px; }
  .is-mobile .project-description { font-size: 17px; }
  .is-mobile .project-visual { min-height: 145px; padding: 18px; }
`;

const projectData = {
  ontheway: {
    index: "01 / EVENT-DRIVEN PLATFORM",
    title: "OnTheWay",
    description: "Route-aware pickup that synchronizes preparation with a customer's live ETA across customer, merchant, and admin workflows.",
    chips: ["Java 17", "Spring Boot", "Kafka", "Elasticsearch", "React", "Kubernetes"],
    meta: "115 shops  /  507 items  /  70+ tests  /  1,000-user load test",
    visual: `<div class="visual-label">ETA-SYNCHRONIZED FLOW</div><div class="flow"><div class="flow-node">ROUTE</div><div class="flow-arrow">&#8594;</div><div class="flow-node">PREP</div><div class="flow-arrow">&#8594;</div><div class="flow-node">PICKUP</div></div>`,
  },
  carivyo: {
    index: "02 / LOCAL-FIRST AI",
    title: "Carivyo",
    description: "Career intelligence with official ATS connectors, evidence-grounded AI, explicit approval gates, and a transparent 27-check resume diagnostic.",
    chips: ["React", "TypeScript", "FastAPI", "Python", "SQLite", "LLM APIs"],
    meta: "4 ATS connectors  /  local-model support  /  explicit trust boundaries",
    visual: `<div class="visual-label">EVIDENCE-GROUNDED FLOW</div><div class="flow"><div class="flow-node">SOURCE</div><div class="flow-arrow">&#8594;</div><div class="flow-node">EVIDENCE</div><div class="flow-arrow">&#8594;</div><div class="flow-node">REVIEW</div></div>`,
  },
  waternet: {
    index: "03 / APPLIED MACHINE LEARNING",
    title: "WaterNet",
    description: "Reproducible water-quality classification with a cached ensemble, traceable predictions, batch inference, and a hardened Django API.",
    chips: ["Python", "Django", "scikit-learn", "XGBoost"],
    meta: "95%+ accuracy  /  0.96 AUC  /  sub-50 ms inference",
    visual: `<div class="visual-label">MODEL READOUT</div><div class="visual-number">0.96 AUC</div><p class="visual-copy">Voting ensemble over nine water-chemistry features.</p>`,
  },
};

function project(key, mobile = false) {
  const project = projectData[key];
  const chips = project.chips.map((chip) => `<span class="chip">${chip}</span>`).join("");
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 620 : 390,
    mobile,
    title: `${project.title} project`,
    description: `${project.title}: ${project.description}`,
    css: projectCss,
    html: `<section class="surface project"><div class="content">
      <div class="eyebrow-row"><span class="index">${project.index}</span><span class="status"><span class="status-dot"></span>SELECTED WORK</span></div>
      <div class="project-grid"><div><h2>${project.title} <span class="accent">&#8599;</span></h2><p class="project-description">${project.description}</p><div class="chip-row">${chips}</div><div class="project-meta mono">${project.meta}</div></div><aside class="project-visual">${project.visual}</aside></div>
    </div></section>`,
  });
}

const toolkitCss = `
  .toolkit .content { display: grid; grid-template-rows: auto 1fr; }
  .tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 13px; }
  .tool-card { padding: 20px; border: 1px solid var(--border-soft); border-radius: 16px; background: #141b23; }
  .tool-card h3 { margin-bottom: 15px; font-size: 20px; }
  .tool-card .chip-row { gap: 7px; }
  .tool-card .chip { padding: 5px 8px; font-size: 12px; }
  .is-mobile .tool-grid { grid-template-columns: 1fr; gap: 10px; }
  .is-mobile .tool-card { padding: 18px; }
`;

const toolGroups = [
  ["Backend", ["Java", "Python", "Spring Boot", "FastAPI", "REST", "GraphQL"]],
  ["Applied AI", ["MCP", "RAG", "LLM APIs", "Prompting", "LLM-as-judge"]],
  ["Data + Events", ["Kafka", "Elasticsearch", "MySQL", "SQLite", "WebSockets"]],
  ["Product", ["React", "TypeScript", "JavaScript", "HTML", "CSS"]],
  ["Quality", ["JUnit 5", "pytest", "Playwright", "API Testing"]],
  ["Delivery", ["Docker", "Kubernetes", "GitHub Actions", "Git"]],
];

function toolkit(mobile = false) {
  const cards = toolGroups.map(([title, tools]) => `<article class="tool-card"><h3>${title}</h3><div class="chip-row">${tools.map((tool) => `<span class="chip">${tool}</span>`).join("")}</div></article>`).join("");
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 900 : 610,
    mobile,
    title: "Engineering toolkit",
    description: "Backend, applied AI, data, product engineering, quality, and delivery technologies.",
    css: toolkitCss,
    html: `<section class="surface toolkit"><div class="content"><div><p class="kicker">Engineering Toolkit</p><h2>A practical stack for shipping complete systems.</h2></div><div class="tool-grid">${cards}</div></div></section>`,
  });
}

const notesCss = `
  .notes .content { display: grid; grid-template-rows: auto 1fr; }
  .notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
  .note { position: relative; padding: 21px 22px 21px 54px; border: 1px solid var(--border-soft); border-radius: 16px; background: #141b23; }
  .note-number { position: absolute; left: 20px; top: 23px; color: var(--amber); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 13px; font-weight: 750; }
  .note h3 { margin-bottom: 7px; font-size: 20px; }
  .note p { margin-bottom: 0; font-size: 15px; line-height: 1.45; }
  .is-mobile .notes-grid { grid-template-columns: 1fr; gap: 10px; }
  .is-mobile .note { padding: 19px 19px 19px 52px; }
`;

const principles = [
  ["01", "Start deterministic", "Use explicit rules for what can be known before asking a model to reason."],
  ["02", "Keep boundaries clear", "Treat remote content as untrusted input and keep permissions intentional."],
  ["03", "Make decisions observable", "Prefer evidence, audit trails, and failure states engineers can inspect."],
  ["04", "Test the real workflow", "Validate complete user and system paths—not only isolated happy paths."],
];

function notes(mobile = false) {
  const cards = principles.map(([number, title, copy]) => `<article class="note"><span class="note-number">${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("");
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 820 : 500,
    mobile,
    title: "How Manohar builds software",
    description: "Four engineering principles: start deterministic, protect boundaries, make decisions observable, and test complete workflows.",
    css: notesCss,
    html: `<section class="surface notes"><div class="content"><div><p class="kicker">How I Build</p><h2>Principles that survive contact with production.</h2></div><div class="notes-grid">${cards}</div></div></section>`,
  });
}

const proofHeaderCss = `
  .proof-head .content { display: flex; align-items: center; justify-content: space-between; gap: 40px; }
  .proof-head h2 { margin-bottom: 0; }
  .proof-side { max-width: 420px; margin: 0; text-align: right; font-size: 16px; }
  .is-mobile .proof-head .content { align-items: flex-start; flex-direction: column; justify-content: center; gap: 10px; }
  .is-mobile .proof-side { text-align: left; }
`;

function proofHeader(mobile = false) {
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 250 : 190,
    mobile,
    title: "Signals beyond the stack",
    description: "Competitive programming, national selection, engineering competition, and open-source education.",
    css: proofHeaderCss,
    html: `<section class="surface proof-head"><div class="content"><div><p class="kicker">Beyond the Stack</p><h2>Proof through practice.</h2></div><p class="proof-side">Competitive problem solving, national programs, engineering competitions, and work that helps others learn.</p></div></section>`,
  });
}

const proofCardCss = `
  .root { padding: 8px; }
  .proof-card .content { display: flex; flex-direction: column; justify-content: space-between; padding: 28px 30px; }
  .proof-type { color: var(--sage); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 11px; font-weight: 750; letter-spacing: .12em; }
  .proof-value { margin: 10px 0 7px; color: var(--text); font-size: 34px; font-weight: 780; letter-spacing: -.035em; }
  .proof-copy { margin: 0; font-size: 15px; line-height: 1.42; }
  .proof-link { color: var(--amber); font-size: 20px; font-weight: 750; }
  .is-mobile { padding: 5px; }
  .is-mobile .proof-card .content { padding: 20px; }
  .is-mobile .proof-type { font-size: 12px; }
  .is-mobile .proof-value { font-size: 32px; }
  .is-mobile .proof-copy { font-size: 18px; }
  .is-mobile .proof-link { font-size: 20px; }
`;

const proofData = {
  codeforces: ["COMPETITIVE PROGRAMMING", "Master / 2141", "CodeChef 4-star / 1893", "VIEW PROFILE &#8599;"],
  amazon: ["NATIONAL SELECTION", "Top 1%", "Amazon ML Summer School / 50,000+ applicants", "2024"],
  cisco: ["ENGINEERING COMPETITION", "Top 35", "Cisco Webex Playtime / 2,000+ teams", "AI COMPLIANCE TOOL"],
  lerdsa: ["OPEN-SOURCE EDUCATION", "500+ learners", "30-day Java DSA roadmap / 20 modules", "OPEN REPOSITORY &#8599;"],
};

function proofCard(key, mobile = false) {
  const [type, value, copy, link] = proofData[key];
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 280 : 220,
    mobile,
    title: `${value} — ${type}`,
    description: copy,
    css: proofCardCss,
    html: `<article class="surface proof-card"><div class="content"><div><div class="proof-type">${type}</div><div class="proof-value">${value}</div><p class="proof-copy">${copy}</p></div><div class="proof-link">${link}</div></div></article>`,
  });
}

const contributionCss = `
  .contribution .content { display: flex; align-items: center; justify-content: space-between; gap: 36px; }
  .contribution h2 { margin-bottom: 0; }
  .legend { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 14px; }
  .legend-dots { display: flex; gap: 7px; }
  .legend-dot { width: 13px; height: 13px; border-radius: 4px; border: 1px solid rgba(255,255,255,.08); }
  .legend-dot:nth-child(1) { background: #5f3745; }
  .legend-dot:nth-child(2) { background: #8c4f4f; }
  .legend-dot:nth-child(3) { background: #c17649; }
  .legend-dot:nth-child(4) { background: #e6b85c; }
  .is-mobile .contribution .content { align-items: flex-start; flex-direction: column; justify-content: center; gap: 20px; }
`;

function contributionHeader(mobile = false) {
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 300 : 210,
    mobile,
    title: "Contribution activity",
    description: "The contribution snake changes color as it eats differently weighted contribution cells.",
    css: contributionCss,
    html: `<section class="surface contribution"><div class="content"><div><p class="kicker">Contributions</p><h2>Consistency leaves a trail.</h2></div><div class="legend"><span>ACTIVITY</span><div class="legend-dots"><i class="legend-dot"></i><i class="legend-dot"></i><i class="legend-dot"></i><i class="legend-dot"></i></div></div></div></section>`,
  });
}

const footerCss = `
  .footer .content { display: flex; align-items: center; justify-content: space-between; gap: 40px; }
  .footer h2 { max-width: 650px; margin-bottom: 0; font-size: 43px; }
  .footer-action { display: flex; align-items: center; gap: 18px; padding: 18px 22px; border: 1px solid #3b4652; border-radius: 15px; color: var(--text); background: #171f29; box-shadow: inset 1px 1px 0 rgba(255,255,255,.04); font-size: 18px; font-weight: 750; }
  .footer-action span:last-child { color: var(--amber); font-size: 25px; }
  .footer-meta { margin: 16px 0 0; color: var(--muted); font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; font-size: 13px; }
  .is-mobile .footer .content { align-items: flex-start; flex-direction: column; justify-content: center; }
  .is-mobile .footer h2 { font-size: 36px; }
  .is-mobile .footer-action { width: 100%; justify-content: space-between; }
`;

function footer(mobile = false) {
  return svgDocument({
    width: mobile ? 600 : 1200,
    height: mobile ? 450 : 300,
    mobile,
    title: "Contact Manohar Eldhandi",
    description: "Start a conversation about backend platforms, applied AI, developer tooling, or product engineering.",
    css: footerCss,
    html: `<footer class="surface footer"><div class="content"><div><p class="kicker">Contact</p><h2>Let&apos;s build something useful.</h2><p class="footer-meta">BACKEND / APPLIED AI / DEVTOOLS / PRODUCT</p></div><div class="footer-action"><span>EMAIL MANOHAR</span><span>&#8599;</span></div></div></footer>`,
  });
}

await mkdir(outputDirectory, { recursive: true });

const assets = new Map([
  ["hero.svg", hero(false)],
  ["hero-mobile.svg", hero(true)],
  ["profile.svg", profile(false)],
  ["profile-mobile.svg", profile(true)],
  ["impact.svg", impact(false)],
  ["impact-mobile.svg", impact(true)],
  ["project-ontheway.svg", project("ontheway", false)],
  ["project-ontheway-mobile.svg", project("ontheway", true)],
  ["project-carivyo.svg", project("carivyo", false)],
  ["project-carivyo-mobile.svg", project("carivyo", true)],
  ["project-waternet.svg", project("waternet", false)],
  ["project-waternet-mobile.svg", project("waternet", true)],
  ["toolkit.svg", toolkit(false)],
  ["toolkit-mobile.svg", toolkit(true)],
  ["notes.svg", notes(false)],
  ["notes-mobile.svg", notes(true)],
  ["proof-header.svg", proofHeader(false)],
  ["proof-header-mobile.svg", proofHeader(true)],
  ["contributions.svg", contributionHeader(false)],
  ["contributions-mobile.svg", contributionHeader(true)],
  ["footer.svg", footer(false)],
  ["footer-mobile.svg", footer(true)],
]);

for (const [index, label] of [["01", "PORTFOLIO"], ["02", "RESUME"], ["03", "LINKEDIN"], ["04", "EMAIL"]]) {
  const name = label.toLowerCase();
  assets.set(`nav-${name}.svg`, navButton(index, label, false));
  assets.set(`nav-${name}-mobile.svg`, navButton(index, label, true));
}

for (const key of Object.keys(proofData)) {
  assets.set(`proof-${key}.svg`, proofCard(key, false));
  assets.set(`proof-${key}-mobile.svg`, proofCard(key, true));
}

for (const [filename, svg] of assets) {
  await writeFile(path.join(outputDirectory, filename), `${svg}\n`, "utf8");
}

console.log(`Generated ${assets.size} profile assets in ${outputDirectory}`);
