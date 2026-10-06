export async function GET(req:Request){return Response.json({signedIn:!!req.headers.get('oai-authenticated-user-id'),storage:true,ai:false},{headers:{'Cache-Control':'no-store'}})}
