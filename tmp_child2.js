
const {spawn}=require('child_process');
const fs=require('fs');
const c=spawn(process.execPath,['-e','console.log("child-hello")'],{stdio:['ignore','pipe','pipe']});
let o=''; c.stdout.on('data',d=>o+=d);
c.on('exit',code=>{fs.appendFileSync(process.argv[2],'piped-child exit='+code+' stdout='+o+'\n');});
