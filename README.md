# FPT Telecom - Trợ lý ảo & Live Chat (Hybrid AI)

Dự án này là một hệ thống chatbot thông minh kết hợp giữa **Trợ lý ảo AI (LLaMA 3.3)** và **Live Chat trực tiếp qua Telegram**, được xây dựng trên nền tảng **Cloudflare Workers**, **Cloudflare D1**, và **Cloudflare Workers AI**.

## 🌟 Tính năng nổi bật
1. **Hybrid AI Chat**: Tự động trả lời khách hàng bằng AI dựa trên model LLaMA 3.3 mới nhất. Khách hàng cũng có thể yêu cầu gặp nhân viên trực tiếp (Live Chat).
2. **Quản lý qua Telegram**: Khi khách hàng cần hỗ trợ, hệ thống tự động bắn thông báo về Telegram. Admin có thể trực tiếp *Reply* ngay trong Telegram để chat với khách trên website.
3. **Lưu trữ dữ liệu an toàn**: Lịch sử chat được lưu trong CSDL Cloudflare D1. Dữ liệu nhạy cảm (PII) như Email và Số điện thoại của khách tự động được làm mờ (Masking) trước khi lưu để đảm bảo quyền riêng tư.
4. **Tốc độ cao & Serverless**: Hoạt động hoàn toàn trên edge network của Cloudflare, độ trễ cực thấp, không cần quản lý máy chủ.

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

### 1. Yêu cầu hệ thống
- Có tài khoản **Cloudflare**.
- Cài đặt **Node.js** trên máy tính.
- Cài đặt công cụ Wrangler CLI:
  ```bash
  npm install -g wrangler
  ```

### 2. Đăng nhập vào Cloudflare
Mở terminal và chạy lệnh sau để kết nối Wrangler với tài khoản Cloudflare của bạn:
```bash
wrangler login
```

### 3. Thiết lập Database (Cloudflare D1)
Tạo một database mới với tên `chat_db`:
```bash
wrangler d1 create chat_db
```
Sau khi tạo xong, terminal sẽ trả về một bảng cấu hình. Bạn hãy copy phần cấu hình đó (đặc biệt là `database_id`) và dán/ghi đè vào file `wrangler.toml` trong dự án:
```toml
[[d1_databases]]
binding = "DB"
database_name = "chat_db"
database_id = "ID_MỚI_CỦA_BẠN"
```

### 4. Thiết lập các biến bảo mật (Secrets)
Dự án yêu cầu 3 biến bảo mật (Secrets). Bạn chạy lần lượt các lệnh sau và nhập giá trị tương ứng vào terminal:

- **ADMIN_TOKEN**: Mật khẩu để gọi các API quản trị (`/_migrate`, `/_setup-telegram`). Bạn có thể tự bịa một chuỗi bảo mật bất kỳ.
  ```bash
  wrangler secret put ADMIN_TOKEN
  ```
- **TELEGRAM_BOT_TOKEN**: Lấy từ [BotFather](https://t.me/BotFather) khi tạo bot Telegram.
  ```bash
  wrangler secret put TELEGRAM_BOT_TOKEN
  ```
- **TELEGRAM_CHAT_ID**: ID của group chat hoặc ID cá nhân Telegram của bạn (Nơi bot sẽ gửi tin nhắn đến).
  ```bash
  wrangler secret put TELEGRAM_CHAT_ID
  ```

### 5. Triển khai (Deploy) dự án
Chạy lệnh sau để đưa code lên Cloudflare Workers:
```bash
wrangler deploy
```
Sau khi deploy thành công, Wrangler sẽ cung cấp cho bạn một **URL (Ví dụ: https://man-chatbot.your-subdomain.workers.dev)**.

### 6. Khởi tạo Database và kết nối Telegram Webhook
Sau khi đã có URL ứng dụng, bạn cần sử dụng một công cụ gửi request (như **Postman**, **cURL** hoặc app **Thunder Client**) để thực hiện 2 thao tác 1 lần duy nhất:

**Bước 6.1: Tạo bảng trong Database**
- **Method:** `GET`
- **URL:** `https://[URL_CỦA_BẠN]/api/_migrate`
- **Headers:** 
  - `Authorization`: `Bearer [ADMIN_TOKEN_CỦA_BẠN]`

**Bước 6.2: Gắn Webhook Telegram**
- **Method:** `POST`
- **URL:** `https://[URL_CỦA_BẠN]/_setup-telegram`
- **Headers:** 
  - `Authorization`: `Bearer [ADMIN_TOKEN_CỦA_BẠN]`

Nếu request trả về `{"ok":true}`, dự án của bạn đã sẵn sàng hoạt động!

---

## 💡 Cấu trúc dự án
- `index.html`, `styles.css`, `script.js`: Giao diện trang chủ và cửa sổ Chat.
- `src/index.js`: Mã nguồn Backend (Cloudflare Worker). Xử lý AI, Database, Rate Limit và Webhook Telegram.
- `wrangler.toml`: File cấu hình Cloudflare.
- `push_code.bat`: Script hỗ trợ đẩy code nhanh lên GitHub.

## 🔒 Về bảo mật
- Hệ thống có giới hạn tốc độ (Rate Limit) chống spam.
- Mã hóa chống cào dữ liệu HTML.
- **Data Masking**: Tự động mã hóa email và số điện thoại của người dùng trước khi lưu trữ (Loại trừ các SĐT hotline: 0358513269, 0358513269).


Để chạy dự án và đẩy code lên Git, anh chỉ cần thực hiện các câu lệnh sau trực tiếp trong Terminal của dự án:

.\push_code.bat
npx wrangler deploy
