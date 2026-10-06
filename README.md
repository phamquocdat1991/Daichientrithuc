# Đại Chiến Tri Thức PRO

Ứng dụng trò chơi kiến thức cho lớp học, triển khai Next.js trên Vercel.

## Chạy và kiểm tra

Node.js 24, pnpm 11.25.0. Chạy `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm test`, `pnpm build`.
Build tự chuẩn bị thư viện trình duyệt và tải mô hình nhận diện tay có kiểm tra SHA-256.

## Production Vercel

Dự án: https://vercel.com/quoc-dat4/daichientrithuc
Framework Next.js, build `npm run build`, output `.next`. Git branch `main`.

**Hiện dùng dữ liệu cục bộ:** ngân hàng câu hỏi, lớp học và kết quả được lưu trong localStorage của từng trình duyệt/tên miền. Xuất bản sao lưu trước khi đổi máy, đổi URL hoặc xóa dữ liệu trình duyệt. Dữ liệu từ bản Sites cũ không tự chuyển sang Vercel.

Đăng nhập và đồng bộ máy chủ chưa được cấu hình trên Vercel. API trạng thái báo `storage:false`, API đồng bộ trả 503 rõ ràng. Không tin cậy header danh tính do người gọi tự gửi. Bộ lưu trữ D1/R2 cũ được giữ riêng ở `platforms/cloudflare` để tham khảo; không chạy trên Vercel.

Các tính năng chơi trận, quản lý học liệu, nhập/xuất Excel/Word, báo cáo và sao lưu hoạt động phía trình duyệt. AI sinh câu hỏi tự động và phòng chơi QR chưa triển khai. Camera cần HTTPS và quyền truy cập; chưa kiểm thử với webcam thật.
