/**
 * ==============================================================================
 * SINGLE SOURCE OF TRUTH PRICING SYNCHRONIZER (Node.js)
 * Đọc data/pricing_master.json và đồng bộ đồng nhất sang:
 *  1) data/fpt_pricing_2026.json (cho Vectorize AI RAG + Niche SEO Pages)
 *  2) js/script.js (khối REGION_CATALOG cho #package-finder & Bộ dự toán)
 *  3) Kiểm tra tham chiếu pricing_ids trong data/niche_topics.json
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const MASTER_PATH = path.join(ROOT_DIR, "data", "pricing_master.json");
const PRICING_OUT_PATH = path.join(ROOT_DIR, "data", "fpt_pricing_2026.json");
const SCRIPT_JS_PATH = path.join(ROOT_DIR, "js", "script.js");
const TOPICS_JSON_PATH = path.join(ROOT_DIR, "data", "niche_topics.json");

function main() {
  const master = JSON.parse(
    fs.readFileSync(MASTER_PATH, "utf8").replace(/^\uFEFF/, ""),
  );

  // 1. Sync data/fpt_pricing_2026.json
  const packages = master.packages || [];
  fs.writeFileSync(
    PRICING_OUT_PATH,
    JSON.stringify(packages, null, 2) + "\n",
    "utf8",
  );
  console.log(
    `✅ Synced data/fpt_pricing_2026.json (${packages.length} packages, version ${master.version})`,
  );

  // 2. Sync REGION_CATALOG block in js/script.js if sync markers exist
  if (fs.existsSync(SCRIPT_JS_PATH)) {
    const scriptContent = fs.readFileSync(SCRIPT_JS_PATH, "utf8");
    const startMarker = "/* @sync-pricing:region-catalog:start */";
    const endMarker = "/* @sync-pricing:region-catalog:end */";

    if (
      scriptContent.includes(startMarker) &&
      scriptContent.includes(endMarker)
    ) {
      const startIdx = scriptContent.indexOf(startMarker);
      const endIdx = scriptContent.indexOf(endMarker) + endMarker.length;
      const serialized =
        `${startMarker}\n` +
        `    const PRICING_POLICIES = ${JSON.stringify(master.policies, null, 4)};\n` +
        `    const REGION_CATALOG = ${JSON.stringify(master.region_catalog, null, 6)};\n` +
        `    ${endMarker}`;
      const updated =
        scriptContent.slice(0, startIdx) +
        serialized +
        scriptContent.slice(endIdx);
      fs.writeFileSync(SCRIPT_JS_PATH, updated, "utf8");
      console.log(
        `✅ Synced PRICING_POLICIES & REGION_CATALOG into js/script.js (${Object.keys(master.region_catalog).length} regions)`,
      );
    } else {
      console.log(
        "ℹ️  js/script.js sync markers not yet inserted; skipped REGION_CATALOG injection.",
      );
    }
  }

  // 3. Validate all pricing_ids in niche_topics.json
  if (fs.existsSync(TOPICS_JSON_PATH)) {
    const topics = JSON.parse(
      fs.readFileSync(TOPICS_JSON_PATH, "utf8").replace(/^\uFEFF/, ""),
    );
    const pkgIds = new Set(packages.map((p) => p.id));
    const missing = [];
    for (const t of topics) {
      for (const pid of t.pricing_ids || []) {
        if (!pkgIds.has(pid)) missing.push({ topic: t.slug, id: pid });
      }
    }
    if (missing.length > 0) {
      console.error("❌ Missing pricing_ids in niche_topics.json:", missing);
      process.exitCode = 1;
    } else {
      console.log(
        `✅ Validated all pricing_ids across ${topics.length} niche topics (0 missing).`,
      );
    }
  }
}

main();
