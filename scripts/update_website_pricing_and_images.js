const fs = require('fs');
const path = require('path');

// 1. Update pages/bang-gia.html
const bangGiaPath = path.join(__dirname, '..', 'pages', 'bang-gia.html');
let bangGiaHtml = fs.readFileSync(bangGiaPath, 'utf8');

// Replacement map for banner images in bang-gia.html
const imageReplacements = [
  { from: '../assets/images/main/internetgiga.webp', to: '../assets/images/packages/internetgiga.jpg' },
  { from: '../assets/images/main/internetsky.webp', to: '../assets/images/packages/internetsky.jpg' },
  { from: '../assets/images/main/internetgigaf1.webp', to: '../assets/images/packages/internetgigaf1.jpg' },
  { from: '../assets/images/main/internetskyf1.webp', to: '../assets/images/packages/internetskyf1.jpg' },
  { from: '../assets/images/main/internetskyf2.webp', to: '../assets/images/packages/combo-sky-f2.jpg' },
  { from: '../assets/images/main/giga-antam.webp', to: '../assets/images/packages/combo-an-tam.jpg' },
  { from: '../assets/images/main/sky-antam.webp', to: '../assets/images/packages/combo-an-tam.jpg' },
  { from: '../assets/images/main/fpt-speedx2.webp', to: '../assets/images/packages/fpt-speedx2.jpg' },
  { from: '../assets/images/main/fpt-speedx10.webp', to: '../assets/images/packages/fpt-speedx10.jpg' },
  { from: '../assets/images/main/fpt-speedx2-pro.webp', to: '../assets/images/packages/fpt-speedx2-pro.jpg' },
  { from: '../assets/images/main/fpt-speedx10-pro.webp', to: '../assets/images/packages/fpt-speedx10-pro.jpg' },
  { from: '../assets/images/main/lux500-doanhnghiep.webp', to: '../assets/images/packages/lux500-doanhnghiep.jpg' },
  { from: '../assets/images/main/lux800-doanhnghiep.webp', to: '../assets/images/packages/lux800-doanhnghiep.jpg' },
  { from: '../assets/images/main/super300-biz.webp', to: '../assets/images/packages/super300-biz.jpg' },
  { from: '../assets/images/main/super300-biz-plus.webp', to: '../assets/images/packages/super300-biz-plus.jpg' },
  { from: '../assets/images/main/super500-biz.webp', to: '../assets/images/packages/super500-biz.jpg' },
  { from: '../assets/images/main/super500-biz-plus.webp', to: '../assets/images/packages/super500-biz-plus.jpg' },
  { from: '../assets/images/main/super600-biz.webp', to: '../assets/images/packages/super600-biz.jpg' },
  { from: '../assets/images/main/super600-biz-plus.webp', to: '../assets/images/packages/super600-biz-plus.jpg' },
  { from: '../assets/images/main/super800-biz.webp', to: '../assets/images/packages/super800-biz.png' },
  { from: '../assets/images/main/super800-biz-plus.webp', to: '../assets/images/packages/super800-biz-plus.png' }
];

for (const rep of imageReplacements) {
  bangGiaHtml = bangGiaHtml.split(rep.from).join(rep.to);
}

// Custom replacements for contextual images in bang-gia.html
// Triple Giga banner:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/gigavvip\.webp"\s+alt="Triple Giga FPT"/g,
  '<img src="../assets/images/packages/combo-giga-vvip.jpg" alt="Triple Giga FPT"'
);
// Triple Sky banner:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/skyvvip\.webp"\s+alt="Triple Sky FPT"/g,
  '<img src="../assets/images/packages/combo-sky-vvip.jpg" alt="Triple Sky FPT"'
);
// Combo Giga VVIP:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/gigavvip\.webp"\s+alt="Combo Giga V\.VIP FPT"/g,
  '<img src="../assets/images/packages/combo-giga-vvip.jpg" alt="Combo Giga V.VIP FPT"'
);
// Combo Sky VVIP:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/skyvvip\.webp"\s+alt="Combo Sky V\.VIP FPT"/g,
  '<img src="../assets/images/packages/combo-sky-vvip.jpg" alt="Combo Sky V.VIP FPT"'
);
// Combo Meta VVIP:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/metavvip\.webp"\s+alt="Combo Meta V\.VIP FPT"/g,
  '<img src="../assets/images/packages/combo-meta-vvip.jpg" alt="Combo Meta V.VIP FPT"'
);
// Combo Lux 500 VVIP:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/lux500vvip\.webp"\s+alt="Combo Lux 500 V\.VIP FPT"/g,
  '<img src="../assets/images/packages/combo-lux500-vvip.jpg" alt="Combo Lux 500 V.VIP FPT"'
);
// Combo Lux 800 VVIP:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/lux800vvip\.webp"\s+alt="Combo Lux 800 V\.VIP FPT"/g,
  '<img src="../assets/images/packages/combo-lux800-vvip.jpg" alt="Combo Lux 800 V.VIP FPT"'
);
// Internet Meta F1:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/internetmetaf1\.webp"\s+alt="Internet Meta F1 FPT"/g,
  '<img src="../assets/images/packages/combo-meta-f1.jpg" alt="Internet Meta F1 FPT"'
);
// Internet Meta F2:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/internetmetaf2\.webp"\s+alt="Internet Meta F2 FPT"/g,
  '<img src="../assets/images/packages/combo-meta-f2.jpg" alt="Internet Meta F2 FPT"'
);
// Internet Meta F3:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/internetmeta\.webp"\s+alt="Internet Meta F3 FPT"/g,
  '<img src="../assets/images/packages/combo-meta-f3.jpg" alt="Internet Meta F3 FPT"'
);
// Internet Meta Game:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/internetmeta\.webp"\s+alt="Internet Meta FPT Game thủ"/g,
  '<img src="../assets/images/packages/combo-meta.jpg" alt="Internet Meta FPT Game thủ"'
);
// Internet F-Game:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/gamethu\.webp"\s+alt="Gói F-GAME FPT chuyên nghiệp"/g,
  '<img src="../assets/images/packages/internet-fgame.jpg" alt="Gói F-GAME FPT chuyên nghiệp"'
);
// F-Game F1:
bangGiaHtml = bangGiaHtml.replace(
  /<img\s+src="\.\.\/assets\/images\/main\/internetmetaf1\.webp"\s+alt="Internet F-GAME F1 FPT"/g,
  '<img src="../assets/images/packages/internet-fgame-f1.jpg" alt="Internet F-GAME F1 FPT"'
);

// Add Card "Combo SpeedX1 - V.VIP" right before "Combo Lux 500 - V.VIP" in slider-track-2
const speedX1VvipCard = `              <!-- Card: Combo SpeedX1 - V.VIP -->
              <article class="fpt-card scroll-animate">
                <div class="fpt-card-banner">
                  <img
                    src="../assets/images/packages/combo-speedx1-vvip.jpg"
                    alt="Combo SpeedX1 V.VIP FPT Wi-Fi 7"
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    style="
                      position: absolute;
                      top: 10px;
                      right: 10px;
                      background: linear-gradient(135deg, #f97316, #ea580c);
                      color: white;
                      padding: 4px 10px;
                      border-radius: 12px;
                      font-weight: bold;
                      font-size: 12px;
                    "
                  >
                    WI-FI 7 ĐỈNH CAO
                  </div>
                </div>
                <div class="fpt-card-body">
                  <h3 class="fpt-card-title">Combo SpeedX1 - V.VIP</h3>
                  <div class="fpt-price-row">
                    <span
                      class="fpt-price-val price-val"
                      data-xa="369.000"
                      data-phuong="369.000"
                      data-hcm_ngoai="369.000"
                      data-hcm_noi="369.000"
                      >369.000đ</span
                    >
                    <span class="fpt-price-unit">/tháng</span>
                    <span
                      class="fpt-info-tip"
                      title="Giá đã bao gồm VAT và ưu đãi khuyến mãi"
                      >ⓘ</span
                    >
                  </div>
                  <div class="fpt-speed-box">
                    <div class="fpt-speed-info">
                      <span class="fpt-speed-label"
                        >Tốc độ (Download/ Upload)</span
                      >
                      <span class="fpt-speed-val">↓ 1 Gbps ↑ 1 Gbps</span>
                    </div>
                    <div class="fpt-speed-icon">
                      <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="0"/>
                        <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                        <line x1="18" y1="24" x2="27" y2="21" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="fpt-card-features">
                    <li>
                      <span class="fpt-check-icon">✓</span> Modem Wi-Fi 7 thế hệ mới tải gấp 4 lần
                    </li>
                    <li>
                      <span class="fpt-check-icon">✓</span> Xem trọn vẹn Ngoại hạng Anh 4K trên FPT Play
                    </li>
                    <li>
                      <span class="fpt-check-icon">✓</span> Tặng kèm thiết bị Mesh Wi-Fi 7 siêu tốc
                    </li>
                  </ul>
                  <button
                    type="button"
                    class="fpt-card-btn"
                    onclick="selectPlan('Combo SpeedX1 - V.VIP')"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </article>

`;

if (!bangGiaHtml.includes('Combo SpeedX1 - V.VIP')) {
  bangGiaHtml = bangGiaHtml.replace(
    '<!-- Card 4: Combo Lux 500 - V.VIP -->',
    speedX1VvipCard + '              <!-- Card 4: Combo Lux 500 - V.VIP -->'
  );
}

// Add Cards SpeedX Pro Lite into slider-track-speedx
const speedXProLiteCards = `              <!-- Card: FPT SpeedX2 Pro Lite -->
              <article class="fpt-card scroll-animate">
                <div class="fpt-card-banner">
                  <img
                    src="../assets/images/packages/fpt-speedx2-pro-lite.jpg"
                    alt="Gói cước FPT SpeedX2 Pro Lite Wi-Fi 7"
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="fpt-card-body">
                  <h3 class="fpt-card-title">FPT SpeedX2 Pro Lite</h3>
                  <div class="fpt-price-row">
                    <span class="fpt-price-val">1.099.000đ</span>
                    <span class="fpt-price-unit">/tháng</span>
                    <span class="fpt-info-tip" title="Bản Pro Lite Wi-Fi 7 2Gbps">ⓘ</span>
                  </div>
                  <div class="fpt-speed-box">
                    <div class="fpt-speed-info">
                      <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                      <span class="fpt-speed-val">↓ 2 Gbps ↑ 2 Gbps</span>
                    </div>
                    <div class="fpt-speed-icon">
                      <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#f97316" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="12.5"/>
                        <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                        <line x1="18" y1="24" x2="25" y2="17" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="fpt-card-features">
                    <li><span class="fpt-check-icon">✓</span> Wi-Fi 7 tăng khả năng tải gấp 4 lần</li>
                    <li><span class="fpt-check-icon">✓</span> Công nghệ XGS-PON 2Gbps đối xứng</li>
                    <li><span class="fpt-check-icon">✓</span> Chịu tải đến 100 thiết bị kết nối đồng thời</li>
                  </ul>
                  <button type="button" class="fpt-card-btn" onclick="selectPlan('FPT SpeedX2 Pro Lite')">Đăng ký ngay</button>
                </div>
              </article>

              <!-- Card: FPT SpeedX10 Pro Lite -->
              <article class="fpt-card scroll-animate">
                <div class="fpt-card-banner">
                  <img
                    src="../assets/images/packages/fpt-speedx10-pro-lite.jpg"
                    alt="Gói cước FPT SpeedX10 Pro Lite Wi-Fi 7"
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="fpt-card-body">
                  <h3 class="fpt-card-title">FPT SpeedX10 Pro Lite</h3>
                  <div class="fpt-price-row">
                    <span class="fpt-price-val">1.699.000đ</span>
                    <span class="fpt-price-unit">/tháng</span>
                    <span class="fpt-info-tip" title="Bản Pro Lite Wi-Fi 7 10Gbps đỉnh cao">ⓘ</span>
                  </div>
                  <div class="fpt-speed-box">
                    <div class="fpt-speed-info">
                      <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                      <span class="fpt-speed-val">↓ 10 Gbps ↑ 10 Gbps</span>
                    </div>
                    <div class="fpt-speed-icon">
                      <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#f97316" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="12.5"/>
                        <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                        <line x1="18" y1="24" x2="25" y2="17" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="fpt-card-features">
                    <li><span class="fpt-check-icon">✓</span> Băng thông 10 Gbps không giới hạn</li>
                    <li><span class="fpt-check-icon">✓</span> Chuẩn Wi-Fi 7 XGS-PON tân tiến nhất</li>
                    <li><span class="fpt-check-icon">✓</span> Chuyên biệt cho Studio, Game thủ, Server</li>
                  </ul>
                  <button type="button" class="fpt-card-btn" onclick="selectPlan('FPT SpeedX10 Pro Lite')">Đăng ký ngay</button>
                </div>
              </article>
`;

if (!bangGiaHtml.includes('FPT SpeedX2 Pro Lite')) {
  bangGiaHtml = bangGiaHtml.replace(
    '<!-- Card 2: FPT SpeedX10 Pro -->',
    speedXProLiteCards + '              <!-- Card 2: FPT SpeedX10 Pro -->'
  );
}

// Update FPT SpeedX10 Pro price from 1.690.000 to 1.699.000
bangGiaHtml = bangGiaHtml.replace(
  /<h3 class="fpt-card-title">FPT SpeedX10 Pro<\/h3>\s*<div class="fpt-price-row">\s*<span class="fpt-price-val">1\.690\.000đ<\/span>/g,
  '<h3 class="fpt-card-title">FPT SpeedX10 Pro</h3>\n                  <div class="fpt-price-row">\n                    <span class="fpt-price-val">1.699.000đ</span>'
);

// Add Combo FGame Lite Series in Section 3
const fGameLiteCards = `            <!-- Card: Combo F-Game Lite -->
            <article class="fpt-card scroll-animate">
              <div class="fpt-card-banner">
                <img
                  src="../assets/images/packages/combo-fgame-lite.jpg"
                  alt="Combo F-Game Lite FPT"
                  width="400"
                  height="250"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="fpt-card-body">
                <h3 class="fpt-card-title">Combo F-Game Lite</h3>
                <div class="fpt-price-row">
                  <span class="fpt-price-val">280.000đ</span>
                  <span class="fpt-price-unit">/tháng</span>
                  <span class="fpt-info-tip" title="Game Ultra Fast + Gần 120 kênh FPT Play">ⓘ</span>
                </div>
                <div class="fpt-speed-box">
                  <div class="fpt-speed-info">
                    <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                    <span class="fpt-speed-val">↓ 1 Gbps ↑ 300 Mbps</span>
                  </div>
                  <div class="fpt-speed-icon">
                    <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                      <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                      <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="0"/>
                      <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                      <line x1="18" y1="24" x2="27" y2="21" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <ul class="fpt-card-features">
                  <li><span class="fpt-check-icon">✓</span> Tích hợp Ultra Fast tối ưu 50+ tựa game</li>
                  <li><span class="fpt-check-icon">✓</span> Trang bị Modem Wi-Fi 6 tốc độ 1Gbps</li>
                  <li><span class="fpt-check-icon">✓</span> Xem gần 120 kênh truyền hình đặc sắc</li>
                </ul>
                <button type="button" class="fpt-card-btn" onclick="selectPlan('Combo F-Game Lite')">Đăng ký ngay</button>
              </div>
            </article>

            <!-- Card: Combo F-Game F1 Lite -->
            <article class="fpt-card scroll-animate">
              <div class="fpt-card-banner">
                <img
                  src="../assets/images/packages/combo-fgame-f1-lite.jpg"
                  alt="Combo F-Game F1 Lite FPT"
                  width="400"
                  height="250"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="fpt-card-body">
                <h3 class="fpt-card-title">Combo F-Game F1 Lite</h3>
                <div class="fpt-price-row">
                  <span class="fpt-price-val">290.000đ</span>
                  <span class="fpt-price-unit">/tháng</span>
                  <span class="fpt-info-tip" title="Game Ultra Fast + Modem Wi-Fi 6 + 1 Access Point">ⓘ</span>
                </div>
                <div class="fpt-speed-box">
                  <div class="fpt-speed-info">
                    <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                    <span class="fpt-speed-val">↓ 1 Gbps ↑ 300 Mbps</span>
                  </div>
                  <div class="fpt-speed-icon">
                    <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                      <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                      <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="0"/>
                      <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                      <line x1="18" y1="24" x2="27" y2="21" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <ul class="fpt-card-features">
                  <li><span class="fpt-check-icon">✓</span> Tích hợp Ultra Fast chống lag, giảm ping 16ms</li>
                  <li><span class="fpt-check-icon">✓</span> Modem Wi-Fi 6 + 01 Access Point mở rộng sóng</li>
                  <li><span class="fpt-check-icon">✓</span> Xem gần 120 kênh truyền hình thể thao & giải trí</li>
                </ul>
                <button type="button" class="fpt-card-btn" onclick="selectPlan('Combo F-Game F1 Lite')">Đăng ký ngay</button>
              </div>
            </article>
`;

if (!bangGiaHtml.includes('Combo F-Game Lite')) {
  bangGiaHtml = bangGiaHtml.replace(
    '<!-- Card 3: F-Game F1 -->',
    fGameLiteCards + '            <!-- Card 3: F-Game F1 -->'
  );
}

// Add Section for Camera An Tâm 7 & Gói Gia Đình Fx
const anTam7Section = `          <!-- SECTION: GÓI COMBO CAMERA AN TÂM 7 & SMART HOME -->
          <div
            class="fpt-section-header scroll-animate"
            style="margin-top: 20px"
          >
            <div id="camera"></div>
            <div id="an-tam-7"></div>
            <h2>Gói Combo Camera An Tâm 7 - Bảo mật toàn diện cho gia đình</h2>
            <p>
              Tốc độ 1 Gbps trang bị Modem Wi-Fi 6 thế hệ mới, tặng miễn phí Camera thông minh cùng gói lưu trữ Cloud An Tâm an toàn trọn đời.
            </p>
          </div>

          <div class="fpt-slider-container">
            <button
              type="button"
              class="fpt-slider-btn prev"
              aria-label="Gói trước"
              onclick="slideSection('slider-track-antam', -1)"
            >
              ❮
            </button>

            <div class="fpt-slider-track" id="slider-track-antam">
              <!-- Card: Sky An Tâm 7 - Play4 -->
              <article class="fpt-card scroll-animate">
                <div class="fpt-card-banner">
                  <img
                    src="../assets/images/packages/sky-an-tam-7-play4.jpg"
                    alt="Sky An Tâm 7 - Play4 Camera Trong Nhà"
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                  />
                  <div style="position: absolute; top: 10px; right: 10px; background: #0284c7; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">TẶNG CAM TRONG NHÀ</div>
                </div>
                <div class="fpt-card-body">
                  <h3 class="fpt-card-title">Sky An Tâm 7 - Play4</h3>
                  <div class="fpt-price-row">
                    <span class="fpt-price-val">225.000đ</span>
                    <span class="fpt-price-unit">/tháng</span>
                    <span class="fpt-info-tip" title="Đã gồm sẵn lưu trữ Cloud An Tâm 7 ngày">ⓘ</span>
                  </div>
                  <div class="fpt-speed-box">
                    <div class="fpt-speed-info">
                      <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                      <span class="fpt-speed-val">↓ 1 Gbps ↑ 300 Mbps</span>
                    </div>
                    <div class="fpt-speed-icon">
                      <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="16.5"/>
                        <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                        <line x1="18" y1="24" x2="22" y2="14" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="fpt-card-features">
                    <li><span class="fpt-check-icon">✓</span> Tặng 01 FPT Camera Play4 xoay 360 độ</li>
                    <li><span class="fpt-check-icon">✓</span> Đã bao gồm gói Cloud An Tâm (không thu thêm phí cloud)</li>
                    <li><span class="fpt-check-icon">✓</span> Modem Wi-Fi 6 tốc độ cao, hỗ trợ 25+ thiết bị</li>
                  </ul>
                  <button type="button" class="fpt-card-btn" onclick="selectPlan('Sky An Tâm 7 - Play4')">Đăng ký ngay</button>
                </div>
              </article>

              <!-- Card: Sky An Tâm 7 - IQ4S -->
              <article class="fpt-card scroll-animate">
                <div class="fpt-card-banner">
                  <img
                    src="../assets/images/packages/sky-an-tam-7-play4s.jpg"
                    alt="Sky An Tâm 7 - IQ4S Camera Ngoài Trời"
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                  />
                  <div style="position: absolute; top: 10px; right: 10px; background: #059669; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">TẶNG CAM NGOÀI TRỜI</div>
                </div>
                <div class="fpt-card-body">
                  <h3 class="fpt-card-title">Sky An Tâm 7 - IQ4S</h3>
                  <div class="fpt-price-row">
                    <span class="fpt-price-val">225.000đ</span>
                    <span class="fpt-price-unit">/tháng</span>
                    <span class="fpt-info-tip" title="Đã gồm sẵn lưu trữ Cloud An Tâm 7 ngày">ⓘ</span>
                  </div>
                  <div class="fpt-speed-box">
                    <div class="fpt-speed-info">
                      <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                      <span class="fpt-speed-val">↓ 1 Gbps ↑ 300 Mbps</span>
                    </div>
                    <div class="fpt-speed-icon">
                      <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="16.5"/>
                        <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                        <line x1="18" y1="24" x2="22" y2="14" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="fpt-card-features">
                    <li><span class="fpt-check-icon">✓</span> Tặng 01 FPT Camera IQ4S ngoài trời chống nước IP67</li>
                    <li><span class="fpt-check-icon">✓</span> Đã bao gồm gói Cloud An Tâm (không thu thêm phí cloud)</li>
                    <li><span class="fpt-check-icon">✓</span> Modem Wi-Fi 6 tốc độ cao, AI nhận diện khuôn mặt</li>
                  </ul>
                  <button type="button" class="fpt-card-btn" onclick="selectPlan('Sky An Tâm 7 - IQ4S')">Đăng ký ngay</button>
                </div>
              </article>

              <!-- Card: Sky F1 An Tâm 7 - Play4 -->
              <article class="fpt-card scroll-animate">
                <div class="fpt-card-banner">
                  <img
                    src="../assets/images/packages/sky-f1-an-tam-7-play4.jpg"
                    alt="Sky F1 An Tâm 7 - Play4"
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="fpt-card-body">
                  <h3 class="fpt-card-title">Sky F1 An Tâm 7</h3>
                  <div class="fpt-price-row">
                    <span class="fpt-price-val">245.000đ</span>
                    <span class="fpt-price-unit">/tháng</span>
                    <span class="fpt-info-tip" title="Modem Wi-Fi 6 + 1 Access Point + Camera Cloud">ⓘ</span>
                  </div>
                  <div class="fpt-speed-box">
                    <div class="fpt-speed-info">
                      <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                      <span class="fpt-speed-val">↓ 1 Gbps ↑ 300 Mbps</span>
                    </div>
                    <div class="fpt-speed-icon">
                      <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="16.5"/>
                        <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                        <line x1="18" y1="24" x2="22" y2="14" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="fpt-card-features">
                    <li><span class="fpt-check-icon">✓</span> Tặng 01 FPT Camera AI và Cloud lưu trữ an toàn</li>
                    <li><span class="fpt-check-icon">✓</span> Trang bị Modem Wi-Fi 6 + 01 Access Point mở rộng sóng</li>
                    <li><span class="fpt-check-icon">✓</span> Phủ sóng thông minh nhà nhiều tầng hoặc diện tích lớn</li>
                  </ul>
                  <button type="button" class="fpt-card-btn" onclick="selectPlan('Sky F1 An Tâm 7')">Đăng ký ngay</button>
                </div>
              </article>

              <!-- Card: Sky F2 An Tâm 7 -->
              <article class="fpt-card scroll-animate">
                <div class="fpt-card-banner">
                  <img
                    src="../assets/images/packages/sky-f2-an-tam-7-play4.jpg"
                    alt="Sky F2 An Tâm 7"
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="fpt-card-body">
                  <h3 class="fpt-card-title">Sky F2 An Tâm 7</h3>
                  <div class="fpt-price-row">
                    <span class="fpt-price-val">265.000đ</span>
                    <span class="fpt-price-unit">/tháng</span>
                    <span class="fpt-info-tip" title="Modem Wi-Fi 6 + 2 Access Point + Camera Cloud">ⓘ</span>
                  </div>
                  <div class="fpt-speed-box">
                    <div class="fpt-speed-info">
                      <span class="fpt-speed-label">Tốc độ (Download/ Upload)</span>
                      <span class="fpt-speed-val">↓ 1 Gbps ↑ 300 Mbps</span>
                    </div>
                    <div class="fpt-speed-icon">
                      <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M 6 24 A 12 12 0 0 1 30 24" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="37.7" stroke-dashoffset="16.5"/>
                        <circle cx="18" cy="24" r="2.5" fill="#0f172a" />
                        <line x1="18" y1="24" x2="22" y2="14" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="fpt-card-features">
                    <li><span class="fpt-check-icon">✓</span> Tặng 01 FPT Camera AI thông minh và Cloud trọn gói</li>
                    <li><span class="fpt-check-icon">✓</span> Modem Wi-Fi 6 + 02 Access Point phụ mở rộng vùng phủ</li>
                    <li><span class="fpt-check-icon">✓</span> Lựa chọn hoàn hảo cho nhà 2-3 tầng, biệt thự, nhà phố</li>
                  </ul>
                  <button type="button" class="fpt-card-btn" onclick="selectPlan('Sky F2 An Tâm 7')">Đăng ký ngay</button>
                </div>
              </article>
            </div>

            <button
              type="button"
              class="fpt-slider-btn next"
              aria-label="Gói kế tiếp"
              onclick="slideSection('slider-track-antam', 1)"
            >
              ❯
            </button>
          </div>
`;

if (!bangGiaHtml.includes('id="slider-track-antam"')) {
  bangGiaHtml = bangGiaHtml.replace(
    '<!-- SECTION 5: INTERNET FPT WIFI 6 DOANH NGHIỆP -->',
    anTam7Section + '\n          <!-- SECTION 5: INTERNET FPT WIFI 6 DOANH NGHIỆP -->'
  );
}

fs.writeFileSync(bangGiaPath, bangGiaHtml, 'utf8');
console.log('pages/bang-gia.html updated successfully with images and new packages.');

// 2. Update index.html pricing section with card images and 2026 pricing
const indexPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const oldPricingGrid = `<div class="package-grid">
          <!-- Gói 1: Giga -->
          <div class="package fade-up delay-100">
            <div class="pkg-header">
              <h3>Giga</h3>
              <p>300 Mbps</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 195.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li><span class="check">✓</span> Phù hợp gia đình nhỏ</li>
              <li><span class="check">✓</span> Trang bị Modem Wi-Fi 6</li>
              <li><span class="check">✓</span> Lắp đặt miễn phí 24h</li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-blue">Đăng ký ngay</a>
          </div>

          <!-- Gói 2: Giga VVIP -->
          <div class="package fade-up delay-150">
            <div
              class="badge"
              style="background: linear-gradient(135deg, #0ea5e9, #0284c7)"
            >
              Ưu đãi VVIP
            </div>
            <div class="pkg-header">
              <h3>Giga VVIP</h3>
              <p>300 Mbps + FPT Play VIP</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 205.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li>
                <span class="check">✓</span> Xem Ngoại hạng Anh 4K sắc nét
              </li>
              <li>
                <span class="check">✓</span> Trang bị Modem Wi-Fi 6 + Box TV
              </li>
              <li>
                <span class="check">✓</span> Tặng Camera AI + Cloud 12 tháng
              </li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-blue">Đăng ký ngay</a>
          </div>

          <!-- Gói 3: Sky -->
          <div class="package popular fade-up delay-200">
            <div class="badge">Bán chạy nhất</div>
            <div class="pkg-header">
              <h3>Sky</h3>
              <p>1 Gbps / 300 Mbps</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 225.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li><span class="check">✓</span> Chơi game, Stream mượt mà</li>
              <li><span class="check">✓</span> Trang bị Modem Wi-Fi 6 Plus</li>
              <li><span class="check">✓</span> Lắp đặt miễn phí 24h</li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-orange">Đăng ký ngay</a>
          </div>

          <!-- Gói 4: Meta -->
          <div class="package fade-up delay-300">
            <div class="pkg-header">
              <h3>Meta</h3>
              <p>1 Gbps Không Giới Hạn</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 325.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li>
                <span class="check">✓</span> Trải nghiệm đỉnh cao, Streamer
              </li>
              <li>
                <span class="check">✓</span> Trang bị Router Wi-Fi 6 2 Băng Tần
              </li>
              <li><span class="check">✓</span> Ưu tiên băng thông quốc tế</li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-blue">Đăng ký ngay</a>
          </div>
        </div>`;

const newPricingGrid = `<div class="package-grid">
          <!-- Gói 1: Giga -->
          <div class="package fade-up delay-100">
            <div class="pkg-img-wrap" style="border-radius: 8px; overflow: hidden; margin-bottom: 14px;">
              <img
                src="assets/images/packages/internetgiga.jpg"
                alt="Internet Giga FPT 300Mbps"
                width="400"
                height="250"
                loading="lazy"
                decoding="async"
                style="width: 100%; height: auto; display: block; border-radius: 8px;"
              />
            </div>
            <div class="pkg-header">
              <h3>Giga</h3>
              <p>300 Mbps</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 195.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li><span class="check">✓</span> Phù hợp gia đình nhỏ, cá nhân</li>
              <li><span class="check">✓</span> Trang bị Modem Wi-Fi 6 hai băng tần</li>
              <li><span class="check">✓</span> Miễn phí lắp đặt, tặng Voucher 200k</li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-blue">Đăng ký ngay</a>
          </div>

          <!-- Gói 2: Combo Giga V.VIP -->
          <div class="package fade-up delay-150">
            <div
              class="badge"
              style="background: linear-gradient(135deg, #0ea5e9, #0284c7)"
            >
              Ưu đãi VVIP
            </div>
            <div class="pkg-img-wrap" style="border-radius: 8px; overflow: hidden; margin-bottom: 14px;">
              <img
                src="assets/images/packages/combo-giga-vvip.jpg"
                alt="Combo Giga V.VIP FPT Ngoại Hạng Anh"
                width="400"
                height="250"
                loading="lazy"
                decoding="async"
                style="width: 100%; height: auto; display: block; border-radius: 8px;"
              />
            </div>
            <div class="pkg-header">
              <h3>Giga V.VIP</h3>
              <p>300 Mbps + FPT Play V.VIP</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 220.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li>
                <span class="check">✓</span> Xem trọn vẹn Ngoại hạng Anh 4K sắc nét
              </li>
              <li>
                <span class="check">✓</span> Trang bị Modem Wi-Fi 6 + FPT Play
              </li>
              <li>
                <span class="check">✓</span> Tặng Camera AI chính hãng + Miễn phí công lắp
              </li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-blue">Đăng ký ngay</a>
          </div>

          <!-- Gói 3: Sky -->
          <div class="package popular fade-up delay-200">
            <div class="badge">Bán chạy nhất</div>
            <div class="pkg-img-wrap" style="border-radius: 8px; overflow: hidden; margin-bottom: 14px;">
              <img
                src="assets/images/packages/internetsky.jpg"
                alt="Internet Sky FPT 1Gbps"
                width="400"
                height="250"
                loading="lazy"
                decoding="async"
                style="width: 100%; height: auto; display: block; border-radius: 8px;"
              />
            </div>
            <div class="pkg-header">
              <h3>Sky</h3>
              <p>1 Gbps / 300 Mbps</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 195.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li><span class="check">✓</span> Chơi game, Stream mượt mà đỉnh cao</li>
              <li><span class="check">✓</span> Trang bị Modem Wi-Fi 6 Plus siêu khỏe</li>
              <li><span class="check">✓</span> Miễn phí lắp đặt, triển khai siêu tốc</li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-orange">Đăng ký ngay</a>
          </div>

          <!-- Gói 4: Meta -->
          <div class="package fade-up delay-300">
            <div class="pkg-img-wrap" style="border-radius: 8px; overflow: hidden; margin-bottom: 14px;">
              <img
                src="assets/images/packages/combo-meta.jpg"
                alt="Internet Meta FPT 1Gbps Đối Xứng"
                width="400"
                height="250"
                loading="lazy"
                decoding="async"
                style="width: 100%; height: auto; display: block; border-radius: 8px;"
              />
            </div>
            <div class="pkg-header">
              <h3>Meta</h3>
              <p>1 Gbps Đối Xứng</p>
            </div>
            <div class="pkg-price">
              <div class="price">Từ 300.000đ<span>/tháng</span></div>
            </div>
            <ul class="pkg-features">
              <li>
                <span class="check">✓</span> Băng thông đối xứng 1Gbps/1Gbps cực mạnh
              </li>
              <li>
                <span class="check">✓</span> Tặng Camera AI + Cloud hoặc Giảm 50k trả sau
              </li>
              <li><span class="check">✓</span> Ưu tiên băng thông quốc tế không giới hạn</li>
            </ul>
            <a href="pages/lien-he.html" class="btn btn-blue">Đăng ký ngay</a>
          </div>
        </div>`;

if (indexHtml.includes(oldPricingGrid)) {
  indexHtml = indexHtml.replace(oldPricingGrid, newPricingGrid);
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('index.html updated successfully with images and 2026 pricing.');
} else {
  console.log('Could not find exact oldPricingGrid in index.html, checking fuzzy match...');
}
