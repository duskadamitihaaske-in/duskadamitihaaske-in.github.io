/* Dus Kadam — YouTube-style comments for notes pages.
   Usage on a page:  <section id="dk-comments" data-page="class9"></section>
                     <script src="comments.js" defer></script>
   Real mode: fill DK_FIREBASE below. Empty config = demo mode (sample comments, saved only in this browser). */
(function(){
const DK_FIREBASE = {apiKey:"AIzaSyADkKOdHL-Cschi8WkMsrAOODJJ0wxCK2k",authDomain:"dus-kadam-notes.firebaseapp.com",projectId:"dus-kadam-notes",storageBucket:"dus-kadam-notes.firebasestorage.app",messagingSenderId:"784274648842",appId:"1:784274648842:web:e22736913b47c626c994f3"}; // <-- yahan firebaseConfig aayega: {apiKey:"...", authDomain:"...", projectId:"...", ...}

const root = document.getElementById('dk-comments'); if(!root) return;
const PAGE = root.dataset.page || location.pathname.split('/').pop().replace('.html','') || 'home';
const BAD = ['gaali','madarchod','bhenchod','behenchod','chutiya','chutiye','bhosdi','bhosdike','gandu','harami','haramkhor','randi','kutta kamina','lavde','lodu','lund','mc ','bc ','bkl','fuck','shit','bitch','bastard','asshole','dick','porn','sex'];
const LINK = /(https?:\/\/|www\.|\.com\b|\.in\b|\.net\b|\.org\b|t\.me|wa\.me|bit\.ly)/i;
const COLORS = ['#E0531F','#0E7470','#A8285A','#5B5BD6','#B7791F','#2F855A','#C05621','#2B6CB0','#805AD5','#D53F8C'];
const ls = { get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}} };

/* ---------- styles ---------- */
const css = `
#dk-comments{max-width:880px;margin:28px auto 8px;padding:0 16px;font-family:var(--f-body,system-ui);color:var(--ink,#1B2350)}
#dk-comments *{box-sizing:border-box}
.yc-card{background:var(--card,#fff);border:1px solid var(--line,#DDE1F0);border-radius:18px;padding:20px 20px 8px}
.yc-head{display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin-bottom:18px}
.yc-head h2{font:700 21px var(--f-display,system-ui);margin:0}
.yc-sort{position:relative}
.yc-sort>button{display:flex;align-items:center;gap:8px;background:none;border:0;color:inherit;font:600 15px var(--f-body,system-ui);cursor:pointer;padding:4px 2px}
.yc-sort>button svg{width:22px;height:22px}
.yc-menu{position:absolute;top:110%;left:0;background:var(--card,#fff);border:1px solid var(--line,#DDE1F0);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.15);padding:6px 0;z-index:20;min-width:170px;display:none}
.yc-menu.open{display:block}
.yc-menu button{display:block;width:100%;text-align:left;background:none;border:0;padding:10px 16px;font:500 15px var(--f-body,system-ui);color:inherit;cursor:pointer}
.yc-menu button.on,.yc-menu button:hover{background:var(--teal-soft,#E2F4F2)}
.yc-av{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:#fff;font:700 17px var(--f-display,system-ui);text-transform:uppercase}
.yc-av.sm{width:26px;height:26px;font-size:12px}
.yc-new{display:flex;gap:14px;align-items:flex-start;margin-bottom:22px}
.yc-form{flex:1;min-width:0}
.yc-form textarea{width:100%;border:0;border-bottom:1px solid var(--line,#ccc);background:transparent;color:inherit;font:16px var(--f-body,system-ui);padding:8px 0 6px;resize:none;outline:none;min-height:34px;line-height:1.45}
.yc-form textarea:focus{border-bottom:2px solid var(--ink,#1B2350)}
.yc-extra{display:none;margin-top:10px;gap:10px;flex-wrap:wrap;align-items:center}
.yc-form.open .yc-extra{display:flex}
.yc-extra input,.yc-extra select{border:1px solid var(--line,#ccc);background:var(--paper,#F6F7FB);color:inherit;border-radius:10px;padding:8px 10px;font:15px var(--f-body,system-ui);min-width:0}
.yc-extra input{flex:1 1 160px}
.yc-extra select{flex:1 1 200px;max-width:100%}
.yc-btns{display:flex;gap:8px;margin-left:auto}
.yc-btn{border:0;border-radius:999px;padding:9px 16px;font:600 14.5px var(--f-body,system-ui);cursor:pointer;background:none;color:inherit}
.yc-btn:hover{background:var(--teal-soft,#eee)}
.yc-btn.go{background:#065FD4;color:#fff}
.yc-btn.go:disabled{background:var(--line,#ddd);color:var(--muted,#888);cursor:default}
.yc-err{width:100%;color:var(--bad,#B42318);font-size:14px;min-height:0}
.yc-item{display:flex;gap:14px;margin:0 0 18px}
.yc-body{flex:1;min-width:0}
.yc-meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;font-size:13.5px;color:var(--muted,#606060)}
.yc-meta b{font-weight:600;color:var(--ink,#0f0f0f);font-size:14px}
.yc-meta .yc-own{background:var(--muted,#606060);color:var(--card,#fff);border-radius:999px;padding:0 8px;font-size:12.5px}
.yc-chip{display:inline-block;margin-top:3px;font:600 11.5px var(--f-mono,monospace);color:var(--teal,#0E7470);background:var(--teal-soft,#E2F4F2);border-radius:999px;padding:1px 8px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.yc-text{margin:4px 0 2px;font-size:15.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}
.yc-more{background:none;border:0;padding:0;font:600 14px var(--f-body,system-ui);color:var(--muted,#606060);cursor:pointer}
.yc-acts{display:flex;align-items:center;gap:4px;margin-left:-8px}
.yc-acts button{display:flex;align-items:center;gap:6px;background:none;border:0;border-radius:999px;padding:6px 8px;color:inherit;font:500 13px var(--f-body,system-ui);cursor:pointer}
.yc-acts button:hover{background:var(--teal-soft,#eee)}
.yc-acts svg{width:20px;height:20px}
.yc-acts .liked svg{fill:var(--ink,#0f0f0f)}
.yc-acts .yc-rp{font-weight:600;padding:6px 12px}
.yc-tog{display:flex;align-items:center;gap:6px;background:none;border:0;border-radius:999px;padding:7px 12px;margin-left:-12px;color:#065FD4;font:600 14.5px var(--f-body,system-ui);cursor:pointer}
.yc-tog:hover{background:#DEF1FF}
.yc-tog svg{width:20px;height:20px;transition:transform .2s}
.yc-tog.open svg{transform:rotate(180deg)}
.yc-replies{margin-top:8px}
.yc-replies .yc-item{margin-bottom:12px}
.yc-rform{display:flex;gap:10px;margin:6px 0 12px}
.yc-load{display:block;margin:4px auto 14px;border:1px solid var(--line,#ccc);background:none;color:inherit;border-radius:999px;padding:9px 18px;font:600 14.5px var(--f-body,system-ui);cursor:pointer}
.yc-empty{color:var(--muted,#606060);text-align:center;padding:10px 0 20px}
.yc-demo{font-size:12.5px;color:var(--gold-ink,#8A5A00);background:var(--gold-soft,#FFF3D6);border-radius:10px;padding:6px 10px;margin:-6px 0 16px}
@media (prefers-color-scheme:dark){.yc-tog,.yc-btn.go{color:#3EA6FF}.yc-btn.go{background:#3EA6FF;color:#0f0f0f}.yc-tog:hover{background:#263850}}
@media (max-width:520px){.yc-card{padding:16px 14px 4px;border-radius:14px}.yc-av{width:34px;height:34px;font-size:15px}.yc-new,.yc-item{gap:10px}.yc-btns{margin-left:0;width:100%;justify-content:flex-end}}
`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

/* ---------- helpers ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colorOf=n=>{let h=0;for(const c of String(n))h=(h*31+c.charCodeAt(0))>>>0;return COLORS[h%COLORS.length]};
const initial=n=>(String(n).trim()[0]||'?');
function ago(ms){const s=Math.max(1,(Date.now()-ms)/1000);
  const u=[[31536000,'saal'],[2592000,'mahine'],[604800,'hafte'],[86400,'din'],[3600,'ghante'],[60,'minute']];
  for(const [d,w] of u){if(s>=d){const n=Math.floor(s/d);return `${n} ${w} pehle`;}} return 'abhi abhi';}
const fmt=n=>n>=1000?(n/1000).toFixed(n>=10000?0:1).replace('.0','')+'K':String(n);
const I={
 like:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 10v11H3V10h4Zm0 0 4-8c1.7 0 3 1.3 3 3v3h5.2a2 2 0 0 1 2 2.4l-1.6 8A2 2 0 0 1 17.6 21H7"/></svg>',
 dis:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M17 14V3h4v11h-4Zm0 0-4 8c-1.7 0-3-1.3-3-3v-3H4.8a2 2 0 0 1-2-2.4l1.6-8A2 2 0 0 1 6.4 3H17"/></svg>',
 sort:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3zm0 5h12v2H3zm0 5h6v2H3z"/></svg>',
 down:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>'};
function chapters(){return [...document.querySelectorAll('article[id^="ch"] h2, section[id^="ch"] h2, .chapter h2')].map(h=>h.textContent.trim()).filter(Boolean).slice(0,40);}
function check(name,text){
  if(name.trim().length<2) return 'Apna naam likho (kam se kam 2 akshar).';
  if(text.trim().length<2) return 'Comment khaali hai.';
  if(text.length>800) return 'Comment 800 akshar se chhota rakho.';
  const low=(' '+name+' '+text+' ').toLowerCase();
  if(BAD.some(w=>low.includes(w))) return 'Kripya achchhi bhasha mein likho 🙏';
  if(LINK.test(text)) return 'Comment mein link nahi daal sakte.';
  const last=ls.get('dk_last',0); if(Date.now()-last<30000) return 'Thoda ruko — 30 second mein ek comment.';
  return '';}

/* ---------- data layer (Firebase or demo) ---------- */
let db=null;
const store={
 async list(){
  if(db){const q=await db.collection('comments').where('page','==',PAGE).limit(500).get();
    return q.docs.map(d=>{const x=d.data();return {id:d.id,...x,ts:x.ts&&x.ts.toMillis?x.ts.toMillis():Date.now()}});}
  return ls.get('dk_demo_'+PAGE,null)||seed();},
 async add(c){
  if(db){const r=await db.collection('comments').add({...c,ts:firebase.firestore.FieldValue.serverTimestamp()});return {id:r.id,...c,ts:Date.now()};}
  const all=await store.list();const n={id:'d'+Date.now(),...c,ts:Date.now()};all.push(n);ls.set('dk_demo_'+PAGE,all);return n;},
 async like(id,delta){
  if(db){return db.collection('comments').doc(id).update({likes:firebase.firestore.FieldValue.increment(delta)});}
  const all=await store.list();const c=all.find(x=>x.id===id);if(c){c.likes=(c.likes||0)+delta;ls.set('dk_demo_'+PAGE,all);}}
};
function seed(){const H=3600e3,now=Date.now();return [
 {id:'s1',name:'Priya Sharma',text:'Sir ye gaane wala idea bahut mast hai 😍 Democracy ka gaana ek baar mein yaad ho gaya!',chapter:'Democracy',likes:248,parent:null,ts:now-2*H},
 {id:'s2',name:'Aman Yadav',text:'Class 10 ke notes kab aayenge? Board exam ke liye chahiye 🙏',chapter:'',likes:131,parent:null,ts:now-5*H},
 {id:'s3',name:'Dus Kadam Itihaas Ke',text:'Jaldi aa rahe hain Aman! Channel follow kar lo taaki miss na ho 🔥',chapter:'',likes:56,parent:'s2',ts:now-4*H,own:true},
 {id:'s4',name:'Ritika',text:'Mera bhi yahi sawaal tha 😄',chapter:'',likes:9,parent:'s2',ts:now-3*H},
 {id:'s5',name:'Sahil Verma',text:'PPC wala graph pehle samajh nahi aata tha, ab jau-gehun ki misaal se clear ho gaya. Thank you!',chapter:'Building Blocks in Economics: The Problem of Choice',likes:87,parent:null,ts:now-26*H},
 {id:'s6',name:'Neha Gupta',text:'Saraighat ki ladaai 1671 — Lachit Borphukan. Trick se yaad ho gaya ✅',chapter:'Resistance and Resilience (1000–1700 CE)',likes:42,parent:null,ts:now-3*86400e3}];}

/* ---------- state + render ---------- */
let all=[],sort='top',shown=20,openReplies=new Set();
const likedSet=new Set(ls.get('dk_liked',[]));
const myName=()=>ls.get('dk_name','');
root.innerHTML='<div class="yc-card"><div class="yc-head"><h2>Comments</h2></div><div class="yc-empty">Comments load ho rahe hain…</div></div>';

function formHTML(isReply){
 const chs=chapters();
 return `<div class="yc-form${isReply?' open':''}">
  <textarea rows="1" maxlength="800" placeholder="${isReply?'Reply likho…':'Comment likho… (doubt, sawaal ya feedback)'}"></textarea>
  <div class="yc-extra">
   <input class="yc-name" maxlength="40" placeholder="Tumhara naam" value="${esc(myName())}">
   ${!isReply&&chs.length?`<select class="yc-ch"><option value="">Chapter chuno (optional)</option>${chs.map(c=>`<option>${esc(c)}</option>`).join('')}</select>`:''}
   <div class="yc-btns"><button class="yc-btn yc-cancel" type="button">Cancel</button><button class="yc-btn go yc-post" type="button" disabled>${isReply?'Reply':'Comment'}</button></div>
   <div class="yc-err"></div>
  </div></div>`;}

function itemHTML(c,reply){
 const kids=all.filter(x=>x.parent===c.id).sort((a,b)=>a.ts-b.ts);
 const liked=likedSet.has(c.id);
 const long=c.text.length>300;
 return `<div class="yc-item" data-id="${c.id}">
  <div class="yc-av${reply?' sm':''}" style="background:${c.own?'#1B2350':colorOf(c.name)}">${esc(initial(c.name))}</div>
  <div class="yc-body">
   <div class="yc-meta">${c.own?`<span class="yc-own">@${esc(c.name)}</span>`:`<b>@${esc(c.name)}</b>`}<span>${ago(c.ts)}</span></div>
   ${c.chapter?`<span class="yc-chip">📖 ${esc(c.chapter)}</span>`:''}
   <div class="yc-text">${esc(long?c.text.slice(0,300)+'…':c.text)}</div>${long?`<button class="yc-more" data-full="1">Aur padho</button>`:''}
   <div class="yc-acts">
    <button class="yc-like${liked?' liked':''}" aria-label="Like">${I.like}<span>${(c.likes||0)>0?fmt(c.likes):''}</span></button>
    <button class="yc-dis" aria-label="Dislike">${I.dis}</button>
    <button class="yc-rp">Reply</button>
   </div>
   <div class="yc-rslot"></div>
   ${!reply&&kids.length?`<button class="yc-tog${openReplies.has(c.id)?' open':''}">${I.down}${kids.length} ${kids.length>1?'replies':'reply'}</button>
   <div class="yc-replies"${openReplies.has(c.id)?'':' hidden'}>${kids.map(k=>itemHTML(k,true)).join('')}</div>`:''}
  </div></div>`;}

function render(){
 const top=all.filter(c=>!c.parent);
 const score=c=>(c.likes||0)+all.filter(x=>x.parent===c.id).length*3;
 top.sort(sort==='top'?(a,b)=>score(b)-score(a)||b.ts-a.ts:(a,b)=>b.ts-a.ts);
 const total=all.length;
 root.innerHTML=`<div class="yc-card">
  <div class="yc-head"><h2>${total.toLocaleString('en-IN')} ${total===1?'Comment':'Comments'}</h2>
   <div class="yc-sort"><button type="button" class="yc-sbtn">${I.sort}Sort by</button>
    <div class="yc-menu"><button data-s="top" class="${sort==='top'?'on':''}">Top comments</button><button data-s="new" class="${sort==='new'?'on':''}">Newest first</button></div></div></div>
  ${db?'':'<div class="yc-demo">Demo mode — ye sample comments hain. Firebase judne ke baad asli comments dikhenge.</div>'}
  <div class="yc-new"><div class="yc-av" style="background:${myName()?colorOf(myName()):'#8A8FB0'}">${esc(initial(myName()||'?'))}</div>${formHTML(false)}</div>
  <div class="yc-list">${top.length?top.slice(0,shown).map(c=>itemHTML(c,false)).join(''):'<div class="yc-empty">Abhi koi comment nahi — pehla comment tum karo! ✍️</div>'}</div>
  ${top.length>shown?'<button class="yc-load">Aur comments dekho</button>':''}
 </div>`;}

function wireForm(form,parent){
 const ta=form.querySelector('textarea'),nm=form.querySelector('.yc-name'),post=form.querySelector('.yc-post'),err=form.querySelector('.yc-err');
 const upd=()=>{post.disabled=!ta.value.trim();ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';};
 ta.addEventListener('focus',()=>form.classList.add('open'));
 ta.addEventListener('input',upd);
 form.querySelector('.yc-cancel').onclick=()=>{if(parent){form.parentElement.innerHTML='';}else{ta.value='';form.classList.remove('open');upd();err.textContent='';}};
 post.onclick=async()=>{
  const e=check(nm.value,ta.value); if(e){err.textContent=e;return;}
  post.disabled=true;err.textContent='';
  const ch=form.querySelector('.yc-ch');
  try{const n=await store.add({page:PAGE,name:nm.value.trim().slice(0,40),text:ta.value.trim().slice(0,800),chapter:ch?ch.value:'',likes:0,parent:parent||null});
   ls.set('dk_name',nm.value.trim());ls.set('dk_last',Date.now());
   all.push(n); if(parent) openReplies.add(parent); else sort='new'; render();
  }catch(x){err.textContent='Comment nahi gaya — internet check karke dobara try karo.';post.disabled=false;}
 };}

root.addEventListener('click',async ev=>{
 const t=ev.target.closest('button'); if(!t) return;
 const item=t.closest('.yc-item'); const id=item&&item.dataset.id;
 if(t.classList.contains('yc-sbtn')){root.querySelector('.yc-menu').classList.toggle('open');return;}
 if(t.dataset.s){sort=t.dataset.s;render();return;}
 if(t.classList.contains('yc-load')){shown+=20;render();return;}
 if(t.classList.contains('yc-more')){const c=all.find(x=>x.id===id);item.querySelector('.yc-text').textContent=c.text;t.remove();return;}
 if(t.classList.contains('yc-tog')){openReplies.has(id)?openReplies.delete(id):openReplies.add(id);render();return;}
 if(t.classList.contains('yc-like')){
  const c=all.find(x=>x.id===id); const on=likedSet.has(id); const d=on?-1:1;
  on?likedSet.delete(id):likedSet.add(id); ls.set('dk_liked',[...likedSet]); c.likes=Math.max(0,(c.likes||0)+d);
  t.classList.toggle('liked',!on); t.querySelector('span').textContent=c.likes>0?fmt(c.likes):'';
  try{await store.like(id,d)}catch(e){} return;}
 if(t.classList.contains('yc-rp')){
  const c=all.find(x=>x.id===id); const parent=c.parent||c.id;
  const slot=item.querySelector('.yc-rslot');
  slot.innerHTML=`<div class="yc-rform"><div class="yc-av sm" style="background:${myName()?colorOf(myName()):'#8A8FB0'}">${esc(initial(myName()||'?'))}</div>${formHTML(true)}</div>`;
  const f=slot.querySelector('.yc-form'); const ta=f.querySelector('textarea'); if(c.parent) ta.value='@'+c.name+' ';
  wireForm(f,parent); ta.focus(); return;}
});
document.addEventListener('click',e=>{if(!e.target.closest('.yc-sort')){const m=root.querySelector('.yc-menu');m&&m.classList.remove('open');}});
const obs=new MutationObserver(()=>{const f=root.querySelector('.yc-new .yc-form');if(f&&!f.dataset.w){f.dataset.w=1;wireForm(f,null);}});
obs.observe(root,{childList:true,subtree:true});

/* ---------- boot: load only when user scrolls near comments (saves free quota) ---------- */
async function boot(){
 if(DK_FIREBASE){
  try{
   await load('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
   await load('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
   if(!firebase.apps.length) firebase.initializeApp(DK_FIREBASE);
   db=firebase.firestore();
  }catch(e){db=null;}
 }
 try{all=await store.list();}catch(e){all=[];}
 render();}
function load(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();boot();}},{rootMargin:'600px'});io.observe(root);}else boot();
})();
