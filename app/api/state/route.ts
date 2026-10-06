import { env } from 'cloudflare:workers';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 const owner=req.headers.get('oai-authenticated-user-id');if(!owner)return reply({error:'Cần đăng nhập để đồng bộ.'},401);
 const row=await env.DB!.prepare('SELECT version, object_key, updated FROM snapshots WHERE owner=?').bind(owner).first<{version:number,object_key:string,updated:number}>();
 if(!row)return reply({version:0,data:null});
 const obj=await env.BUCKET!.get(row.object_key);if(!obj)return reply({error:'Không đọc được bản lưu.'},503);
 return reply({version:row.version,updated:row.updated,data:JSON.parse(await obj.text())});
}
export async function PUT(req:Request){
 const owner=req.headers.get('oai-authenticated-user-id');if(!owner)return reply({error:'Cần đăng nhập để đồng bộ.'},401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return reply({error:'Origin không hợp lệ'},403);
 const raw=await req.text();if(raw.length>20_000_000)return reply({error:'Bản lưu vượt 20 MB. Hãy giảm ảnh tải lên.'},413);
 let body;try{body=JSON.parse(raw)}catch{return reply({error:'JSON không hợp lệ'},400)}
 const {data,version}=body;if(!Number.isInteger(version)||version<0||data?.version!==1||!Array.isArray(data.banks)||!Array.isArray(data.classes)||!Array.isArray(data.matches))return reply({error:'Dữ liệu không hợp lệ'},400);
 const previous=await env.DB!.prepare('SELECT object_key FROM snapshots WHERE owner=?').bind(owner).first<{object_key:string}>();
 const key=`snapshots/${encodeURIComponent(owner)}/${crypto.randomUUID()}.json`, now=Date.now();
 await env.BUCKET!.put(key,JSON.stringify(data),{httpMetadata:{contentType:'application/json'}});
 let result;if(version===0)result=await env.DB!.prepare('INSERT OR IGNORE INTO snapshots(owner,version,object_key,updated) VALUES(?,1,?,?)').bind(owner,key,now).run();
 else result=await env.DB!.prepare('UPDATE snapshots SET version=version+1,object_key=?,updated=? WHERE owner=? AND version=?').bind(key,now,owner,version).run();
 if(!result.meta.changes){await env.BUCKET!.delete(key);return reply({error:'Dữ liệu đã thay đổi trên thiết bị khác. Hãy tải bản mới trước khi lưu.'},409)}
 if(previous?.object_key)try{await env.BUCKET!.delete(previous.object_key)}catch{}
 return reply({version:version+1,updated:now});
}
