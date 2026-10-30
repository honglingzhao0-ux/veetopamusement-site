
const {spawn}=require('child_process');
const fs=require('fs');
const c=spawn(process.execPath,['-e','setTimeout(()=>{},3000)'],{stdio:'ignore',detached:true});
c.unref();
fs.appendFileSync(process.argv[2],'spawned pid='+c.pid+'\n');
