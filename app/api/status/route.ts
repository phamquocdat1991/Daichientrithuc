export const dynamic = 'force-dynamic';
export async function GET(){return Response.json({signedIn:false,storage:false,ai:false,mode:'local',platform:'vercel'},{headers:{'Cache-Control':'no-store'}})}
