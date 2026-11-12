# AI Credit Hub ⚡

> Nền tảng bán Credit API AI chuẩn OpenAI, nạp tiền tự động 3 giây qua VietQR, hỗ trợ đa model (Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3, Gemini 2.0 Flash) - Sẵn sàng 1-Click Deploy lên Vercel!

---

## 🌟 Điểm Nổi Bật

- **100% Tương Thích Định Dạng OpenAI**: Cắm trực tiếp vào Cursor, Cline, LibreChat, NextChat, Dify qua endpoint `/v1/chat/completions`.
- **Nạp Tiền VietQR Tự Động 3 Giây**: Tích hợp Webhook SePay (MBBank, Vietcombank, Techcombank...). Khách quét mã QR ngân hàng là tài khoản tự nhảy số dư sau 3 giây.
- **Hơn 200+ Model Thượng Thừa**: Tích hợp OpenRouter Upstream Adapter (Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3, DeepSeek-R1, Gemini 2.0 Flash).
- **Quản Lý API Key Có Giới Hạn Chi Tiêu**: Mỗi khách hàng có thể tạo nhiều key cho các dự án khác nhau và đặt hạn mức trần (spending limit) để chống lộ key.
- **Tích Hợp Playground Chat Trực Tiếp**: Thử nghiệm model ngay trên trình duyệt trước khi gắn key vào IDE.
- **Chuẩn Thiết Kế Bento Grid OLED Dark Mode**: Nền đen Obsidian (#08090D), tối ưu công thái học di động và máy tính theo chuẩn Mobile UI Craft.

---

## 🚀 Hướng Dẫn Deploy Lên Vercel Dùng Ngay Trong 5 Phút

### Bước 1: Khởi Tạo Database Supabase (Miễn Phí)
1. Truy cập [supabase.com](https://supabase.com) tạo một dự án mới (chọn khu vực Singapore `ap-southeast-1` để độ trễ thấp nhất).
2. Vào mục **SQL Editor** trong Dashboard Supabase.
3. Mở file migration: [`supabase/migrations/20261112000000_init_schema.sql`](supabase/migrations/20261112000000_init_schema.sql).
4. Dán toàn bộ nội dung file SQL và bấm **Run**. Toàn bộ bảng, Row Level Security (RLS) và Stored Procedures trừ tiền tự động sẽ được tạo lập ngay lập tức.
5. Vào **Project Settings > API**, sao chép:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

### Bước 2: Lấy API Key OpenRouter
1. Truy cập [openrouter.ai/keys](https://openrouter.ai/keys).
2. Đăng ký tài khoản và nạp một khoản tín dụng nhỏ (ví dụ $5 - $10).
3. Tạo một API Key mới (`sk-or-v1-...`).

---

### Bước 3: Đăng Ký Cổng Webhook VietQR (SePay)
1. Truy cập [sepay.vn](https://sepay.vn) đăng ký tài khoản miễn phí.
2. Kết nối tài khoản ngân hàng của bạn (MBBank, TPBank, Vietcombank, v.v.).
3. Vào **Tích hợp Webhook** trên SePay:
   - Điền URL: `https://<ten-domain-cua-ban>.vercel.app/api/webhooks/sepay`
   - Phương thức: `POST`
   - Kiểu xác thực: `API Key` (nhập chuỗi bí mật của bạn vào)

---

### Bước 4: Deploy Lên Vercel (1-Click)
1. Đẩy mã nguồn dự án lên GitHub của bạn.
2. Truy cập [vercel.com/new](https://vercel.com/new) và chọn Import repository này.
3. Điền các biến môi trường trong phần **Environment Variables**:

| Tên Biến | Giá Trị Mẫu | Mô Tả |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | URL Supabase từ Bước 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Anon public key từ Bước 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Service role secret key từ Bước 1 |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | API Key lấy từ Bước 2 |
| `SEPAY_API_KEY` | `your-secret-sepay-token` | Chuỗi secret token cấu hình tại Bước 3 |
| `NEXT_PUBLIC_BANK_NAME` | `MBBank` | Tên ngân hàng nhận tiền (MBBank, VCB...) |
| `NEXT_PUBLIC_BANK_ACCOUNT_NO` | `0987654321` | Số tài khoản ngân hàng của bạn |
| `NEXT_PUBLIC_BANK_ACCOUNT_NAME`| `NGUYEN VAN A` | Tên chủ tài khoản không dấu |
| `NEXT_PUBLIC_TRANSFER_PREFIX` | `AIHUB` | Tiền tố nội dung chuyển khoản |

4. Bấm **Deploy**. Sau ~1 phút, Vercel sẽ cấp phát URL chạy trực tiếp!

---

## 💻 Hướng Dẫn Tích Hợp Vào Cursor / Cline / LibreChat

### Dành cho Cursor
1. Mở **Cursor Settings > Models**.
2. Tại mục **OpenAI API Key**, bật công tắc.
3. Tại ô **Override OpenAI Base URL**, điền: `https://<domain-cua-ban>.vercel.app/v1`
4. Dán API Key bắt đầu bằng `sk-aihub-...` mà bạn đã tạo trong Dashboard.
5. Thêm các model muốn dùng:
   - `anthropic/claude-3.5-sonnet`
   - `openai/gpt-4o`
   - `deepseek/deepseek-chat`
6. Bắt đầu gõ code và hưởng thụ tốc độ stream siêu mượt!

---

## 🧪 Chạy Kiểm Thử Hệ Thống (Testing Seams)

Hệ thống được kiểm thử tự động tại 2 điểm chạm (Seams) cao nhất:
```bash
npm run test
```
- **Seam 1**: Proxy Gateway (`POST /v1/chat/completions`) & Công thức trừ tiền VND (margin 35%).
- **Seam 2**: Banking Webhook (`POST /api/webhooks/sepay`) & Trình trích xuất cú pháp chuyển khoản ngân hàng.

---

## 📁 Cấu Trúc Dự Án

```
projects/ai-credit-hub/
├── docs/
│   ├── adr/                       # Các quyết định kiến trúc cốt lõi
│   └── spec.md                    # Bản đặc tả kỹ thuật chi tiết
├── src/
│   ├── app/
│   │   ├── api/                   # Webhook SePay, Quản lý Key, Nạp tiền
│   │   ├── dashboard/             # Giao diện quản trị, xem số dư & Playground
│   │   ├── v1/                    # OpenAI-compatible API Reverse Proxy
│   │   └── page.tsx               # Landing page Bento Grid OLED
│   ├── components/                # UI Components (Header, Modals, Bento Grid...)
│   ├── lib/                       # Supabase client, VietQR, Pricing, Keys
│   └── types/                     # Typed Supabase Database Schema
└── supabase/
    └── migrations/                # Schema PostgreSQL với RLS & RPC
```
