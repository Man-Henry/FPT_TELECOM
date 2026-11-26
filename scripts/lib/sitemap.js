/**
 * ==============================================================================
 * SHARED SITEMAP GENERATOR (Single Module for All Page Generators)
 * Quét toàn bộ trang hợp lệ trên đĩa, tự động loại bỏ trang noindex, 404 và admin.
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");

function isIndexableHtml(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return !/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(
      content,
    );
  } catch (e) {
    return false;
  }
}

function getFileMtimeIso(filePath, fallbackIso) {
  try {
    return fs.statSync(filePath).mtime.toISOString().split("T")[0];
  } catch (e) {
    return fallbackIso;
  }
}

function rebuildSitemap(rootDir, baseUrl = "https://fpttelecomvn.click") {
  const todayIso = new Date().toISOString().split("T")[0];
  const sitemapPath = path.join(rootDir, "sitemap.xml");

  const corePages = [
    { rel: "", loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    {
      rel: "pages/bang-gia.html",
      loc: `${baseUrl}/pages/bang-gia.html`,
      priority: "0.9",
      changefreq: "weekly",
    },
    {
      rel: "pages/khu-vuc.html",
      loc: `${baseUrl}/pages/khu-vuc.html`,
      priority: "0.9",
      changefreq: "weekly",
    },
    {
      rel: "pages/news.html",
      loc: `${baseUrl}/pages/news.html`,
      priority: "0.9",
      changefreq: "daily",
    },
    {
      rel: "pages/ve-chung-toi.html",
      loc: `${baseUrl}/pages/ve-chung-toi.html`,
      priority: "0.9",
      changefreq: "monthly",
    },
    {
      rel: "pages/chinh-sach.html",
      loc: `${baseUrl}/pages/chinh-sach.html`,
      priority: "0.8",
      changefreq: "monthly",
    },
    {
      rel: "pages/lien-he.html",
      loc: `${baseUrl}/pages/lien-he.html`,
      priority: "0.9",
      changefreq: "monthly",
    },
  ].map((p) => ({
    ...p,
    lastmod: p.rel
      ? getFileMtimeIso(path.join(rootDir, p.rel), todayIso)
      : getFileMtimeIso(path.join(rootDir, "index.html"), todayIso),
  }));

  function scanDir(relDir, changefreq, priority) {
    const absDir = path.join(rootDir, relDir);
    if (!fs.existsSync(absDir)) return [];
    return fs
      .readdirSync(absDir)
      .filter((f) => f.endsWith(".html") && isIndexableHtml(path.join(absDir, f)))
      .sort()
      .map((f) => ({
        loc: `${baseUrl}/${relDir.replace(/\\/g, "/")}/${f}`,
        lastmod: getFileMtimeIso(path.join(absDir, f), todayIso),
        changefreq,
        priority,
      }));
  }

  const localEntries = scanDir("pages/khu-vuc", "weekly", "0.9");
  const topicEntries = scanDir("pages/topics", "weekly", "0.85");
  const postEntries = scanDir("pages/posts", "monthly", "0.8");

  const renderGroup = (title, items) =>
    `  <!-- ${title} -->\n` +
    items
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
      )
      .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    renderGroup("Core Static Pages", corePages) +
    `\n\n` +
    renderGroup(
      `Local SEO Regional Pages (${localEntries.length} regions)`,
      localEntries,
    ) +
    `\n\n` +
    renderGroup(
      `Niche Programmatic Landing Pages (${topicEntries.length} topics)`,
      topicEntries,
    ) +
    `\n\n` +
    renderGroup(
      `Dynamic News & Promotion Articles (${postEntries.length} indexable articles)`,
      postEntries,
    ) +
    `\n</urlset>\n`;

  fs.writeFileSync(sitemapPath, xml, "utf8");
  const total =
    corePages.length +
    localEntries.length +
    topicEntries.length +
    postEntries.length;
  console.log(`🗺️ Updated sitemap.xml cleanly with ${total} indexable URLs.`);
  return {
    total,
    core: corePages.length,
    local: localEntries.length,
    topics: topicEntries.length,
    posts: postEntries.length,
  };
}

module.exports = { rebuildSitemap, isIndexableHtml };
