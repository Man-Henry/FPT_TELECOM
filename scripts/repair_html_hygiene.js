/**
 * ==============================================================================
 * HTML HYGIENE & STRUCTURE REPAIR SCRIPT (Node.js)
 * 1) Sửa các trang bị lỗi <html lang="vi"><head></head><body>\ufeff...
 * 2) Chuẩn hóa mọi <script src=".../js/script.js"> sang script.min.js?v=VERSION
 * 3) Bổ sung script.min.js?v=VERSION cho các trang bị thiếu (404 & posts cũ)
 * 4) Đánh dấu noindex, follow + canonical + banner cho bài giá cũ Tháng 7/2026
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".venv", "tmp"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (
      entry.name.endsWith(".html") &&
      entry.name !== "google80fb096eb6b47793.html"
    ) {
      out.push(full);
    }
  }
  return out;
}

function getRelJsPath(absFile) {
  const relDir = path.relative(ROOT_DIR, path.dirname(absFile));
  if (!relDir || relDir === ".") return "js/script.min.js?v=VERSION";
  const depth = relDir.split(path.sep).length;
  return `${"../".repeat(depth)}js/script.min.js?v=VERSION`;
}

function repairBrokenHeadBody(rawHtml) {
  const prefix = '<html lang="vi"><head></head><body>';
  if (!rawHtml.startsWith(prefix)) return rawHtml;

  let inner = rawHtml.slice(prefix.length).replace(/^\uFEFF/, "");
  if (inner.endsWith("</body></html>")) {
    inner = inner.slice(0, -"</body></html>".length);
  }

  // Điểm ranh giới thực sự bắt đầu <body> là GTM <noscript> hoặc <div class="topbar">
  let splitIdx = inner.indexOf("<!-- Google Tag Manager (noscript) -->");
  if (splitIdx === -1) splitIdx = inner.indexOf("<noscript>");
  if (splitIdx === -1) splitIdx = inner.indexOf('<div class="topbar">');
  if (splitIdx === -1) return rawHtml;

  const headInner = inner.slice(0, splitIdx).trim();
  const bodyInner = inner.slice(splitIdx).trim();

  return (
    `<!doctype html>\n` +
    `<html lang="vi">\n` +
    `  <head>\n` +
    `    ${headInner}\n` +
    `  </head>\n` +
    `  <body>\n` +
    `    ${bodyInner}\n` +
    `  </body>\n` +
    `</html>\n`
  );
}

function main() {
  const htmlFiles = walkHtml(ROOT_DIR);
  let fixedHeadCount = 0;
  let fixedMinScriptCount = 0;
  let addedScriptCount = 0;
  let deprecatedUpdated = false;

  for (const file of htmlFiles) {
    const rel = path.relative(ROOT_DIR, file).replace(/\\/g, "/");
    let content = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const before = content;

    // 1. Sửa cấu trúc <head></head><body> bị hỏng do BOM
    if (content.startsWith('<html lang="vi"><head></head><body>')) {
      content = repairBrokenHeadBody(content);
      if (content !== before) fixedHeadCount++;
    }

    // 2. Xử lý bài giá cũ Tháng 7/2026: đánh dấu noindex + canonical + banner
    if (rel === "pages/posts/bang-gia-internet-fpt-thang-7-2026.html") {
      if (!content.includes("noindex")) {
        content = content.replace(
          /<meta\s+name=["']robots["'][^>]*>/i,
          '<meta name="robots" content="noindex, follow">',
        );
      }
      content = content.replace(
        /<link\s+rel=["']canonical["'][^>]*>/i,
        '<link rel="canonical" href="https://fpttelecomvn.click/pages/bang-gia.html">',
      );
      if (!content.includes("legacy-pricing-notice") && content.includes('<main')) {
        content = content.replace(
          /<article class="post-content">/i,
          `<article class="post-content">\n      <div id="legacy-pricing-notice" style="background:#fff7ed;border:1.5px solid #fdba74;border-left:5px solid #ea580c;border-radius:12px;padding:16px 20px;margin:0 0 24px;color:#9a3412;font-size:14.5px;line-height:1.6;"><strong>⚠️ Lưu ý cập nhật giá mới:</strong> Đây là bảng giá lưu trữ từ Tháng 7/2026. Quý khách vui lòng xem <a href="../bang-gia.html" style="color:#0056d6;font-weight:800;text-decoration:underline;">Bảng giá Internet FPT mới nhất Tháng 8/2026</a> hoặc gọi <a href="tel:0358513269" style="color:#ea580c;font-weight:800;">0358 513 269</a> để nhận khuyến mãi hiện hành.</div>`,
        );
      }
      deprecatedUpdated = true;
    }

    // 3. Chuẩn hóa script.js -> script.min.js?v=VERSION
    if (
      content.includes("js/script.js") &&
      !content.includes("script.min.js")
    ) {
      content = content.replace(
        /((?:\.\.\/)*)js\/script\.js(?:\?v=[A-Za-z0-9_-]+)?/g,
        "$1js/script.min.js?v=VERSION",
      );
      fixedMinScriptCount++;
    }

    // 4. Bổ sung script.min.js?v=VERSION cho file thiếu (trừ trang admin riêng)
    if (
      rel !== "pages/admin.html" &&
      !content.includes("script.min.js") &&
      !content.includes("script.js") &&
      content.includes("</body>")
    ) {
      const scriptHref =
        rel === "404.html" ? "/js/script.min.js?v=VERSION" : getRelJsPath(file);
      content = content.replace(
        /<\/body>/i,
        `    <script defer src="${scriptHref}"></script>\n  </body>`,
      );
      addedScriptCount++;
    }

    if (content !== before) {
      fs.writeFileSync(file, content, "utf8");
    }
  }

  console.log(
    `✅ HTML Hygiene Summary: fixedHead=${fixedHeadCount}, fixedMinJs=${fixedMinScriptCount}, addedJs=${addedScriptCount}, deprecatedMarked=${deprecatedUpdated}`,
  );
}

main();
