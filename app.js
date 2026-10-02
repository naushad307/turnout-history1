require('dotenv').config();
const express=require('express'),cors=require('cors'),{MongoClient}=require('mongodb');
const TABS=['c','s','cr','sr'],KEY=process.env.API_KEY||'';
let dbp;
const getDb=()=>dbp||(dbp=(async()=>{const c=await new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017').connect();
const db=c.db(process.env.DB_NAME||'track_history');await db.collection('records').createIndex({tab:1,id:1},{unique:true});return db})().catch(e=>{dbp=null;throw e}));
const app=express();app.use(cors(),express.json({limit:'20mb'}));
app.use('/api',(q,s,n)=>KEY&&q.get('x-api-key')!==KEY?s.status(401).json({error:'bad api key'}):n());
app.get('/api/health',async(q,s)=>{try{await getDb();s.json({ok:true,db:true})}catch(e){s.status(500).json({ok:false,error:e.message})}});
// MongoDB -> App
app.get('/api/data',async(q,s)=>{try{const db=await getDb(),rec=db.collection('records'),cfg=db.collection('config');
const m=await cfg.findOne({_id:'meta'});if(!m)return s.json({empty:true});
const D={t:{},g:m.g||[],o:m.o||[],n:m.n,rev:m.rev||0};
for(const k of TABS){const c=await cfg.findOne({_id:'cols_'+k});D.t[k]={r:await rec.find({tab:k}).project({_id:0,tab:0}).toArray(),cols:c?c.cols:undefined}}
s.json(D)}catch(e){console.error(e);s.status(500).json({error:e.message})}});
// App -> MongoDB
app.put('/api/data',async(q,s)=>{try{const D=q.body;if(!D||!D.t)return s.status(400).json({error:'bad data'});
const db=await getDb(),rec=db.collection('records'),cfg=db.collection('config');
const m=await cfg.findOne({_id:'meta'}),cur=m?m.rev||0:0;
if(!D.force&&m&&(D.rev||0)!==cur)return s.status(409).json({error:'conflict',rev:cur});
for(const k of TABS){const t=D.t[k]||{r:[],cols:[]},ids=[];
const ops=(t.r||[]).map(r=>{ids.push(r.id);return{replaceOne:{filter:{tab:k,id:r.id},replacement:{...r,tab:k},upsert:true}}});
if(ops.length)await rec.bulkWrite(ops,{ordered:false});
await rec.deleteMany({tab:k,id:{$nin:ids}});
if(t.cols)await cfg.replaceOne({_id:'cols_'+k},{_id:'cols_'+k,cols:t.cols},{upsert:true})}
const rev=cur+1;await cfg.replaceOne({_id:'meta'},{_id:'meta',g:D.g||[],o:D.o||[],n:D.n,rev,updated:new Date()},{upsert:true});
s.json({ok:true,rev})}catch(e){console.error(e);s.status(500).json({error:e.message})}});
app.getDb=getDb;module.exports=app;
