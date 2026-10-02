// Local chalane ke liye: npm start  ->  http://localhost:3000
const express=require('express'),path=require('path'),app=require('./app'),PORT=process.env.PORT||3000;
app.use(express.static(path.join(__dirname,'public')));
app.getDb().then(()=>app.listen(PORT,()=>console.log('Server chalu: http://localhost:'+PORT)))
.catch(e=>{console.error('MongoDB connect nahi hua:',e.message);process.exit(1)});
