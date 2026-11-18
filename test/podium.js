const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
new Function(html.match(/<script>([\s\S]*)<\/script>/)[1])();
const BB=globalThis.__BB;
(async()=>{ const st=await BB.tAuto(); const me=+process.argv[2]; if(!isNaN(me))st.me=me; fs.writeFileSync('/tmp/tst.json',JSON.stringify(st)); console.log('rank me', BB.tStandings(st).findIndex(r=>r.i===st.me)+1); })();
