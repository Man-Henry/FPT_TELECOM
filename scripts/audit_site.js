/**
 * ==============================================================================
 * COMPREHENSIVE REPOSITORY & ARCHITECTURE AUDIT SCRIPT (Node.js)
 * Kiểm tra tự động toàn bộ tính đúng đắn qua cả 3 giai đoạn:
 *  - Single Source of Truth (Pricing Master -> fpt_pricing_2026 & niche_topics)
 *  - Cloudflare Worker Security & Mini-CRM Endpoints
 *  - HTML Hygiene, Turnstile, Script Minification & Admin Isolation
 *  - Sitemap Completeness & Local/Niche SEO Coverage
 *  - Package Finder Calculator DOM <-> JS <-> CSS Parity
 *  - Unused Images Check
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
let failures = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`✅ PASS: ${label}${detail ? ` (${detail})` : ""}`);
  } else {
    console.error(`❌ FAIL: ${label}${detail ? ` -> ${detail}` : ""}`);
    failures++;
  }
}

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".venv", "tmp"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, exts, out);
    else if (exts.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
  return out;
}

function main() {
  console.log("🔍 Running FPT Telecom Full Architecture & Logic Audit...\n");

  // 1. Single Source of Truth Pricing Integrity
  const master = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "data/pricing_master.json"), "utf8"),
  );
  const ragPricing = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "data/fpt_pricing_2026.json"), "utf8"),
  );
  const topics = JSON.parse(
    fs
      .readFileSync(path.join(ROOT_DIR, "data/niche_topics.json"), "utf8")
      .replace(/^\uFEFF/, ""),
  );
  const localAreas = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "data/local_areas.json"), "utf8"),
  );

  assert(
    ragPricing.length === master.packages.length,
    "Pricing Master <-> RAG JSON synced",
    `${ragPricing.length} packages`,
  );
  const ragIds = new Set(ragPricing.map((p) => p.id));
  const missingTopicIds = topics.flatMap((t) =>
    (t.pricing_ids || []).filter((id) => !ragIds.has(id)),
  );
  assert(
    missingTopicIds.length === 0,
    "All niche topic pricing_ids exist in fpt_pricing_2026.json",
    missingTopicIds.length ? missingTopicIds.join(", ") : "15 topics checked",
  );
  assert(
    localAreas.length >= 10,
    "Expanded Local SEO areas",
    `${localAreas.length} local landing pages`,
  );

  // 2. Worker Security & Logic Invariants
  const workerSrc = fs.readFileSync(
    path.join(ROOT_DIR, "src/index.js"),
    "utf8",
  );
  assert(
    !workerSrc.includes("fpttelecom2026_admin_secret"),
    "No hardcoded fallback admin secret in src/index.js",
  );
  assert(
    !workerSrc.includes("383900321"),
    "No stale phone 383900321 anywhere in src/index.js",
  );
  assert(
    !fs.existsSync(path.join(ROOT_DIR, "fpt_chatbot_worker.js")),
    "Duplicate legacy worker fpt_chatbot_worker.js removed",
  );
  assert(
    workerSrc.includes('p === "/api/leads" && request.method === "PATCH"') &&
      workerSrc.includes('p === "/api/sessions" && request.method === "GET"') &&
      workerSrc.includes('p === "/api/sessions/reply" && request.method === "POST"') &&
      workerSrc.includes("STREAM_SYSTEM_PROMPT") &&
      workerSrc.includes("2026-08-26"),
    "Mini-CRM endpoints, SSE text stream & stale-vector guard present in Worker",
  );
  assert(
    workerSrc.includes("CREATE TABLE IF NOT EXISTS audit_logs") &&
      workerSrc.indexOf("CREATE TABLE IF NOT EXISTS audit_logs") <
        workerSrc.indexOf('p === "/api/seed-knowledge"'),
    "audit_logs migration executed inside /api/_migrate",
  );

  // 3. Frontend Bundle, Calculator & Lead Pipeline
  const scriptJs = fs.readFileSync(path.join(ROOT_DIR, "js/script.js"), "utf8");
  const scriptMin = fs.readFileSync(
    path.join(ROOT_DIR, "js/script.min.js"),
    "utf8",
  );
  const cssMin = fs.readFileSync(
    path.join(ROOT_DIR, "css/styles.min.css"),
    "utf8",
  );
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, "index.html"), "utf8");

  assert(
    !scriptJs.includes("0x4AAAAAAAEi6j9Y-0rZc7eU") &&
      !scriptMin.includes("0x4AAAAAAAEi6j9Y-0rZc7eU") &&
      scriptMin.includes("cloudflare_worker") &&
      scriptMin.includes("gas_fallback") &&
      scriptMin.includes("calculator_estimate"),
    "js/script.min.js freshly built without invalid Turnstile placeholder, with Worker+GAS fallback email, and GTM calculator",
  );
  assert(
    cssMin.includes("finder-breakdown") && cssMin.includes("finder-pills-4"),
    "css/styles.min.css built with Calculator UI styles",
  );
  const calcIds = [
    "pf-region",
    "pf-modem-opt",
    "pf-box-opt",
    "pf-cloud-opt",
    "fb-total-cost",
    "fb-plan-cost",
    "fb-install-cost",
  ];
  const missingCalcIds = calcIds.filter(
    (id) => !indexHtml.includes(`id="${id}"`) || !scriptJs.includes(id),
  );
  assert(
    missingCalcIds.length === 0,
    "Cost Calculator DOM IDs wired in index.html & js/script.js",
    missingCalcIds.length ? missingCalcIds.join(", ") : `${calcIds.length} IDs`,
  );

  // 4. HTML Hygiene, Admin Isolation & Sitemap Integrity
  const htmlFiles = walk(ROOT_DIR, [".html"]).filter(
    (f) => path.basename(f) !== "google80fb096eb6b47793.html",
  );
  const brokenHeads = [];
  const unminScripts = [];
  const missingScripts = [];

  for (const f of htmlFiles) {
    const rel = path.relative(ROOT_DIR, f).replace(/\\/g, "/");
    const c = fs.readFileSync(f, "utf8");
    if (c.includes("<head></head><body>")) brokenHeads.push(rel);
    if (rel !== "pages/admin.html") {
      if (c.includes("script.js") && !c.includes("script.min.js"))
        unminScripts.push(rel);
      if (!c.includes("script.min.js") && !c.includes("script.js"))
        missingScripts.push(rel);
    }
  }
  assert(
    brokenHeads.length === 0,
    "Zero HTML files with broken <head></head><body>",
    `${htmlFiles.length} HTML files scanned`,
  );
  assert(
    unminScripts.length === 0 && missingScripts.length === 0,
    "All public HTML files reference script.min.js",
  );

  const adminHtml = fs.readFileSync(
    path.join(ROOT_DIR, "pages/admin.html"),
    "utf8",
  );
  const robotsTxt = fs.readFileSync(
    path.join(ROOT_DIR, "robots.txt"),
    "utf8",
  );
  assert(
    adminHtml.includes('content="noindex, nofollow"') &&
      robotsTxt.includes("Disallow: /pages/admin.html"),
    "Mini-CRM pages/admin.html blocked from search engines (noindex + robots.txt)",
  );

  const sitemapXml = fs.readFileSync(
    path.join(ROOT_DIR, "sitemap.xml"),
    "utf8",
  );
  const smLocs = [
    ...sitemapXml.matchAll(
      /<loc>(https:\/\/fpttelecomvn\.click\/([^<]*))<\/loc>/g,
    ),
  ].map((m) => m[2]);
  const brokenSmUrls = smLocs.filter(
    (rel) => rel !== "" && !fs.existsSync(path.join(ROOT_DIR, rel)),
  );
  const noindexInSm = smLocs.filter((rel) => {
    if (!rel) return false;
    const c = fs.readFileSync(path.join(ROOT_DIR, rel), "utf8");
    return /content=["'][^"']*noindex/i.test(c);
  });
  assert(
    brokenSmUrls.length === 0 &&
      noindexInSm.length === 0 &&
      !sitemapXml.includes("pages/admin.html"),
    "Sitemap URLs valid on disk and zero noindex/admin URLs leaked",
    `${smLocs.length} indexed URLs`,
  );

  // 5. Duplicate/Unused Assets Check
  const pkgDir = path.join(ROOT_DIR, "assets/images/packages");
  const pkgFiles = fs.readdirSync(pkgDir);
  const textCorpus = walk(ROOT_DIR, [
    ".html",
    ".js",
    ".css",
    ".json",
    ".xml",
    ".md",
  ])
    .map((f) => fs.readFileSync(f, "utf8"))
    .join("\n");
  const orphanImages = pkgFiles.filter(
    (pf) =>
      !textCorpus.includes(pf) && !textCorpus.includes(encodeURIComponent(pf)),
  );
  assert(
    orphanImages.length === 0,
    "Zero orphan images in assets/images/packages/",
    `${pkgFiles.length} clean images`,
  );
  assert(
    !fs.existsSync(path.join(ROOT_DIR, "google-apps-script.js")) &&
      fs.existsSync(path.join(ROOT_DIR, "google-apps-script/Code.gs")),
    "Single canonical Google Apps Script at google-apps-script/Code.gs",
  );
  assert(
    fs.existsSync(path.join(ROOT_DIR, "functions/api/[[path]].js")),
    "Cloudflare Pages Functions proxy present at functions/api/[[path]].js",
  );

  console.log(`\n📊 Audit finished with ${failures} failure(s).`);
  if (failures > 0) process.exit(1);
}

main();
