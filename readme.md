# Ứng Dụng Khảo Sát & Định Hướng Nghề Nghiệp Học Sinh THCS (DISC Career Guidance)

Dự án ứng dụng web hỗ trợ định hướng nghề nghiệp cá nhân hóa dành cho học sinh Trung học Cơ sở (THCS). Ứng dụng đánh giá mức độ phù hợp nghề nghiệp dựa trên sự kết hợp của 3 yếu tố: **Đặc điểm tính cách (DISC)**, **Mức độ hứng thú môn học** và **Năng lực học thuật**.

## 🚀 Tính năng nổi bật

* **Trắc nghiệm tính cách DISC:** Bộ 12 câu hỏi chuẩn hóa giúp phân loại học sinh vào 4 nhóm tính cách (D, I, S, C).
* **Thuật toán Gợi ý Cá nhân hóa:** Tính toán điểm phù hợp nhóm nghề dựa trên trọng số khoa học ($w_1=0.4$ cho Tính cách, $w_2=0.3$ cho Hứng thú, $w_3=0.3$ cho Năng lực học tập).
* **Giao diện trực quan (UI/UX):** Trải nghiệm người dùng thân thiện trên mọi thiết bị (Responsive), kết quả trả về dưới dạng Thẻ thông tin (Card) bắt mắt, tự động xếp hạng mức độ tiềm năng.
* **Xác thực dữ liệu thời gian thực (Real-time Validation):** Kiểm tra lỗi nhập liệu ngay khi người dùng đang gõ (ví dụ: điểm giới hạn từ 0-10 hoặc điền "không áp dụng").
* **Lưu trữ đám mây & Bảng điều khiển (Dashboard):** Dữ liệu được đẩy tự động lên Google Sheets. Tích hợp sẵn tab thống kê trực quan dành cho nhà nghiên cứu/giáo viên.

## 🛠 Công nghệ sử dụng

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (Không sử dụng thư viện/framework, tối ưu hóa tốc độ tải trang).
* **Backend & Database:** Google Apps Script (GAS) và Google Sheets (Hoạt động như một RESTful API không máy chủ).
* **Hosting (Đề xuất):** GitHub Pages / Netlify / Vercel (Phục vụ file tĩnh tốc độ cao).

## 📂 Cấu trúc thư mục

```text
/
├── index.html       # Cấu trúc giao diện biểu mẫu khảo sát và dashboard thống kê
├── style.css        # Định dạng giao diện, hiệu ứng hiển thị (validate, responsive)
├── script.js        # Xử lý logic, thuật toán tính điểm và gọi API gửi dữ liệu
└── README.md        # Tài liệu hướng dẫn dự án

```

## ⚙️ Hướng dẫn Cài đặt & Triển khai

Dự án hoạt động theo mô hình Client-Server độc lập. Bạn cần thiết lập Backend (Google Sheets) trước, sau đó kết nối URL vào Frontend.

### Bước 1: Thiết lập cơ sở dữ liệu (Google Sheets & Apps Script)

1. Tạo một file Google Sheets mới, đổi tên sheet đầu tiên thành `Data`.
2. Tạo các cột tiêu đề ở Hàng 1 theo thứ tự: *Thời gian, Đồng ý tham gia, Khối, Giới tính, Chương trình học, Thang điểm, B3. Tên môn học 1, B3. Mức độ yêu thích, B3. Điểm hệ 10, B3. Điểm Cambridge, B4. Tên môn học 2, B5. Tên môn học 3, B6. Điểm GPA hệ 10, B6. Xếp loại Cambridge, Điểm D, Điểm I, Điểm S, Điểm C*.
3. Chọn **Tiện ích mở rộng (Extensions)** > **Apps Script**.
4. Xóa mã mặc định, dán toàn bộ đoạn mã Backend (chứa hàm `doPost` và `doGet`) vào trình soạn thảo.
5. Chọn **Triển khai (Deploy)** > **Bản triển khai mới (New deployment)**.
6. Chọn loại **Ứng dụng web (Web App)**. Quyền truy cập: **Bất kỳ ai (Anyone)**.
7. Bấm **Triển khai**, cấp quyền và sao chép **URL Ứng dụng Web**.

### Bước 2: Kết nối Frontend

1. Mở file `script.js` trong mã nguồn.
2. Tìm hằng số `APPS_SCRIPT_URL` ở đầu file.
3. Thay thế giá trị bằng URL bạn vừa sao chép ở Bước 1:
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

```



### Bước 3: Triển khai Website (Hosting tĩnh)

Bạn có thể triển khai mã nguồn lên các nền tảng hosting miễn phí. Dưới đây là hướng dẫn với **GitHub Pages**:

1. Đăng nhập GitHub, tạo một Repository mới (Public).
2. Tải 3 file (`index.html`, `style.css`, `script.js`) lên thư mục gốc của Repository.
3. Vào **Settings** > **Pages**. Mục *Source*, chọn nhánh **main** (hoặc master) và bấm Save.
4. (Tùy chọn) Kéo xuống mục **Custom domain** để thêm tên miền cá nhân (ví dụ: `dinhhuong.truonghoc.edu.vn`) và thiết lập bản ghi DNS tương ứng.

## 🧠 Lưu ý về Thuật toán Tính điểm

Điểm số phù hợp ($S$) cho từng nhóm nghề được hệ thống chuẩn hóa về thang $0-1$ và tính theo công thức:


$$S = (0.4 \times DISC_{norm}) + (0.3 \times Interest_{norm}) + (0.3 \times Ability_{norm})$$


Kết quả cuối cùng được nhân với 100 để hiển thị dưới dạng phần trăm (%). Hệ thống sẽ dựa vào tỷ lệ này để phân cấp nhãn tự động (*Rất tiềm năng, Đáng cân nhắc, Khám phá thêm*).