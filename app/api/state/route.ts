// Cloud storage requires a verified identity provider and durable storage.
// Never trust caller-supplied Sites identity headers on public Vercel hosting.
export const dynamic = 'force-dynamic';
function unavailable() {
  return Response.json({error:'Đồng bộ tài khoản chưa được cấu hình trên Vercel. Dữ liệu vẫn lưu trên thiết bị; hãy dùng Sao lưu ra tệp.',code:'CLOUD_NOT_CONFIGURED'}, {status:503,headers:{'Cache-Control':'no-store'}});
}
export async function GET() { return unavailable(); }
export async function PUT() { return unavailable(); }
