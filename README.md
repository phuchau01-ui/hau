# Vietnam Perception Survey · Korea × Vietnam

Website khảo sát song ngữ theo nội dung file survey_form.pdf, gồm:
- `index.html`: biểu mẫu khảo sát 11 câu.
- `admin.html`: đăng nhập quản trị, biểu đồ phân tích và xuất CSV.
- `supabase/schema.sql`: cấu trúc cơ sở dữ liệu và chính sách bảo mật.

## 1. Tạo cơ sở dữ liệu Supabase
1. Tạo project tại https://supabase.com/.
2. Mở **SQL Editor**, chạy toàn bộ nội dung `supabase/schema.sql`.
3. Trong **Authentication → Users**, tạo tài khoản cho quản trị viên (không bật đăng ký công khai).
4. Trong SQL policy `Only admin can read survey`, thay `admin@example.com` bằng email quản trị viên vừa tạo rồi chạy lại phần policy đó.

## 2. Kết nối website với Supabase
1. Vào **Project Settings → API** của Supabase.
2. Sao chép **Project URL** và **anon/public key**.
3. Mở `app.js`, thay hai giá trị:
   - `YOUR_SUPABASE_URL`
   - `YOUR_SUPABASE_ANON_KEY`
4. Commit thay đổi.

Không đưa service_role key vào mã frontend. Chính sách Row Level Security cho phép khách gửi phản hồi nhưng chỉ email quản trị được đọc dữ liệu.

## 3. Xuất bản bằng GitHub Pages
1. Vào repository **Settings → Pages**.
2. Chọn **Deploy from a branch**, branch `main`, folder `/ (root)), rồi Save.
3. Đợi GitHub Pages triển khai. Địa chỉ thường có dạng `https://<username>.github.io/<repository>/`.
4. Chia sẻ đường dẫn `index.html` cho người tham gia. Trang quản lý ở `admin.html`.

## 4. Phân tích dữ liệu
Dashboard hiển thị số lượng phản hồi, tỷ lệ đã từng đến Việt Nam, tỷ lệ yêu thích cao/rất cao, ý định đến trong 1 năm; biểu đồ độ tuổi, trải nghiệm, ấn tượng, sức hấp dẫn, nguồn thông tin, thành phố, ý định và điểm trung bình 6 nhận định. Có thể tải dữ liệu phản hồi dạng CSV.

## Lưu ý
GitHub Pages chỉ lưu và phân phối giao diện tĩnh; dữ liệu phản hồi được lưu trong Supabase để các thiết bị khác nhau cùng xem một nguồn dữ liệu. Cần hoàn tất cấu hình Supabase trước khi thu thập dữ liệu thật.
