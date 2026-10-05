# Đại Chiến Tri Thức PRO 2.0

Ứng dụng trò chơi trắc nghiệm đối kháng dành cho lớp học: hai đội hoặc hai học sinh giành quyền trả lời, tính HP, xem kết quả và ôn lại câu sai.

## Tính năng
- 15 ảnh nhân vật PNG nền trong suốt.
- Ngân hàng câu hỏi 2–4 đáp án, ảnh, giải thích và LaTeX; tìm kiếm, phân loại, yêu thích, nhân bản.
- Nhập/xuất Excel; xuất Word; đọc văn bản Word/PDF/TXT; duyệt câu hỏi JSON trước khi lưu.
- Vui học / công bằng, đồng hồ, combo, chí mạng, kỹ năng, hồi máu.
- Giáo viên tạm dừng, thêm giờ, hoàn tác, bỏ qua câu và chỉnh HP.
- Quản lý lớp, chia đội, gọi tên không lặp, báo cáo và ôn lại câu sai.
- Đồng bộ theo tài khoản qua D1/R2 với kiểm tra phiên bản chống ghi đè.
- MediaPipe nhận diện giơ tay trên thiết bị; luôn có nút bấm dự phòng.

## Chạy trên máy
Yêu cầu Node.js >=22.13 và pnpm 11.25.0.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Script `predev` chuẩn bị các thư viện từ `node_modules` và tải mô hình MediaPipe từ Google, có kiểm tra SHA-256. Những tệp có thể tái tạo này không đưa vào Git; 15 ảnh nhân vật được lưu trực tiếp trong repository. Cần mạng ở lần chuẩn bị đầu tiên. Mở địa chỉ được máy chủ in ra và truy cập `/game/index.html`.

Để chỉ thử phần trò chơi lưu trên trình duyệt, có thể phục vụ thư mục `public/game` bằng HTTP sau khi chạy `pnpm run prepare:assets`. Đồng bộ tài khoản chỉ dùng được khi có máy chủ và xác thực được cấu hình.

## Kiểm thử và build
```sh
pnpm test
pnpm exec tsc --noEmit
pnpm run build
```

Kiểm thử gồm logic thi đấu, luồng DOM và API đồng bộ. Camera thật, giao diện thiết bị di động và đồng bộ trên hai thiết bị chưa được kiểm chứng thực tế đầy đủ.

## Cấu trúc
- `public/game/`: giao diện và game, giữ khóa dữ liệu trình duyệt cũ.
- `app/api/state/`: API đồng bộ có xác thực và optimistic concurrency.
- `db/`, `drizzle/`: schema và migration D1.
- `build/`, `vite.config.ts`: tích hợp Vinext/Cloudflare.
- `tests/`: bộ kiểm thử.
- `docs/UPGRADE-V2.md`: phạm vi triển khai và giới hạn.

## Triển khai: lưu ý quan trọng
Đây là mã nguồn phiên bản hiện tại dùng **Vinext + Cloudflare Workers + D1 + R2**, không phải bản đã chuyển sang Vercel/Netlify.

Bản đang chạy trên ChatGPT Sites nhận danh tính qua header do nền tảng xác thực cung cấp. Không tin các header này từ người dùng khi triển khai độc lập. Cần thay bằng xác thực phía máy chủ hợp lệ trước khi mở API ra ngoài.

Để chuyển lên Vercel hoặc Netlify cần:
1. Chuyển runtime/API tương thích nền tảng đích.
2. Tích hợp đăng nhập và kiểm tra quyền phía máy chủ.
3. Chuyển D1/R2 hoặc xây cầu nối an toàn đến dịch vụ dữ liệu; bảo toàn dữ liệu hiện có.
4. Kiểm thử toàn bộ đồng bộ và chơi trước khi thay production.

Không chứa API key, cookie, bản dữ liệu người dùng hoặc thông tin đăng nhập. Repository không tự triển khai lên Vercel.

## Chưa hoàn tất
- AI tự sinh câu hỏi: chưa cấu hình dịch vụ AI; hiện có đọc nguồn, tạo câu lệnh và duyệt JSON.
- Phòng chơi QR nhiều điện thoại.
- OCR PDF scan và công thức Word bản địa.

## Tài nguyên bên thứ ba
Thư viện cài qua pnpm giữ giấy phép tương ứng. Ảnh nhân vật được lấy từ ứng dụng tham chiếu theo yêu cầu; repository này không cấp quyền sở hữu hoặc giấy phép lại cho các nhân vật/ảnh của bên thứ ba. Nguồn được ghi trong `docs/character-assets.json`.
