/**
 * ==============================================================================
 * GOOGLE INDEXING API AUTOMATION SCRIPT (Node.js)
 * Tự động gửi thông báo URL_UPDATED tới Google Indexing API v3
 * Giúp Googlebot thu thập dữ liệu và lập chỉ mục URL ngay lập tức (< 1 - 24 giờ)
 * ==============================================================================
 *
 * Hướng dẫn sử dụng:
 * 1. Chế độ kiểm tra (Dry-run không gửi thật):
 *    node scripts/google_indexing_api.js --dry-run
 * 2. Ping các URL mới sinh hoặc có cập nhật:
 *    node scripts/google_indexing_api.js --new
 * 3. Ping toàn bộ sitemap (tối đa hạn mức 200 URLs/ngày của Google):
 *    node scripts/google_indexing_api.js --all
 * 4. Ping 1 URL cụ thể:
 *    node scripts/google_indexing_api.js --url https://fpttelecomvn.click/pages/topics/lap-mang-fpt-cho-sinh-vien-gia-re.html
 * ==============================================================================
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname, "..");
const SITEMAP_PATH = path.join(ROOT_DIR, "sitemap.xml");
const LOG_PATH = path.join(ROOT_DIR, "data", "indexing_logs.json");
const CREDENTIALS_PATH = path.join(ROOT_DIR, "service_account.json");

const GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";
const GOOGLE_INDEXING_ENDPOINT =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";
const MAX_DAILY_QUOTA = 200; // Hạn mức mặc định của Google Indexing API

// Base64URL encoding helper
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Tạo Signed JWT cho Google Service Account (Zero external npm dependency)
function createGoogleJwt(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: GOOGLE_TOKEN_URI,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  const signature = signer.sign(privateKey, "base64");
  const encodedSignature = signature
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${signatureInput}.${encodedSignature}`;
}

// Lấy Access Token từ Google OAuth2
async function getAccessToken(credentials) {
  const jwt = createGoogleJwt(
    credentials.client_email,
    credentials.private_key,
  );

  const res = await fetch(GOOGLE_TOKEN_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth2 Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

// Bắn thông báo URL_UPDATED tới Google Indexing API
async function publishUrlNotification(url, accessToken, action = "URL_UPDATED") {
  const res = await fetch(GOOGLE_INDEXING_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      url: url,
      type: action,
    }),
  });

  const responseText = await res.text();
  let responseJson = {};
  try {
    responseJson = JSON.parse(responseText);
  } catch (e) {
    responseJson = { raw: responseText };
  }

  return {
    status: res.status,
    ok: res.ok,
    data: responseJson,
  };
}

// Đọc danh sách URLs từ sitemap.xml
function extractUrlsFromSitemap() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    throw new Error(`Không tìm thấy sitemap.xml tại ${SITEMAP_PATH}`);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const urlMatches = sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g);
  const urls = [];
  for (const match of urlMatches) {
    urls.push(match[1].trim());
  }
  return urls;
}

// Đọc và ghi log
function loadIndexingLogs() {
  if (fs.existsSync(LOG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveIndexingLogs(logs) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), "utf8");
}

// Lấy thông tin Service Account
function getCredentials() {
  // Ưu tiên biến môi trường (CI/CD GitHub Actions)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim() !== "") {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      throw new Error("Biến môi trường GOOGLE_SERVICE_ACCOUNT_KEY không đúng định dạng JSON.");
    }
  }

  if (process.env.GOOGLE_INDEXING_CREDENTIALS && process.env.GOOGLE_INDEXING_CREDENTIALS.trim() !== "") {
    try {
      return JSON.parse(process.env.GOOGLE_INDEXING_CREDENTIALS);
    } catch (e) {
      throw new Error("Biến môi trường GOOGLE_INDEXING_CREDENTIALS không đúng định dạng JSON.");
    }
  }

  // Đọc từ file cục bộ
  if (fs.existsSync(CREDENTIALS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    } catch (e) {
      throw new Error(`Lỗi đọc file ${CREDENTIALS_PATH}: ${e.message}`);
    }
  }

  return null;
}

// Delay giữa các request để tránh rate limit
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isAll = args.includes("--all");
  const isNewOnly = args.includes("--new") || (!isAll && !args.includes("--url"));
  const urlArgIndex = args.indexOf("--url");
  const singleUrl = urlArgIndex !== -1 ? args[urlArgIndex + 1] : null;

  console.log("==========================================================");
  console.log("🚀 GOOGLE INDEXING API AUTOMATION ENGINE (v3)");
  console.log("==========================================================\n");

  const credentials = getCredentials();

  if (!credentials && !isDryRun) {
    console.warn("⚠️  CẢNH BÁO: Chưa tìm thấy Google Service Account Credentials!");
    console.warn("👉 Để gửi yêu cầu thật tới Google, vui lòng:");
    console.warn("   1. Đặt file 'service_account.json' tại thư mục gốc của dự án, HOẶC");
    console.warn("   2. Cài đặt biến môi trường 'GOOGLE_SERVICE_ACCOUNT_KEY'.");
    console.warn("👉 Xem chi tiết tại: HD-CAI-DAT-GOOGLE-INDEXING-API.md\n");
    console.log("ℹ️  Đang chuyển sang chế độ Mô phỏng (Simulated Dry-run)...\n");
  }

  const logs = loadIndexingLogs();
  const loggedUrlMap = new Map(logs.map((item) => [item.url, item]));

  let targetUrls = [];

  if (singleUrl) {
    targetUrls = [singleUrl];
    console.log(`🎯 Chế độ: Ping 1 URL đơn lẻ -> ${singleUrl}`);
  } else {
    const allSitemapUrls = extractUrlsFromSitemap();
    console.log(`🗺️  Tổng số URL trong sitemap.xml: ${allSitemapUrls.length}`);

    if (isNewOnly) {
      targetUrls = allSitemapUrls.filter((url) => !loggedUrlMap.has(url));
      console.log(`✨ Chế độ: Chỉ ping URLs MỚI chưa được index -> ${targetUrls.length} URLs`);
    } else {
      targetUrls = allSitemapUrls.slice(0, MAX_DAILY_QUOTA);
      console.log(`🌐 Chế độ: Ping toàn bộ sitemap (giới hạn quota ${MAX_DAILY_QUOTA}/ngày) -> ${targetUrls.length} URLs`);
    }
  }

  if (targetUrls.length === 0) {
    console.log("\n✅ Tất cả URLs trong sitemap đã được gửi lên Google Indexing API trước đó. Không có URL mới!");
    return;
  }

  let accessToken = null;
  if (credentials && !isDryRun) {
    try {
      console.log("🔑 Đang tạo chữ ký JWT và xác thực Google Service Account...");
      accessToken = await getAccessToken(credentials);
      console.log("✅ Xác thực Google OAuth2 thành công! Bắt đầu gửi URLs...\n");
    } catch (authErr) {
      console.error(`❌ Lỗi xác thực Google: ${authErr.message}`);
      return;
    }
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    const indexNum = `[${i + 1}/${targetUrls.length}]`;

    if (isDryRun || !credentials) {
      console.log(`🧪 ${indexNum} [DRY-RUN] Sẵn sàng ping URL: ${url}`);
      // Cập nhật log mô phỏng
      loggedUrlMap.set(url, {
        url: url,
        last_notified: new Date().toISOString(),
        status: "SIMULATED_200_OK",
      });
      successCount++;
      await sleep(100);
      continue;
    }

    try {
      const result = await publishUrlNotification(url, accessToken, "URL_UPDATED");

      if (result.ok) {
        console.log(`✅ ${indexNum} OK (200) -> ${url}`);
        loggedUrlMap.set(url, {
          url: url,
          last_notified: new Date().toISOString(),
          status: "200_OK",
          notifyTime: result.data?.urlNotificationMetadata?.notifyTime || new Date().toISOString(),
        });
        successCount++;
      } else {
        console.error(`❌ ${indexNum} Lỗi HTTP (${result.status}) khi gửi ${url}`);
        errorCount++;
      }
    } catch (err) {
      console.error(`❌ ${indexNum} Lỗi kết nối khi gửi ${url}`);
      errorCount++;
    }

    // Rate-limiting delay 300ms giữa các request
    await sleep(300);
  }

  // Lưu lại log cập nhật
  const updatedLogs = Array.from(loggedUrlMap.values());
  saveIndexingLogs(updatedLogs);

  console.log("\n==========================================================");
  console.log(`🎉 BÁO CÁO KẾT QUẢ:`);
  console.log(`- Thành công: ${successCount} URLs`);
  console.log(`- Thất bại: ${errorCount} URLs`);
  console.log(`- Lịch sử đã ghi nhận: ${updatedLogs.length} URLs tại data/indexing_logs.json`);
  console.log("==========================================================");
}

main().catch((e) => console.error("Lỗi chương trình:", e));
