# 📋 HƯỚNG DẪN CÀI ĐẶT LƯU LEAD GOOGLE SHEET & BÁO EMAIL TỨC THÌ

Hệ thống đã được lập trình sẵn để tự động bắt thông tin khi khách bấm **"Đăng ký ngay"** ở bất kỳ gói cước nào, sau đó gửi thẳng về **Google Sheet** và **Email `tvm19624@gmail.com`** tức thì.

---

## 🚀 Cấu hình hiện tại của hệ thống:

- **Email nhận thông báo:** `tvm19624@gmail.com`
- **Hotline liên hệ trên email & web:** `0358 513 269`
- **Google Apps Script Web App Endpoint:**
  ```text
  https://script.google.com/macros/s/AKfycbwvkgJ0GpdzEwh6Us5AFJ8uUlwuO3paCxqhSY8JhAzWur3Ws6KIuLxlrPN4-lqtBDeO/exec
  ```

---

## 🔧 Hướng dẫn cập nhật mã Google Apps Script (Nếu cần chỉnh sửa):

### Bước 1: Mở Google Sheet
1. Mở trang tính Google Sheet của bạn (ví dụ: `FPT Telecom - Khách Hàng 2026`).
2. Trên thanh công cụ, chọn: **Tiện ích mở rộng** *(Extensions)* ➔ **Apps Script**.

### Bước 2: Dán mã mới nhất
1. Mở tệp [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) trong kho lưu trữ này.
2. Sao chép toàn bộ nội dung và dán thay thế mã trong trình soạn thảo Apps Script.
3. Kiểm tra biến email ở đầu tệp:
   ```javascript
   var NOTIFY_EMAIL = "tvm19624@gmail.com";
   ```
4. Nhấn **Lưu** 💾 *(Ctrl + S)*.

### Bước 3: Triển khai lại phiên bản mới (Nếu có chỉnh sửa code trên Sheet)
1. Nhấn nút xanh **Triển khai** *(Deploy)* ở góc trên bên phải ➔ Chọn **Quản lý phiên bản triển khai** *(Manage deployments)*.
2. Nhấn biểu tượng cây bút ✏️ (Chỉnh sửa) ở bản triển khai hiện tại.
3. Tại mục **Phiên bản** *(Version)*, chọn **Phiên bản mới** *(New version)*.
4. Đảm bảo:
   - **Thực thi dưới dạng** *(Execute as)*: `Tôi (địa chỉ email của bạn)`
   - **Ai có quyền truy cập** *(Who has access)*: `Bất kỳ ai (Anyone)` ⚠️ *(Bắt buộc)*
5. Nhấn **Triển khai** *(Deploy)*.

---

## 🎯 Kết quả hoạt động:
1. **Google Sheet**: Tự động lưu: *STT, Thời gian, Họ tên, Số điện thoại (giữ nguyên số 0 đầu), Địa chỉ, Gói cước, Ghi chú / Nhu cầu, Thời gian hẹn gọi, Tọa độ GPS, Trang gửi form, Trạng thái*.
2. **Email thông báo**: Nhận ngay 1 email HTML sang trọng màu cam FPT, kèm nút **"📞 GỌI ĐIỆN NGAY"** và **"💬 NHẮN ZALO"** giúp bạn liên hệ khách hàng ngay lập tức khi họ vừa gửi form.
