// Consumer only: no corpus content is embedded here.
export const markerLabels = Object.freeze({A:'dato archeologico', E:'dato epigrafico', T:'tradizione letteraria antica', I:'interpretazione storiografica moderna', H:'ipotesi ricostruttiva proposta nel testo'});
export function markers(text) {
  return [...new Set([...text.matchAll(/\[([AETHI](?:\/[AETHI])*)\]/g)].flatMap(m=>m[1].split('/')))];
}
const local = n => (n?.name || '').split(':').at(-1);
const children = n => (n?.elements || []).filter(x=>x.type==='element');
const child = (n,name) => children(n).find(x=>local(x)===name);
const attr = (n,name) => Object.entries(n?.attributes||{}).find(([k])=>k.split(':').at(-1)===name)?.[1];
const all = (n,name) => children(n).flatMap(x=>[...(local(x)===name?[x]:[]),...all(x,name)]);
const value = n => (n?.elements||[]).map(x=>x.type==='text'?x.text:value(x)).join('');
const clean = s => s.replace(/\s+/g,' ').trim();
export function browserXml(text) {
  const d = new DOMParser().parseFromString(text,'application/xml');
  if(d.querySelector('parsererror')) throw Error('XML non valido');
  const convert=n=>n.nodeType===3?{type:'text',text:n.nodeValue}:{type:'element',name:n.nodeName,attributes:Object.fromEntries([...n.attributes||[]].map(a=>[a.name,a.value])),elements:[...n.childNodes].filter(c=>[1,3].includes(c.nodeType)).map(convert)};
  return {elements:[convert(d.documentElement)]};
}
export function decodeDocument(raw, app, parse=browserXml) {
  if(raw.id!==app.id || raw.sourceFile!==app.sourceFile || !Array.isArray(app.packageParts)) throw Error('Associazione documento/apparato non valida');
  const parts=new Map(app.packageParts.map(p=>[p.name,p]));
  if(parts.size!==app.packageParts.length) throw Error('Parti duplicate');
  const parsed=new Map();
  const xml=name=>{if(parsed.has(name))return parsed.get(name);const p=parts.get(name); if(!p) throw Error(`Parte mancante: ${name}`);const result=parse(new TextDecoder().decode(Uint8Array.from(atob(p.base64),c=>c.charCodeAt(0))));parsed.set(name,result);return result;};
  const styles=new Map(all(xml('word/styles.xml'),'style').map(s=>[attr(s,'styleId'),s]));
  function props(node,base={}) {
    const p={...base}; if(!node)return p;
    for(const [tag,key] of [['b','bold'],['i','italic']]) {const n=child(node,tag);if(n)p[key]=!['0','false','off'].includes(attr(n,'val'));}
    const v=child(node,'vertAlign');if(v)p.vertical=attr(v,'val');return p;
  }
  function style(id,seen=new Set()) {if(!id)return {};if(seen.has(id))throw Error('Ciclo stili');seen.add(id);const s=styles.get(id);return props(child(s,'rPr'),style(attr(child(s,'basedOn'),'val'),seen));}
  const defaults=props(child(child(all(xml('word/styles.xml'),'docDefaults')[0],'rPrDefault'),'rPr'));
  const relationCache=new Map();
  function relations(part) {if(relationCache.has(part))return relationCache.get(part);const at=part.lastIndexOf('/');const rp=part.slice(0,at+1)+'_rels/'+part.slice(at+1)+'.rels';const m=new Map(parts.has(rp)?all(xml(rp),'Relationship').map(n=>[attr(n,'Id'),{target:attr(n,'Target'),external:attr(n,'TargetMode')==='External',type:attr(n,'Type')}]):[]);relationCache.set(part,m);return m;}
  function imageFor(id,part) {const rel=relations(part).get(id);if(!rel||rel.external)throw Error('Immagine non risolta');const key=new URL(rel.target,'https://package/'+part).pathname.slice(1);const p=parts.get(key);if(!p)throw Error('Media mancante');const ext=key.split('.').at(-1);return {type:'image',src:`data:image/${ext==='jpg'?'jpeg':ext};base64,${p.base64}`,text:`Immagine incorporata nella fonte (${key}); metadati da verificare.`};}
  function runs(node,part,base={}) {const result=[];for(const n of children(node)) {const tag=local(n);
    if(tag==='r'){const rp=child(n,'rPr');result.push(...runs(n,part,props(rp,{...base,...style(attr(child(rp,'rStyle'),'val'))})));}
    else if(tag==='t')result.push({type:'text',text:value(n),...base});
    else if(tag==='br'||tag==='cr')result.push({type:'text',text:'\n',...base});
    else if(tag==='tab')result.push({type:'text',text:'\t',...base});
    else if(tag==='hyperlink'){const rel=relations(part).get(attr(n,'id'));const anchor=attr(n,'anchor');if(!rel&&!anchor)throw Error('Hyperlink non risolto');result.push(...runs(n,part,{...base,href:rel?rel.target:'#'+anchor}));}
    else if(tag==='footnoteReference'||tag==='endnoteReference'){const kind=tag.replace('Reference','');const id=attr(n,'id');result.push({type:'text',text:`[${id}]`,href:`#${kind}-${id}`,reference:`${kind}-${id}`,...base});}
    else if(tag==='blip'&&attr(n,'embed'))result.push(imageFor(attr(n,'embed'),part));
    else if(tag==='imagedata'&&attr(n,'id'))result.push(imageFor(attr(n,'id'),part));
    else if(tag==='bookmarkStart')result.push({type:'anchor',id:attr(n,'name'),text:''});
    else if(!['pPr','rPr'].includes(tag))result.push(...runs(n,part,base));
  }return result;}
  let sectionIndex=0;
  function blocks(node,part,main=false) {return children(node).flatMap(n=>{
    const tag=local(n);
    if(tag==='p'){const sid=attr(child(child(n,'pPr'),'pStyle'),'val');const sname=attr(child(styles.get(sid),'name'),'val')||'';const inline=runs(n,part,{...defaults,...style(sid)});const text=inline.map(x=>x.type==='text'?x.text:'').join('');let id;
      if(main&&/^(heading|h1custom)/i.test(sname)&&clean(text)){const s=raw.sections[sectionIndex++];if(!s||s.title!==clean(text))throw Error('Ordine sezioni non conforme');id=s.id;}
      return [{type:'paragraph',id,heading:!!id,inline,text}];}
    if(tag==='tbl')return [{type:'table',rows:children(n).filter(x=>local(x)==='tr').map(row=>children(row).filter(x=>local(x)==='tc').map(cell=>blocks(cell,part,false)))}];
    return ['sectPr','tblPr','tcPr'].includes(tag)?[]:blocks(n,part,main);
  });}
  const body=all(xml('word/document.xml'),'body')[0];const content=blocks(body,'word/document.xml',true);
  if(sectionIndex!==raw.sections.length)throw Error('Sezioni mancanti');
  const notes=[];for(const kind of ['footnote','endnote']){const part=`word/${kind}s.xml`;if(parts.has(part))for(const n of all(xml(part),kind))if(Number(attr(n,'id'))>0)notes.push({id:`${kind}-${attr(n,'id')}`,blocks:blocks(n,part)});}
  const supplements=[...parts.keys()].filter(k=>/^word\/(header|footer)\d+\.xml$/.test(k)).map(part=>({part,blocks:blocks(children(xml(part))[0],part)}));
  const noteIds=new Set(notes.map(n=>n.id));
  for(const p of content.filter(x=>x.type==='paragraph'))for(const i of p.inline)if(i.reference&&!noteIds.has(i.reference))throw Error('Nota non risolta');
  return {id:raw.id,sourceFile:raw.sourceFile,sourceSha256:app.sourceSha256,content,notes,supplements,markers:markers(JSON.stringify(raw.sections))};
}
export async function loadCorpus(base='./content/v1.1',fetcher=fetch,parse=browserXml) {
  const get=async path=>{const r=await fetcher(path);if(!r.ok)throw Error('Corpus canonico non ancora attivato o incompleto');return new Uint8Array(await r.arrayBuffer());};
  const text=b=>new TextDecoder().decode(b);const manifest=JSON.parse(text(await get(base+'/bundle-manifest.json')));
  if(manifest.sourceStatus!=='CANONICAL_VALIDATED_SOURCE'||manifest.documents?.length!==17)throw Error('Manifest di bundle non valido');
  const ids=['intro',...Array.from({length:16},(_,i)=>`chapter-${String(i+1).padStart(2,'0')}`)];
  if(JSON.stringify(manifest.documents.map(d=>d.id))!==JSON.stringify(ids))throw Error('Inventario documenti non valido');
  const digest=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();
  return Promise.all(manifest.documents.map(async d=>{const rb=await get(`${base}/raw/${d.id}.json`),ab=await get(`${base}/apparatus/${d.id}.json`);
    if(await digest(rb)!==d.rawSha256||await digest(ab)!==d.apparatusSha256)throw Error('Hash del bundle non conforme');
    const raw=JSON.parse(text(rb)),app=JSON.parse(text(ab));if(app.sourceSha256!==d.sourceSha256)throw Error('Provenienza non conforme');
    for(const p of app.packageParts){const bytes=Uint8Array.from(atob(p.base64),c=>c.charCodeAt(0));if(bytes.length!==p.bytes||await digest(bytes)!==p.sha256)throw Error('Parte corrotta');}
    return {raw,document:decodeDocument(raw,app,parse)};
  }));
}
export function renderDocument(model,host) {
  const lastReferences=new Map();
  const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const render=(blocks,parent)=>{for(const b of blocks){if(b.type==='table'){const table=node('table');for(const row of b.rows){const tr=node('tr');for(const cell of row){const td=node('td');render(cell,td);tr.append(td);}table.append(tr);}parent.append(table);continue;}
    const p=node(b.heading?'h2':'p');if(b.id)p.id=b.id;
    for(const item of b.inline){if(item.type==='image'){const figure=node('figure');const img=node('img');img.src=item.src;img.alt=item.text;figure.append(img,node('figcaption',item.text));p.append(figure);continue;}if(item.type==='anchor'){const anchor=node('span');anchor.id=item.id;p.append(anchor);continue;}
      let span=node(item.vertical==='superscript'?'sup':item.vertical==='subscript'?'sub':'span',item.text);span.style.whiteSpace='pre-wrap';if(item.bold)span.style.fontWeight='bold';if(item.italic)span.style.fontStyle='italic';
      if(item.href){const link=node('a');if(item.href.startsWith('#')){link.href=item.href;link.addEventListener('click',e=>{e.preventDefault();lastReferences.set(item.href.slice(1),link);host.querySelector('#'+CSS.escape(item.href.slice(1)))?.scrollIntoView();});}else if(/^https?:\/\//i.test(item.href)){link.href=item.href;link.target='_blank';link.rel='noopener noreferrer';}else link.title=item.href;link.append(span);span=link;}
      p.append(span);
    }parent.append(p);
  }};
  host.replaceChildren(node('p',`Fonte canonica: ${model.sourceFile} · ${model.sourceSha256}`));render(model.content,host);
  const notes=node('section');notes.append(node('h2','Note'));for(const note of model.notes){const n=node('div');n.id=note.id;n.append(node('h3',note.id));render(note.blocks,n);const back=node('button','Torna al richiamo');back.onclick=()=>{const ref=lastReferences.get(note.id);if(ref){ref.scrollIntoView();ref.focus();}else host.scrollIntoView();};n.append(back);notes.append(n);}host.append(notes);
  for(const s of model.supplements){const details=node('details');details.append(node('summary',s.part));render(s.blocks,details);host.append(details);}
}
