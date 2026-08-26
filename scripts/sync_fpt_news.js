/**
 * ==============================================================================
 * AUTO-SYNC FPT NEWS SCRIPT (Node.js)
 * Tự động thu thập bài viết mới từ https://fpt.vn/tin-tuc và đồng bộ vào website
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");
const dns = require("dns");
const cheerio = require("cheerio");

// Force IPv4 resolution to prevent ETIMEDOUT on GitHub Actions / Ubuntu runners
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

const BASE_URL = "https://fpt.vn";
const NEWS_URL = "https://fpt.vn/tin-tuc";
const REPO_ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(REPO_ROOT, "pages", "posts");
const NEWS_HTML_PATH = path.join(REPO_ROOT, "pages", "news.html");
const INDEX_HTML_PATH = path.join(REPO_ROOT, "index.html");
const SITEMAP_PATH = path.join(REPO_ROOT, "sitemap.xml");
const INDEX_TRACKER_PATH = path.join(REPO_ROOT, "data", "synced_news.json");

// Ensure data dir exists
const dataDir = path.dirname(INDEX_TRACKER_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load synced list
let syncedArticles = [];
if (fs.existsSync(INDEX_TRACKER_PATH)) {
  try {
    syncedArticles = JSON.parse(fs.readFileSync(INDEX_TRACKER_PATH, "utf8"));
  } catch (e) {
    syncedArticles = [];
  }
}

// Convert Vietnamese string to clean slug
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Format Date DD/MM/YYYY
function getTodayString() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

async function fetchHtml(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries) {
        throw err;
      }
      console.log(`⚠️ Retry ${i + 1}/${retries} for ${url} due to: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// Generate single article HTML
function generateArticleHtml(article) {
  const cleanTitle = article.title.replace(/"/g, "&quot;");
  const cleanDesc = article.description.replace(/"/g, "&quot;");
  const postUrl = `https://fpttelecomvn.click/pages/posts/${article.slug}.html`;

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/main/fptlogo.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/main/fptlogo.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/assets/images/main/fptlogo.png" />

    <title>${cleanTitle} | FPT Telecom</title>
    <meta name="description" content="${cleanDesc}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large" />
    <meta name="author" content="FPT Telecom - Đại lý ủy quyền" />

    <link rel="canonical" href="${postUrl}" />
    <link rel="alternate" hreflang="vi-VN" href="${postUrl}" />

    <meta property="og:site_name" content="FPT Telecom - Đại lý ủy quyền" />
    <meta property="og:title" content="${cleanTitle}" />
    <meta property="og:description" content="${cleanDesc}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="vi_VN" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:image" content="${article.image || "https://fpttelecomvn.click/assets/images/main/avata.webp"}" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="../../css/styles.min.css?v=VERSION" />

    <style>
      body, h1, h2, h3, h4, h5, h6, p, a, span, button, input {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
      body {
        background-color: #f8fafc;
        margin: 0;
        color: #1e293b;
        line-height: 1.7;
      }
      .post-container {
        max-width: 860px;
        margin: 40px auto;
        padding: 0 20px;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
      }
      .post-header {
        padding: 35px 25px 20px;
        border-bottom: 1px solid #f1f5f9;
      }
      .post-header h1 {
        font-size: 28px;
        font-weight: 800;
        color: #0f172a;
        margin: 12px 0;
        line-height: 1.35;
      }
      .post-meta {
        font-size: 13.5px;
        color: #64748b;
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .post-content {
        padding: 30px 25px 40px;
        font-size: 16px;
        color: #334155;
      }
      .post-content img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin: 20px 0;
        display: block;
      }
      .post-content h2 {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        margin: 30px 0 14px;
      }
      .post-content h3 {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin: 24px 0 10px;
      }
      .post-content p {
        margin: 0 0 16px;
      }
      .post-cta {
        margin-top: 40px;
        background: #e8f4fd;
        border: 1px solid #b8daff;
        padding: 25px;
        border-radius: 12px;
      }
      .post-cta h3 {
        margin-top: 0;
        color: #0056d6;
        font-size: 20px;
      }
      .post-cta ul {
        padding-left: 20px;
        margin: 14px 0;
      }
      .post-cta li {
        margin-bottom: 8px;
      }
      .btn-cta-box {
        display: inline-block;
        background: linear-gradient(135deg, #f97316, #ea580c);
        color: #ffffff !important;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 700;
        margin-top: 10px;
      }
    </style>

    <!-- Schema Article -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${cleanTitle}",
      "description": "${cleanDesc}",
      "image": ["${article.image || "https://fpttelecomvn.click/assets/images/main/avata.webp"}"],
      "datePublished": "${article.dateIso || new Date().toISOString()}",
      "author": {
        "@type": "Organization",
        "name": "FPT Telecom"
      },
      "publisher": {
        "@type": "Organization",
        "name": "FPT Telecom - Đại lý ủy quyền",
        "logo": {
          "@type": "ImageObject",
          "url": "https://fpttelecomvn.click/assets/images/main/fptlogo.png"
        }
      }
    }
    </script>
  </head>
  <body>
    <div class="topbar">
      <span class="topbar-promo"><span class="pulse-dot"></span><span class="topbar-text-desktop">⚡ Ưu đãi tháng này: miễn phí lắp đặt &amp; tặng thiết bị WiFi 6</span><span class="topbar-text-mobile">⚡ Free lắp đặt &amp; tặng WiFi 6</span></span>
      <a href="tel:0383900321" class="topbar-hotline">Hotline: <b>0383 900 321</b></a>
    </div>

    <header class="header sticky-header" id="home">
      <a class="logo logo-image" href="../../index.html" aria-label="FPT Telecom">
        <img src="../../assets/images/main/logo.webp" alt="FPT Telecom" width="164" height="45" />
        <span class="auth-badge">Đại lý ủy quyền FPT</span>
      </a>
      <button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">
        <span aria-hidden="true">☰</span>
        <span style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;">Menu</span>
      </button>
      <nav role="navigation" aria-label="Menu chính">
        <a href="../../index.html">Trang chủ</a>
        <a href="../bang-gia.html">Bảng giá</a>
        <a href="../khu-vuc.html">Khu vực</a>
        <a href="../news.html">Tin tức</a>
        <a href="../chinh-sach.html">Chính sách</a>
        <a href="../lien-he.html">Liên hệ</a>
      </nav>
      <a class="btn btn-orange header-cta" href="../lien-he.html">Đăng ký ngay <span>→</span></a>
    </header>

    <main>
      <article class="post-container">
        <div class="post-header">
          <div class="post-meta">
            <span>📅 ${article.dateStr || getTodayString()}</span>
            <span>✍️ Nguồn: FPT Telecom</span>
          </div>
          <h1>${article.title}</h1>
        </div>

        <div class="post-content">
          ${article.contentHtml}

          <div class="post-cta">
            <h3>⚡ Đăng Ký Lắp Mạng & Dịch Vụ FPT Nhận Ngay Ưu Đãi</h3>
            <p>Khách hàng đăng ký trực tuyến hôm nay sẽ nhận được trọn bộ ưu đãi:</p>
            <ul>
              <li>🚀 <strong>Tặng Modem Wi-Fi 6</strong> thế hệ mới siêu tốc</li>
              <li>📺 <strong>Tặng Đầu thu Box TV 4K</strong> xem trọn vẹn Ngoại hạng Anh</li>
              <li>🎁 <strong>Miễn phí 100%</strong> công lắp đặt tận nơi</li>
              <li>📞 <strong>Hỗ trợ kỹ thuật 24/7</strong> nhanh chóng</li>
            </ul>
            <a href="../lien-he.html" class="btn-cta-box">👉 Đăng ký tư vấn ngay</a>
            <p style="font-weight: bold; margin-top: 14px;">
              Hoặc gọi Hotline tư vấn miễn phí: <a href="tel:0383900321" style="color: #ea580c; text-decoration: none;">0383 900 321</a>
            </p>
          </div>
        </div>
      </article>
    </main>

    <footer>
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="footer-logo" href="../../index.html">
              <img src="../../assets/images/main/logo.webp" alt="FPT Telecom" width="164" height="45" loading="lazy" decoding="async" />
            </a>
            <p>Giải pháp viễn thông và công nghệ hàng đầu Việt Nam.</p>
            <div class="footer-contact-info" style="font-size: 13px; color: #a0b3ce; line-height: 1.6; margin: 12px 0 16px 0;">
              <div>📍 <strong>Địa chỉ:</strong> 107-109 Man Thiện, P. Tăng Nhơn Phú, TP. Thủ Đức, TP. Hồ Chí Minh</div>
              <div style="margin-top: 4px;">✉️ <strong>Email:</strong> <a href="mailto:tvm19624@gmail.com" style="color: #cbd8ef; text-decoration: none;">tvm19624@gmail.com</a> &bull; <a href="mailto:mantv2@fpt.com" style="color: #cbd8ef; text-decoration: none;">mantv2@fpt.com</a></div>
            </div>
            <div class="footer-socials">
              <a href="https://www.facebook.com/ManHenryyy/" target="_blank" rel="noopener noreferrer" class="footer-social-btn fb" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#081836">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://zalo.me/0358513269" target="_blank" rel="noopener noreferrer" class="footer-social-btn zalo" aria-label="Zalo">Zalo</a>
            </div>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">Dịch vụ</h4>
            <ul class="footer-link-list">
              <li><a href="../bang-gia.html">Bảng giá</a></li>
              <li><a href="../../index.html#offers">Ưu đãi</a></li>
              <li><a href="../bang-gia.html#internet">Internet</a></li>
              <li><a href="../bang-gia.html#truyen-hinh">Truyền hình</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">Hỗ trợ khách hàng</h4>
            <ul class="footer-link-list">
              <li><a href="../chinh-sach.html">Chính sách gói cước</a></li>
              <li><a href="../news.html">Tin tức</a></li>
              <li><a href="../lien-he.html">Liên hệ</a></li>
            </ul>
          </div>
          <div class="footer-hotlines">
            <a href="tel:0358513269" class="footer-hotline-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>0358 513 269</span>
            </a>
            <a href="tel:0383900321" class="footer-hotline-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>0383 900 321</span>
            </a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 FPT Telecom. All rights reserved.</span>
          <span>Bản quyền thuộc về Trần Văn Mẫn - ManHenry.</span>
        </div>
      </div>
    </footer>
    <div class="floating-actions" aria-label="Liên hệ nhanh">
      <a href="tel:0383900321" class="floating-call" aria-label="Gọi hotline"
        >☎ <span>Gọi ngay</span></a
      >
      <button class="chat-toggle-btn" id="chat-toggle" aria-label="Mở chat">
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="chat-icon"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          ></path>
        </svg>
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="close-icon"
          style="display: none"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- CRO: Social Proof Toast -->
    <div class="toast-notification" id="social-proof-toast">
      <div class="toast-icon">⚡</div>
      <div class="toast-text">
        <b id="toast-name">Anh Khang (Q.7)</b>
        <span id="toast-action">vừa đăng ký gói COMBO VIP</span>
      </div>
    </div>

    <!-- Custom Chat Widget -->
    <div class="chat-widget" id="chat-widget">
      <div class="chat-widget-header">
        <div class="chat-widget-brand">
          <div class="chat-widget-logo">
            <img
              src="../../assets/images/main/logo.webp"
              alt="FPT Telecom"
              width="28"
              height="28"
              style="
                object-fit: contain;
                background: #fff;
                border-radius: 50%;
                padding: 2px;
              "
            />
          </div>
          <span>FPT Telecom</span>
          <span class="chat-online-dot"></span>
        </div>
        <div class="chat-widget-controls">
          <button
            type="button"
            aria-label="Chuyển sang Live Chat"
            title="Chat trực tiếp với nhân viên"
            class="chat-ctrl-btn"
            onclick="switchToLiveChat()"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              style="vertical-align: middle"
            >
              <path
                d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            id="chat-minimize"
            aria-label="Thu nhỏ"
            class="chat-ctrl-btn"
          >
            −
          </button>
        </div>
      </div>
      <div class="chat-widget-body">
        <div id="chat-messages" class="chat-messages">
          <div class="chat-msg bot-msg">
            <div class="msg-bubble">
              Chào bạn! Mình là Trợ lý ảo FPT Telecom. Mình có thể tư vấn gói
              cước, hỗ trợ kỹ thuật hoặc giải đáp các thắc mắc về dịch vụ. Bạn
              cần mình giúp gì ạ?
            </div>
          </div>
        </div>
        <div class="chat-input-area">
          <textarea
            id="chat-input"
            aria-label="Nhập câu hỏi chat"
            placeholder="Nhập câu hỏi của bạn..."
            rows="1"
            autocomplete="off"
          ></textarea>
          <button id="chat-send-btn" aria-label="Gửi tin nhắn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <script defer src="../../js/script.min.js?v=VERSION"></script>
  </body>
</html>`;
}

// Update news.html with new article cards
function updateNewsListing(newArticles) {
  if (!fs.existsSync(NEWS_HTML_PATH) || newArticles.length === 0) return;
  let content = fs.readFileSync(NEWS_HTML_PATH, "utf8");

  const cardsHtml = newArticles
    .map((art) => {
      return `          <article class="news-card tilt-3d">
            <div class="news-img">
              <a href="posts/${art.slug}.html">
                <img
                  src="${art.image || "../assets/images/main/avata.webp"}"
                  alt="${art.title.replace(/"/g, "&quot;")}"
                  width="400"
                  height="250"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </div>
            <div class="news-content">
              <p class="news-date">${art.dateStr || getTodayString()}</p>
              <h3>
                <a href="posts/${art.slug}.html">${art.title}</a>
              </h3>
              <p>${art.description}</p>
            </div>
          </article>`;
    })
    .join("\n");

  if (content.includes('<div class="news-grid">')) {
    content = content.replace(
      '<div class="news-grid">',
      `<div class="news-grid">\n${cardsHtml}`,
    );
    fs.writeFileSync(NEWS_HTML_PATH, content, "utf8");
    console.log(
      `Updated news.html with ${newArticles.length} new article cards.`,
    );
  }
}

// Update index.html (Homepage) with the top 3 latest articles
function updateHomepageNews() {
  if (!fs.existsSync(INDEX_HTML_PATH) || !fs.existsSync(NEWS_HTML_PATH)) return;

  const newsHtml = fs.readFileSync(NEWS_HTML_PATH, "utf8");
  const $news = cheerio.load(newsHtml);

  const topArticles = [];
  $news(".news-grid .news-card")
    .slice(0, 3)
    .each((idx, el) => {
      const $card = $news(el);
      let linkHref = $card.find("a").first().attr("href") || "";
      if (linkHref.startsWith("posts/")) {
        linkHref = "pages/" + linkHref;
      } else if (
        !linkHref.startsWith("http") &&
        !linkHref.startsWith("pages/")
      ) {
        linkHref = "pages/posts/" + linkHref.replace(/^(\.\.\/)+/, "");
      }

      let imgSrc = $card.find("img").attr("src") || "";
      if (imgSrc.startsWith("../assets/")) {
        imgSrc = imgSrc.replace("../assets/", "assets/");
      }

      const imgAlt = $card.find("img").attr("alt") || "Tin tức FPT";
      const dateText =
        $card.find(".news-date").text().trim() || getTodayString();
      const titleText =
        $card.find("h3 a").text().trim() || $card.find("h3").text().trim();
      const descText = $card
        .find(".news-content p")
        .not(".news-date")
        .text()
        .trim();

      if (titleText && linkHref) {
        topArticles.push({
          link: linkHref,
          image: imgSrc,
          alt: imgAlt,
          date: dateText,
          title: titleText,
          description: descText,
          delayClass: `delay-${(idx + 1) * 100}`,
        });
      }
    });

  if (topArticles.length === 0) return;

  let indexHtml = fs.readFileSync(INDEX_HTML_PATH, "utf8");
  const cardsHtml = topArticles
    .map((art) => {
      const cleanTitle = art.title.replace(/"/g, "&quot;");
      const cleanAlt = art.alt.replace(/"/g, "&quot;");
      return `          <article class="news-card tilt-3d fade-up ${art.delayClass}">
            <a href="${art.link}">
              <img
                src="${art.image}"
                alt="${cleanAlt}"
                loading="lazy"
                width="400"
                height="250"
                style="object-fit: cover"
              />
            </a>
            <div class="news-content">
              <time>${art.date}</time>
              <h3>
                <a href="${art.link}">${cleanTitle}</a>
              </h3>
              <p>${art.description}</p>
              <a href="${art.link}" class="read-more">Xem chi tiết →</a>
            </div>
          </article>`;
    })
    .join("\n");

  const newsGridRegex =
    /(<section class="news[^>]*>[\s\S]*?<div\s+class="news-grid"[^>]*>)([\s\S]*?)(<\/div>\s*<div\s+class="news-actions)/i;

  if (newsGridRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(
      newsGridRegex,
      `$1\n${cardsHtml}\n        $3`,
    );
    fs.writeFileSync(INDEX_HTML_PATH, indexHtml, "utf8");
    console.log(
      `🏠 Updated index.html with ${topArticles.length} latest articles on homepage.`,
    );
  } else {
    console.warn(
      "⚠️ Could not find .news-grid in index.html to update homepage articles.",
    );
  }
}

// Automatically regenerate clean, complete, verified sitemap.xml
function generateFullSitemap() {
  const todayIso = new Date().toISOString().split("T")[0];

  const mainPages = [
    {
      loc: "https://fpttelecomvn.click/",
      priority: "1.0",
      changefreq: "daily",
      lastmod: todayIso,
    },
    {
      loc: "https://fpttelecomvn.click/pages/bang-gia.html",
      priority: "0.9",
      changefreq: "weekly",
      lastmod: todayIso,
    },
    {
      loc: "https://fpttelecomvn.click/pages/khu-vuc.html",
      priority: "0.9",
      changefreq: "weekly",
      lastmod: todayIso,
    },
    {
      loc: "https://fpttelecomvn.click/pages/news.html",
      priority: "0.9",
      changefreq: "daily",
      lastmod: todayIso,
    },
    {
      loc: "https://fpttelecomvn.click/pages/chinh-sach.html",
      priority: "0.8",
      changefreq: "monthly",
      lastmod: todayIso,
    },
    {
      loc: "https://fpttelecomvn.click/pages/lien-he.html",
      priority: "0.9",
      changefreq: "monthly",
      lastmod: todayIso,
    },
  ];

  // Scan all actual post files on disk
  const postFiles = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".html"))
    : [];

  const postEntries = postFiles.map((file) => {
    const fullPath = path.join(POSTS_DIR, file);
    let mtimeIso = todayIso;
    try {
      mtimeIso = fs.statSync(fullPath).mtime.toISOString().split("T")[0];
    } catch (e) {}

    return {
      loc: `https://fpttelecomvn.click/pages/posts/${file}`,
      lastmod: mtimeIso,
      changefreq: "monthly",
      priority: "0.8",
    };
  });

  // Scan all topic landing pages
  const topicsDir = path.join(REPO_ROOT, "pages", "topics");
  const topicFiles = fs.existsSync(topicsDir)
    ? fs.readdirSync(topicsDir).filter((f) => f.endsWith(".html"))
    : [];

  const topicEntries = topicFiles.map((file) => {
    const fullPath = path.join(topicsDir, file);
    let mtimeIso = todayIso;
    try {
      mtimeIso = fs.statSync(fullPath).mtime.toISOString().split("T")[0];
    } catch (e) {}

    return {
      loc: `https://fpttelecomvn.click/pages/topics/${file}`,
      lastmod: mtimeIso,
      changefreq: "weekly",
      priority: "0.85",
    };
  });

  const allUrls = [...mainPages, ...topicEntries, ...postEntries];

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <!-- Core Static Pages -->",
    ...mainPages.map(
      (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    ),
    "",
    `  <!-- Niche Programmatic Landing Pages (${topicEntries.length} topics) -->`,
    ...topicEntries.map(
      (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    ),
    "",
    `  <!-- Dynamic Article & Promo Posts (${postEntries.length} articles) -->`,
    ...postEntries.map(
      (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    ),
    "</urlset>",
  ];

  const xmlContent = xmlLines.join("\n") + "\n";
  fs.writeFileSync(SITEMAP_PATH, xmlContent, "utf8");
  console.log(
    `🗺️  Regenerated sitemap.xml with ${allUrls.length} verified URLs.`,
  );
}


async function main() {
  console.log("🚀 Starting FPT News crawler & synchronizer...");
  try {
    const mainHtml = await fetchHtml(NEWS_URL);
    const $ = cheerio.load(mainHtml);

    const articleLinks = [];
    $('a[href*="/tin-tuc/"]').each((i, el) => {
      const href = $(el).attr("href") || "";
      // Only match real article URLs with .html and id
      if (
        href.includes(".html") &&
        href.includes("/tin-tuc/") &&
        !href.includes("/tags/") &&
        !href.includes("/category/") &&
        !href.endsWith("/tin-tuc")
      ) {
        const cleanHref = href.split("?")[0];
        const fullUrl = cleanHref.startsWith("http")
          ? cleanHref
          : `${BASE_URL}${cleanHref.startsWith("/") ? "" : "/"}${cleanHref}`;
        const title = $(el).text().trim();
        if (title.length > 15 && !articleLinks.some((a) => a.url === fullUrl)) {
          articleLinks.push({ url: fullUrl, title });
        }
      }
    });

    console.log(
      `Found ${articleLinks.length} distinct article links on fpt.vn/tin-tuc.`,
    );

    const newlyAddedArticles = [];

    // Process top 5 newest articles
    for (const item of articleLinks.slice(0, 5)) {
      // Create clean slug from title without random trailing numbers
      const slug = toSlug(item.title);
      const postFileName = `${slug}.html`;
      const postFilePath = path.join(POSTS_DIR, postFileName);

      if (fs.existsSync(postFilePath) || syncedArticles.includes(item.url)) {
        console.log(`⏩ Skipping existing article: ${item.title}`);
        continue;
      }

      console.log(`📥 Fetching details for: ${item.title}`);
      try {
        const detailHtml = await fetchHtml(item.url);
        const $d = cheerio.load(detailHtml);

        const pageTitle = $d("h1").first().text().trim() || item.title;
        const pageDesc =
          $d('meta[name="description"]').attr("content") ||
          $d("p").first().text().trim() ||
          item.title;
        const ogImage = $d('meta[property="og:image"]').attr("content") || "";

        // Extract article body content
        let bodyHtml = "";
        const contentContainers = [
          ".detail-content",
          ".news-detail",
          ".article-body",
          ".content-detail",
          "article",
          ".main-content",
        ];
        for (const selector of contentContainers) {
          if ($d(selector).length > 0) {
            $d(
              `${selector} script, ${selector} style, ${selector} iframe, ${selector} form, ${selector} .g-recaptcha, ${selector} .share-box, ${selector} .tag-box, ${selector} nav, ${selector} .form_bordered, ${selector} .form-register`,
            ).remove();
            bodyHtml = $d(selector).html();
            break;
          }
        }

        if (!bodyHtml || bodyHtml.length < 100) {
          // Fallback: collect valid paragraphs
          const paragraphs = [];
          $d("p").each((idx, p) => {
            const pText = $d(p).text().trim();
            if (
              pText.length > 40 &&
              !pText.includes("Hotline") &&
              !pText.includes("FPT Telecom") &&
              !pText.includes("Đăng ký")
            ) {
              paragraphs.push(`<p>${pText}</p>`);
            }
          });
          bodyHtml = paragraphs.slice(0, 8).join("\n");
        }

        // Clean any original 19006600 phone numbers or links
        bodyHtml = bodyHtml.replace(/1900\s?6600/g, "0383 900 321");

        const articleObj = {
          title: pageTitle,
          slug: slug,
          description: pageDesc.slice(0, 200) + "...",
          image: ogImage.startsWith("http")
            ? ogImage
            : ogImage
              ? `${BASE_URL}${ogImage}`
              : "",
          dateStr: getTodayString(),
          dateIso: new Date().toISOString(),
          contentHtml: bodyHtml,
          originalUrl: item.url,
        };

        // Write article HTML
        const fullArticleHtml = generateArticleHtml(articleObj);
        fs.writeFileSync(postFilePath, fullArticleHtml, "utf8");
        console.log(`✅ Generated post: pages/posts/${postFileName}`);

        newlyAddedArticles.push(articleObj);
        syncedArticles.push(item.url);
      } catch (err) {
        console.error(`❌ Error parsing article ${item.url}:`, err.message);
      }
    }

    if (newlyAddedArticles.length > 0) {
      updateNewsListing(newlyAddedArticles);
      fs.writeFileSync(
        INDEX_TRACKER_PATH,
        JSON.stringify(syncedArticles, null, 2),
        "utf8",
      );
      console.log(
        `🎉 Successfully synced ${newlyAddedArticles.length} new articles!`,
      );
    } else {
      console.log(
        "✨ All articles are already up to date. No new articles to sync.",
      );
    }

    // Always keep homepage in sync with latest articles
    updateHomepageNews();

    // Always regenerate clean and complete sitemap
    generateFullSitemap();
  } catch (error) {
    console.warn("⚠️ Sync note:", error.message || error);
    console.log("ℹ️ Preserving existing content and ensuring sitemap is up to date...");
    try {
      updateHomepageNews();
      generateFullSitemap();
    } catch (e) {}
  }
}

main();
