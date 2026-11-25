/**
 * ==============================================================================
 * LOCAL SEO REGIONAL LANDING PAGE GENERATOR (Node.js)
 * Sinh các trang bảng giá & hạ tầng chuyên sâu theo từng địa phương tại pages/khu-vuc/
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const LOCAL_JSON_PATH = path.join(ROOT_DIR, "data", "local_areas.json");
const OUTPUT_DIR = path.join(ROOT_DIR, "pages", "khu-vuc");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const areas = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf8").replace(/^\uFEFF/, ""));

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateSchema(area, pageUrl) {
  const faqEntities = (area.faqs || []).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  }));

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://fpttelecomvn.click/#website",
          url: "https://fpttelecomvn.click/",
          name: "FPT Telecom - Đại lý ủy quyền",
          inLanguage: "vi-VN",
        },
        {
          "@type": "Organization",
          "@id": "https://fpttelecomvn.click/#organization",
          name: "FPT Telecom - Đại lý ủy quyền",
          url: "https://fpttelecomvn.click/",
          logo: {
            "@type": "ImageObject",
            url: "https://fpttelecomvn.click/assets/images/main/fptlogo.png",
          },
          telephone: "+84358513269",
          sameAs: [
            "https://www.facebook.com/profile.php?id=61596572759217",
            "https://zalo.me/0358513269",
          ],
        },
        {
          "@type": "Person",
          "@id": "https://fpttelecomvn.click/pages/ve-chung-toi.html#author",
          name: "Trần Văn Mẫn",
          jobTitle: "Chuyên viên Tư vấn Hạ tầng & Dịch vụ FPT Telecom",
          url: "https://fpttelecomvn.click/pages/ve-chung-toi.html",
        },
        {
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: area.title,
          description: area.meta_desc,
          isPartOf: { "@id": "https://fpttelecomvn.click/#website" },
          breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
          author: { "@id": "https://fpttelecomvn.click/pages/ve-chung-toi.html#author" },
          datePublished: "2026-08-01T08:00:00+07:00",
          dateModified: new Date().toISOString(),
          inLanguage: "vi-VN",
        },
        {
          "@type": "Service",
          name: `Lắp đặt Internet Cáp Quang FPT tại ${area.region_name}`,
          serviceType: "Internet Service Provider",
          provider: { "@id": "https://fpttelecomvn.click/#organization" },
          areaServed: {
            "@type": "AdministrativeArea",
            name: area.region_name,
          },
          description: area.meta_desc,
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://fpttelecomvn.click/" },
            { "@type": "ListItem", position: 2, name: "Khu vực", item: "https://fpttelecomvn.click/pages/khu-vuc.html" },
            { "@type": "ListItem", position: 3, name: area.short_name, item: pageUrl },
          ],
        },
        {
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          mainEntity: faqEntities,
        },
      ],
    },
    null,
    2,
  );
}

function renderLocalPage(area) {
  const pageUrl = `https://fpttelecomvn.click/pages/khu-vuc/${area.slug}.html`;
  const schemaJson = generateSchema(area, pageUrl);
  const colHeader1 =
    area.id === "local_dongnai"
      ? "Khu vực DNI1"
      : area.id === "local_binhduong"
        ? "8 Phường Trung Tâm"
        : area.id === "local_vungtau"
          ? "Khu vực Phường"
          : area.id === "local_taynamb"
            ? "Tiền Giang"
            : "Nội thành / Q2 cũ";
  const colHeader2 =
    area.id === "local_dongnai"
      ? "Khu vực DNI2,3,4"
      : area.id === "local_binhduong"
        ? "Khu vực Xã còn lại"
        : area.id === "local_vungtau"
          ? "Khu vực Xã"
          : area.id === "local_taynamb"
            ? "Đồng Tháp"
            : "Ngoại thành / Thủ Đức cũ";

  const rowsHtml = (area.pricing_rows || [])
    .map(
      (r) => `
      <tr>
        <td><strong>${escapeHtml(r[0])}</strong></td>
        <td style="text-align:center;color:#0056d6;font-weight:700;">${escapeHtml(r[1])}</td>
        <td style="text-align:center;color:#ea580c;font-weight:800;">${escapeHtml(r[2])}</td>
        <td>${escapeHtml(r[3])}</td>
      </tr>`,
    )
    .join("\n");

  const highlightsHtml = (area.highlights || [])
    .map(
      (h) => `
      <div class="local-hl-card">
        <span class="local-hl-icon">✓</span>
        <span>${escapeHtml(h)}</span>
      </div>`,
    )
    .join("\n");

  const faqsHtml = (area.faqs || [])
    .map(
      (faq, idx) => `
      <details class="local-faq-item" ${idx === 0 ? "open" : ""}>
        <summary>${escapeHtml(faq.q)}</summary>
        <div class="local-faq-body"><p>${escapeHtml(faq.a)}</p></div>
      </details>`,
    )
    .join("\n");

  const otherAreasHtml = areas
    .filter((a) => a.id !== area.id)
    .map(
      (a) => `<a href="${a.slug}.html" class="local-pill-link">📍 ${escapeHtml(a.short_name)}</a>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="vi">
  <head>
    <!-- Google Tag Manager (Lazy Loaded) -->
    <script>
      (function () {
        var gtmLoaded = false;
        function loadGTM() {
          if (gtmLoaded) return;
          gtmLoaded = true;
          (function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
            var f = d.getElementsByTagName(s)[0],
              j = d.createElement(s),
              dl = l != "dataLayer" ? "&l=" + l : "";
            j.async = true;
            j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
            f.parentNode.insertBefore(j, f);
          })(window, document, "script", "dataLayer", "GTM-KWWKQ7KK");
          ["scroll", "mousemove", "touchstart", "click"].forEach(function (e) {
            window.removeEventListener(e, loadGTM);
          });
        }
        ["scroll", "mousemove", "touchstart", "click"].forEach(function (e) {
          window.addEventListener(e, loadGTM, { passive: true, once: true });
        });
        window.addEventListener("load", function () {
          setTimeout(loadGTM, 3000);
        });
      })();
    </script>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0665f5" />

    <link rel="preload" href="/assets/fonts/inter-400-vietnamese.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/inter-600-vietnamese.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/inter-700-vietnamese.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/main/fptlogo.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/assets/images/main/fptlogo.png" />

    <title>${area.title} | FPT Telecom</title>
    <meta name="description" content="${escapeHtml(area.meta_desc)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large" />
    <meta name="author" content="Trần Văn Mẫn - Chuyên viên FPT Telecom" />

    <link rel="canonical" href="${pageUrl}" />
    <link rel="alternate" hreflang="vi-VN" href="${pageUrl}" />

    <meta property="og:site_name" content="FPT Telecom - Đại lý ủy quyền" />
    <meta property="og:title" content="${area.title}" />
    <meta property="og:description" content="${escapeHtml(area.meta_desc)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="vi_VN" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="https://fpttelecomvn.click/assets/images/main/avata.webp" />

    <link rel="stylesheet" href="../../css/styles.min.css?v=VERSION" />

    <script type="application/ld+json">
${schemaJson}
    </script>

    <style>
      .local-hero {
        background: linear-gradient(135deg, #071b42 0%, #0056d6 100%);
        color: #fff;
        padding: 48px 20px 56px;
        text-align: center;
      }
      .local-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.28);
        color: #fed7aa;
        padding: 6px 16px;
        border-radius: 999px;
        font-size: 12.5px;
        font-weight: 700;
        margin-bottom: 14px;
      }
      .local-hero h1 {
        font-size: clamp(23px, 3.6vw, 36px);
        font-weight: 800;
        max-width: 900px;
        margin: 0 auto 14px;
        line-height: 1.3;
      }
      .local-hero p {
        max-width: 780px;
        margin: 0 auto 24px;
        color: #dbeafe;
        font-size: 15px;
        line-height: 1.65;
      }
      .local-container {
        max-width: 1080px;
        margin: 0 auto;
        padding: 32px 16px 60px;
      }
      .local-hl-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 14px;
        margin-bottom: 32px;
      }
      .local-hl-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px 18px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
      }
      .local-hl-icon {
        color: #16a34a;
        font-weight: 900;
        font-size: 16px;
        flex-shrink: 0;
      }
      .local-box {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 28px;
        margin-bottom: 28px;
        box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
      }
      .local-box h2, .local-box h3 {
        color: #071b42;
        margin-top: 0;
      }
      .local-table-wrap {
        overflow-x: auto;
        margin: 16px 0;
      }
      .local-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 600px;
        font-size: 14px;
      }
      .local-table th {
        background: #071b42;
        color: #fff;
        padding: 12px 14px;
        text-align: left;
      }
      .local-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #e2e8f0;
        color: #334155;
      }
      .local-table tr:nth-child(even) td {
        background: #f8fafc;
      }
      .local-faq-item {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        margin-bottom: 10px;
        overflow: hidden;
      }
      .local-faq-item summary {
        padding: 15px 18px;
        font-weight: 700;
        font-size: 15px;
        color: #0f172a;
        cursor: pointer;
      }
      .local-faq-body {
        padding: 0 18px 16px;
        font-size: 14px;
        color: #475569;
        line-height: 1.65;
      }
      .local-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }
      .local-pill-link {
        background: #fff;
        color: #0056d6;
        border: 1px solid #cbd5e1;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 13.5px;
        font-weight: 600;
        text-decoration: none;
      }
      .local-pill-link:hover {
        background: #0056d6;
        color: #fff;
        border-color: #0056d6;
      }
    </style>
  </head>
  <body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KWWKQ7KK" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <a href="#main-content" class="skip-link">Chuyển đến nội dung chính</a>

    <div class="topbar">
      <span class="topbar-promo">
        <span class="pulse-dot"></span>
        <span class="topbar-text-desktop">⚡ Ưu đãi tháng này: miễn phí lắp đặt &amp; tặng thiết bị WiFi 6</span>
        <span class="topbar-text-mobile">⚡ Free lắp đặt &amp; tặng WiFi 6</span>
      </span>
      <a href="tel:0358513269" class="topbar-hotline">Hotline: <b>0358 513 269</b></a>
    </div>

    <header class="header sticky-header" id="home">
      <a class="logo logo-image" href="../../index.html" aria-label="FPT Telecom">
        <img src="../../assets/images/main/logo.webp" alt="FPT Telecom" width="164" height="45" />
        <span class="auth-badge">Đại lý ủy quyền FPT</span>
      </a>
      <a class="header-cta-mobile" href="javascript:void(0);" onclick="openRegisterModal('Lắp mạng FPT ${escapeHtml(area.short_name)}')" aria-label="Đăng ký ngay">
        <span>Đăng ký ngay</span>
      </a>
      <button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">
        <span aria-hidden="true">☰</span>
      </button>
      <nav role="navigation" aria-label="Menu chính">
        <a href="../../index.html">Trang chủ</a>
        <a href="../bang-gia.html">Bảng giá</a>
        <a href="../khu-vuc.html" class="active">Khu vực</a>
        <a href="../news.html">Tin tức</a>
        <a href="../chinh-sach.html">Chính sách</a>
        <a href="../lien-he.html">Liên hệ</a>
      </nav>
      <a class="btn btn-orange header-cta" href="javascript:void(0);" onclick="openRegisterModal('Lắp mạng FPT ${escapeHtml(area.short_name)}')">Đăng ký ngay <span>→</span></a>
    </header>

    <section class="local-hero">
      <div class="local-badge">${area.badge}</div>
      <h1>${area.h1}</h1>
      <p>${escapeHtml(area.intro)}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button type="button" class="btn btn-orange" onclick="openRegisterModal('Lắp mạng FPT ${escapeHtml(area.short_name)}')">⚡ Đăng ký kiểm tra cổng ngay</button>
        <a href="tel:0358513269" class="btn outline-btn" style="color:#fff;border-color:rgba(255,255,255,0.4);">📞 Gọi 0358 513 269</a>
      </div>
    </section>

    <main id="main-content" class="local-container">
      <div class="local-hl-grid">
        ${highlightsHtml}
      </div>

      <section class="local-box">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:18px;font-size:13px;color:#475569;">
          <div>✍️ Cập nhật &amp; xác thực bảng giá: <a href="../ve-chung-toi.html" style="color:#0056d6;font-weight:700;text-decoration:none;">Trần Văn Mẫn — Chuyên viên FPT Telecom</a></div>
          <div>🏢 ${escapeHtml(area.office)}</div>
        </div>
        <h2>Bảng Giá Cước FPT Tại ${escapeHtml(area.region_name)} (Đã Gồm VAT)</h2>
        <div class="local-table-wrap">
          <table class="local-table">
            <thead>
              <tr>
                <th>Gói Cước</th>
                <th style="text-align:center;">${colHeader1}</th>
                <th style="text-align:center;">${colHeader2}</th>
                <th>Thiết Bị &amp; Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        <p style="font-size:13.5px;color:#475569;background:#fff7ed;border:1px solid #fed7aa;padding:12px 16px;border-radius:10px;margin:12px 0 0;">
          <strong>Lưu ý chính sách ${escapeHtml(area.short_name)}:</strong> ${escapeHtml(area.notes)}
        </p>
      </section>

      <section class="local-box">
        ${area.zone_breakdown}
        <div style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;">
          <a href="../../index.html#package-finder" class="btn btn-blue">🔍 Gợi ý gói cước cho nhà bạn</a>
          <a href="../chinh-sach.html" class="outline-btn">Xem đầy đủ chính sách bán hàng</a>
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="text-align:center;color:#071b42;font-size:24px;font-weight:800;margin-bottom:18px;">Câu Hỏi Thường Gặp Tại ${escapeHtml(area.short_name)}</h2>
        ${faqsHtml}
      </section>

      <section class="local-box" id="contact" style="text-align:center;">
        <h2>Đăng Ký Khảo Sát Hạ Tầng Miễn Phí Tại ${escapeHtml(area.region_name)}</h2>
        <p style="color:#64748b;font-size:14px;margin-bottom:22px;">Chuyên viên khu vực liên hệ báo giá chính xác theo số nhà/phường và hỗ trợ kéo cáp trong 24h.</p>
        <form id="leadForm" style="max-width:620px;margin:0 auto;text-align:left;" action="javascript:void(0);">
          <input type="hidden" name="form_type" value="registration" />
          <input type="hidden" name="website" value="" />
          <input type="hidden" name="Gói cước" value="Lắp mạng FPT ${escapeHtml(area.short_name)}" />
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:14px;">
            <div>
              <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;">Họ và tên *</label>
              <input type="text" name="Họ tên" placeholder="Ví dụ: Nguyễn Văn An" required style="width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:10px;" />
            </div>
            <div>
              <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;">Số điện thoại *</label>
              <input type="tel" name="Số điện thoại" placeholder="Ví dụ: 0987654321" pattern="[0-9]{10,11}" required style="width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:10px;" />
            </div>
          </div>
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;">Địa chỉ lắp đặt tại ${escapeHtml(area.short_name)} *</label>
            <input type="text" name="Khu vực" placeholder="${escapeHtml(area.address_hint)}" required style="width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:10px;" />
          </div>
          <div class="form-consent-badge">
            <label class="consent-badge-label">
              <input type="checkbox" name="consent_nd13" value="1" checked required />
              <span>🔒 <strong>Miễn phí khảo sát 100%.</strong> Tôi đồng ý cho FPT Telecom xử lý thông tin để tư vấn dịch vụ theo <a href="../chinh-sach.html#privacy" target="_blank">Nghị định 13/2023/NĐ-CP</a>.</span>
            </label>
          </div>
          <button type="submit" class="btn btn-orange" style="width:100%;">GỬI YÊU CẦU KHẢO SÁT MIỄN PHÍ →</button>
          <div class="success" role="status" aria-live="polite"></div>
        </form>
      </section>

      <div style="background:#f1f5f9;border-radius:16px;padding:24px;text-align:center;">
        <h3 style="margin:0 0 14px;font-size:16px;color:#334155;">Xem bảng giá FPT tại các khu vực khác:</h3>
        <div class="local-pills">
          ${otherAreasHtml}
        </div>
      </div>
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
              <a href="https://www.facebook.com/profile.php?id=61596572759217" target="_blank" rel="noopener noreferrer" class="footer-social-btn fb" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#081836"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://zalo.me/0358513269" target="_blank" rel="noopener noreferrer" class="footer-social-btn zalo" aria-label="Zalo">Zalo</a>
            </div>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">Dịch vụ</h4>
            <ul class="footer-link-list">
              <li><a href="../bang-gia.html">Bảng giá</a></li>
              <li><a href="../khu-vuc.html">Khu vực phủ sóng</a></li>
              <li><a href="../bang-gia.html#internet">Internet</a></li>
              <li><a href="../bang-gia.html#truyen-hinh">Truyền hình</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">Hỗ trợ khách hàng</h4>
            <ul class="footer-link-list">
              <li><a href="../ve-chung-toi.html">Về chúng tôi</a></li>
              <li><a href="../chinh-sach.html">Chính sách gói cước</a></li>
              <li><a href="../news.html">Tin tức &amp; Cẩm nang</a></li>
              <li><a href="../lien-he.html">Liên hệ</a></li>
            </ul>
          </div>
          <div class="footer-hotlines">
            <a href="tel:0358513269" class="footer-hotline-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>
              <span>0358 513 269</span>
            </a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 FPT Telecom - Đại lý ủy quyền.</span>
          <span>Phụ trách nội dung: Trần Văn Mẫn - ManHenry.</span>
        </div>
      </div>
    </footer>

    <script defer src="../../js/script.min.js?v=VERSION"></script>
  </body>
</html>`;
}

areas.forEach((area, i) => {
  const html = renderLocalPage(area);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${area.slug}.html`), html, "utf8");
  console.log(`✅ [${i + 1}/${areas.length}] Generated pages/khu-vuc/${area.slug}.html`);
});
