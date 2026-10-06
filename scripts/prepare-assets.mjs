import {mkdir,cp,readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dest=path.join(root,'public/game/vendor');await mkdir(dest,{recursive:true});
const files=[['xlsx/dist/xlsx.full.min.js','xlsx.js'],['mammoth/mammoth.browser.min.js','mammoth.js'],['docx/dist/index.iife.js','docx.js'],['katex/dist/katex.min.js','katex.js'],['katex/dist/katex.min.css','katex.css'],['katex/dist/contrib/auto-render.min.js','auto-render.js'],['katex/dist/fonts','fonts'],['pdfjs-dist/build/pdf.min.mjs','pdf.mjs'],['pdfjs-dist/build/pdf.worker.min.mjs','pdf.worker.mjs'],['@mediapipe/tasks-vision/vision_bundle.mjs','vision/vision.mjs'],['@mediapipe/tasks-vision/wasm','vision/wasm']];
for(const [from,to] of files){await mkdir(path.dirname(path.join(dest,to)),{recursive:true});await cp(path.join(root,'node_modules',from),path.join(dest,to),{recursive:true});}
const model=path.join(dest,'hand_landmarker.task');const hash=(await readFile(path.join(root,'docs/hand-model.sha256'),'utf8')).trim();
let good=false;try{good=createHash('sha256').update(await readFile(model)).digest('hex')===hash}catch{}
if(!good){const response=await fetch('https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',{signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('Không tải được MediaPipe: '+response.status);const bytes=Buffer.from(await response.arrayBuffer());if(createHash('sha256').update(bytes).digest('hex')!==hash)throw Error('Mô hình MediaPipe không khớp SHA-256');await writeFile(model,bytes)}
console.log('Assets ready: document tools, math rendering and hand detection.');
