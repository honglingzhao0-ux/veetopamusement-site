import pathlib, subprocess, sys, os, time

repo = pathlib.Path(__file__).resolve().parent.parent
out = repo / 'tmp_childtest.txt'
out.write_text('', encoding='utf-8')

NODE = r'C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe'

# 1) plain node
r = subprocess.run([NODE, '-e', 'console.log("plain-ok")'], capture_output=True, timeout=60)
out.write_text(out.read_text(encoding='utf-8')
               + 'plain rc=%s out=%r err=%r\n' % (r.returncode, r.stdout[:200], r.stderr[:200]),
               encoding='utf-8')

# 2) node that spawns a detached child writing to a file
js = repo / 'tmp_child.js'
js.write_text("""
const {spawn}=require('child_process');
const fs=require('fs');
const c=spawn(process.execPath,['-e','setTimeout(()=>{},3000)'],{stdio:'ignore',detached:true});
c.unref();
fs.appendFileSync(process.argv[2],'spawned pid='+c.pid+'\\n');
""", encoding='utf-8')

r2 = subprocess.run([NODE, str(js), str(out)], capture_output=True, timeout=60)
out.write_text(out.read_text(encoding='utf-8')
               + 'spawn-parent rc=%s out=%r err=%r\n' % (r2.returncode, r2.stdout[:200], r2.stderr[:200]),
               encoding='utf-8')

# 3) node that spawns a child with stdout piped (like next's worker pool)
js2 = repo / 'tmp_child2.js'
js2.write_text("""
const {spawn}=require('child_process');
const fs=require('fs');
const c=spawn(process.execPath,['-e','console.log("child-hello")'],{stdio:['ignore','pipe','pipe']});
let o=''; c.stdout.on('data',d=>o+=d);
c.on('exit',code=>{fs.appendFileSync(process.argv[2],'piped-child exit='+code+' stdout='+o+'\\n');});
""", encoding='utf-8')

r3 = subprocess.run([NODE, str(js2), str(out)], capture_output=True, timeout=60)
out.write_text(out.read_text(encoding='utf-8')
               + 'piped-parent rc=%s err=%r\n' % (r3.returncode, r3.stderr[:200]),
               encoding='utf-8')

time.sleep(4)
out.write_text(out.read_text(encoding='utf-8') + '--- FINAL ---\n', encoding='utf-8')
