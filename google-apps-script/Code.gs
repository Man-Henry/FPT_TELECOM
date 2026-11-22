/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: TỰ ĐỘNG LƯU KHÁCH HÀNG VÀO GOOGLE SHEET & GỬI EMAIL
 * =========================================================================
 * Dự án: Website FPT Telecom (https://fpttelecomvn.click/)
 * Email nhận thông báo tức thì: tvm19624@gmail.com
 * Hotline kinh doanh: 0358 513 269
 * =========================================================================
 */

// Cấu hình email nhận thông báo khi có khách hàng đăng ký mới
var NOTIFY_EMAIL = "tvm19624@gmail.com";

// Tên Sheet lưu trữ danh sách khách hàng
var SHEET_NAME = "Khách Hàng Đăng Ký";

/**
 * Xử lý GET request (Dùng để kiểm tra trạng thái hoạt động của Web App)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "ok",
      message: "Google Apps Script Web App FPT Telecom đang hoạt động bình thường!",
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý POST request khi khách hàng gửi Form từ website
 */
function doPost(e) {
  // Sử dụng LockService để tránh xung đột dữ liệu khi nhiều người gửi cùng lúc
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Đợi tối đa 30 giây
  } catch (lockError) {
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        error: "Hệ thống đang bận xử lý yêu cầu khác, vui lòng thử lại sau giây lát!",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var sheet = getOrCreateSheet();
    var data = parseCustomerData(e);

    // Thời gian đăng ký (Múi giờ Việt Nam GMT+7)
    var timestamp = Utilities.formatDate(
      new Date(),
      "GMT+7",
      "dd/MM/yyyy HH:mm:ss"
    );

    // Tính STT
    var lastRow = sheet.getLastRow();
    var stt = lastRow >= 1 ? lastRow : 1;

    // Ghi dữ liệu vào Google Sheet
    sheet.appendRow([
      stt,
      timestamp,
      data.name,
      "'" + data.phone, // Dấu nháy đơn giữ số 0 ở đầu SĐT
      data.address,
      data.service,
      data.note,
      data.time,
      data.location,
      data.pageUrl,
      "Mới tiếp nhận",
    ]);

    // Gửi email thông báo tức thì đến tvm19624@gmail.com
    sendEmailNotification(data, timestamp);

    // Trả về kết quả JSON thành công
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        message: "Đăng ký thành công! Đã lưu thông tin và gửi thông báo.",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("Lỗi xử lý doPost: " + err.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        result: "error",
        error: err.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Trích xuất và chuẩn hóa dữ liệu từ request (hỗ trợ cả FormData, URLSearchParams và JSON)
 */
function parseCustomerData(e) {
  var p = {};

  if (e && e.parameter) {
    p = e.parameter;
  }

  // Hỗ trợ trường hợp gửi JSON body
  if (e && e.postData && e.postData.contents) {
    try {
      var json = JSON.parse(e.postData.contents);
      for (var k in json) {
        if (!p[k]) p[k] = json[k];
      }
    } catch (ignore) {}
  }

  function getField(keys, defaultVal) {
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (
        p[key] !== undefined &&
        p[key] !== null &&
        String(p[key]).trim() !== ""
      ) {
        return String(p[key]).trim();
      }
    }
    return defaultVal || "";
  }

  var name = getField(
    ["Họ Và Tên", "Họ tên", "hoTen", "name", "full_name", "fullname"],
    "Khách hàng"
  );
  var phone = getField(
    ["Số điện thoại", "sdt", "phone", "tel", "so_dien_thoai"],
    "Chưa có SĐT"
  );
  var address = getField(
    ["Địa chỉ", "Khu vực", "diaChi", "address", "diachi"],
    "Không cung cấp (Form tư vấn nhanh)"
  );
  var service = getField(
    ["Gói cước", "goiCuoc", "package", "service", "dich_vu"],
    "Yêu cầu tư vấn nhanh"
  );
  var note = getField(
    ["Ghi chú", "Nội dung hỗ trợ", "note", "message", "ghiChu"],
    "Không có"
  );
  var time = getField(
    ["Thời gian liên hệ", "thoiGian", "time", "contact_time"],
    "Gọi ngay"
  );
  var location = getField(
    ["Tọa độ", "toaDo", "location", "coords", "gps"],
    "Không xác định"
  );
  var pageUrl = getField(
    ["Trang đăng ký", "pageUrl", "url", "page", "source"],
    "https://fpttelecomvn.click/"
  );

  return {
    name: name,
    phone: phone,
    address: address,
    service: service,
    note: note,
    time: time,
    location: location,
    pageUrl: pageUrl,
  };
}

/**
 * Lấy Sheet hoặc tự động tạo mới kèm theo Header chuẩn
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Nếu Sheet hoàn toàn trống, tự tạo dòng Tiêu đề
  if (sheet.getLastRow() === 0) {
    var headers = [
      "STT",
      "Thời Gian",
      "Họ Và Tên",
      "Số Điện Thoại",
      "Địa Chỉ Lắp Đặt",
      "Gói Cước Quan Tâm",
      "Ghi Chú / Nhu Cầu",
      "Thời Gian Liên Hệ",
      "Vị Trí / Tọa Độ",
      "Trang Đăng Ký",
      "Trạng Thái",
    ];

    sheet.appendRow(headers);

    // Định dạng tiêu đề màu cam FPT (#F37021), chữ trắng in đậm
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#F37021");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 40);
    sheet.setFrozenRows(1);

    // Căn chỉnh độ rộng từng cột
    sheet.setColumnWidth(1, 60); // STT
    sheet.setColumnWidth(2, 160); // Thời gian
    sheet.setColumnWidth(3, 180); // Họ tên
    sheet.setColumnWidth(4, 140); // SĐT
    sheet.setColumnWidth(5, 260); // Địa chỉ
    sheet.setColumnWidth(6, 200); // Gói cước
    sheet.setColumnWidth(7, 220); // Ghi chú
    sheet.setColumnWidth(8, 140); // Thời gian gọi
    sheet.setColumnWidth(9, 220); // Tọa độ
    sheet.setColumnWidth(10, 220); // Trang web
    sheet.setColumnWidth(11, 130); // Trạng thái
  }

  return sheet;
}

/**
 * Gửi email thông báo HTML chuyên nghiệp về tvm19624@gmail.com
 */
function sendEmailNotification(data, timestamp) {
  try {
    var rawPhone = data.phone.replace(/[^0-9+]/g, "");
    var callUrl = "tel:" + rawPhone;
    var zaloPhone = rawPhone.replace(/^\+84/, "0");
    var zaloUrl = "https://zalo.me/" + zaloPhone;
    var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();

    var subject =
      "🔥 [FPT TELECOM] KHÁCH HÀNG MỚI ĐĂNG KÝ: " +
      data.name +
      " (" +
      data.phone +
      ")";

    var htmlBody =
      '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">' +
      "<!-- Header -->" +
      '<div style="background: linear-gradient(135deg, #F37021 0%, #ff8a3d 100%); padding: 24px 20px; text-align: center; color: #ffffff;">' +
      '<h1 style="margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">⚡ KHÁCH HÀNG ĐĂNG KÝ FPT MỚI</h1>' +
      '<p style="margin: 6px 0 0; font-size: 13px; opacity: 0.95;">Thông báo tự động từ Website FPT Telecom (0358 513 269)</p>' +
      "</div>" +
      "<!-- Body Content -->" +
      '<div style="padding: 24px 20px;">' +
      "<!-- Action Buttons -->" +
      '<div style="text-align: center; margin-bottom: 22px;">' +
      '<a href="' +
      callUrl +
      '" style="display: inline-block; background-color: #0066cc; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 11px 22px; border-radius: 25px; margin: 0 5px 8px; box-shadow: 0 2px 8px rgba(0,102,204,0.3);">' +
      "📞 GỌI ĐIỆN NGAY (" +
      data.phone +
      ")" +
      "</a>" +
      '<a href="' +
      zaloUrl +
      '" target="_blank" style="display: inline-block; background-color: #0088ff; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 11px 22px; border-radius: 25px; margin: 0 5px 8px; box-shadow: 0 2px 8px rgba(0,136,255,0.3);">' +
      "💬 NHẮN ZALO" +
      "</a>" +
      "</div>" +
      "<!-- Details Table -->" +
      '<table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 14px; color: #333333;">' +
      '<tr style="background-color: #f8fafc;">' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; width: 35%;">👤 Họ và tên:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #F37021; font-size: 15px;">' +
      data.name +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">📞 Số điện thoại:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">' +
      '<a href="' +
      callUrl +
      '" style="color: #0066cc; font-weight: 700; text-decoration: none; font-size: 15px;">' +
      data.phone +
      "</a>" +
      "</td>" +
      "</tr>" +
      '<tr style="background-color: #f8fafc;">' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">📍 Địa chỉ lắp đặt:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">' +
      data.address +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">⚡ Gói cước quan tâm:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #d9534f; font-weight: 700;">' +
      data.service +
      "</td>" +
      "</tr>" +
      '<tr style="background-color: #f8fafc;">' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">📝 Nhu cầu / Ghi chú:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">' +
      data.note +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">⏰ Thời gian liên hệ:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">' +
      data.time +
      "</td>" +
      "</tr>" +
      '<tr style="background-color: #f8fafc;">' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">🌐 Vị trí / Tọa độ:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; word-break: break-all; font-size: 13px; color: #4a5568;">' +
      data.location +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">🔗 Trang gửi Form:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; word-break: break-all; font-size: 13px;">' +
      '<a href="' +
      data.pageUrl +
      '" target="_blank" style="color: #0066cc; text-decoration: underline;">' +
      data.pageUrl +
      "</a>" +
      "</td>" +
      "</tr>" +
      '<tr style="background-color: #f8fafc;">' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">🕒 Thời gian nhận:</td>' +
      '<td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #718096;">' +
      timestamp +
      "</td>" +
      "</tr>" +
      "</table>" +
      "<!-- Button Open Sheet -->" +
      '<div style="text-align: center; margin-top: 15px;">' +
      '<a href="' +
      sheetUrl +
      '" target="_blank" style="display: inline-block; background-color: #0F9D58; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 22px; border-radius: 6px;">' +
      "📊 Mở Bảng Tính Google Sheet Quản Lý" +
      "</a>" +
      "</div>" +
      "</div>" +
      "<!-- Footer -->" +
      '<div style="background-color: #f1f5f9; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">' +
      "Email này được gửi tự động tới <b>" +
      NOTIFY_EMAIL +
      "</b> khi có khách hàng đăng ký trên website.<br>" +
      "Hãy liên hệ lại khách hàng trong vòng 5 - 15 phút để đạt tỷ lệ chốt hợp đồng cao nhất!" +
      "</div>" +
      "</div>";

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
    });

    Logger.log("Đã gửi email thông báo thành công tới: " + NOTIFY_EMAIL);
  } catch (mailError) {
    Logger.log("Lỗi gửi email: " + mailError.toString());
  }
}

/**
 * HÀM TEST THỬ NGHIỆM:
 * Dùng để kiểm tra trực tiếp trong giao diện Google Apps Script (bấm Run > testSubmit)
 */
function testSubmit() {
  var mockEvent = {
    parameter: {
      "Họ Và Tên": "Khách hàng Test Hệ Thống",
      "Số điện thoại": "0358513269",
      "Địa chỉ": "123 Đường Test, Quận 1, TP.HCM",
      "Gói cước": "Internet GIGA 300Mbps",
      "Ghi chú": "Test gửi email thông báo",
      "Thời gian liên hệ": "Gọi ngay bây giờ",
      "Tọa độ": "TP.HCM | GPS: 10.762622, 106.660172",
      "Trang đăng ký": "https://fpttelecomvn.click/",
    },
  };

  var response = doPost(mockEvent);
  Logger.log("Kết quả test: " + response.getContent());
}
