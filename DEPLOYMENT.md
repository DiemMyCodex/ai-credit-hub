# HƯỚNG DẪN DEPLOY VERCEL 1-CLICK DÙNG ĐƯỢC NGAY

Trọn bộ hệ thống **AI Credit Hub** được thiết kế chuẩn Clean Architecture, hoàn toàn tương thích với môi trường **Vercel Edge / Serverless Runtime**, không phụ thuộc bất kỳ daemon nền nào. Bạn có thể triển khai lên Vercel trong vòng 5 phút theo 4 bước đơn giản sau:

---

## BƯỚC 1: KHỞI TẠO SUPABASE (DATABASE & AUTH)

1. Truy cập [https://supabase.com](https://supabase.com) và tạo một Project mới (miễn phí).
2. Vào mục **SQL Editor** ở thanh menu bên trái.
3. Mở file [`supabase/migrations/20261112000000_init_schema.sql`](./supabase/migrations/20261112000000_init_schema.sql), copy toàn bộ nội dung và dán vào SQL Editor của Supabase rồi nhấn **Run**.
   - Bảng `profiles`, `api_keys`, `payment_orders`, `usage_logs` sẽ được tạo kèm Row Level Security (RLS).
   - Hàm trừ tiền và cộng tiền nguyên tử (Atomic Procedures) chống race condition sẽ được kích hoạt.
4. Vào mục **Project Settings** > **API**, lưu lại 3 thông số:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (Nhấn Reveal để xem, khóa này dùng cho Webhook & Proxy)

---

## BƯỚC 2: LẤY OPENROUTER API KEY (NGUỒN CẤP AI)

1. Đăng ký tài khoản tại [https://openrouter.ai](https://openrouter.ai).
2. Vào mục **Keys**, tạo một API Key mới (`sk-or-v1-...`).
3. Khóa này cho phép web của bạn gọi hơn 200+ model AI (Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3, Gemini 2.0 Flash) chỉ qua 1 cổng duy nhất.

---

## BƯỚC 3: KẾT NỐI NGÂN HÀNG VIỆT NAM QUA SEPAY

1. Đăng ký tài khoản miễn phí tại [https://my.sepay.vn](https://my.sepay.vn).
2. Thêm tài khoản ngân hàng của bạn (Hỗ trợ MBBank, Vietcombank, Techcombank, TPBank, VPBank, ACB, v.v.).
3. Vào mục **Cấu hình Webhook**:
   - **URL Webhook**: `https://<ten-project-cua-ban>.vercel.app/api/webhooks/sepay`
   - **Kiểu xác thực**: API Key
   - **API Key**: Đặt một chuỗi bí mật bất kỳ (ví dụ: `sepay_secret_key_8888`)

---

## BƯỚC 4: 1-CLICK DEPLOY LÊN VERCEL

1. Đẩy mã nguồn dự án lên GitHub:
   ```bash
   git add .
   git commit -m "feat: complete ai-credit-hub platform"
   git push origin main
   ```
2. Truy cập [https://vercel.com](https://vercel.com), chọn **Add New...** > **Project**, và chọn repository vừa đẩy.
3. Tại phần **Environment Variables**, điền đầy đủ các biến sau:

| Tên biến môi trường | Giá trị mẫu | Nguồn lấy |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1Ni...` | Supabase Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1Ni...` | Supabase Settings > API |
| `OPENROUTER_API_KEY` | `sk-or-v1-xxxxxxxx...` | OpenRouter Keys |
| `SEPAY_API_KEY` | `sepay_secret_key_8888` | Chuỗi secret bạn đặt ở SePay |
| `NEXT_PUBLIC_BANK_NAME` | `MBBank` | Tên ngân hàng nhận tiền (viết liền) |
| `NEXT_PUBLIC_BANK_ACCOUNT_NO` | `0123456789` | Số tài khoản ngân hàng của bạn |
| `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | `NGUYEN VAN A` | Tên chủ tài khoản không dấu |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Domain Vercel của bạn |

4. Nhấn **Deploy**! Vercel sẽ tự động build Next.js 15 và bàn giao website trực tuyến chỉ sau ~60 giây.

---

## CÁCH SỬ DỤNG NGAY SAU KHI DEPLOY

1. Truy cập trang chủ web Vercel vừa tạo -> Bấm **Đăng ký** tài khoản mới.
2. Tài khoản mới tự động nhận **10,000 VNĐ** credit test miễn phí.
3. Vào **Dashboard** -> Bấm **Tạo API Key Mới** -> Đặt tên và copy key dạng `sk-aihub-...`.
4. Mở **Cursor IDE** hoặc **Cline (VSCode)**:
   - Base URL: `https://your-project.vercel.app/v1`
   - API Key: `sk-aihub-...`
   - Model: `anthropic/claude-3.5-sonnet` hoặc `deepseek/deepseek-chat`
5. Test nạp tiền: Vào Dashboard bấm **Nạp VietQR** -> Quét mã thử gói 50k -> Webhook SePay bắt giao dịch và cộng tiền sau 3 giây!
