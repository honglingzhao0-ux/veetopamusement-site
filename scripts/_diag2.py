import pathlib, subprocess, json, os

repo = pathlib.Path(__file__).resolve().parent.parent
out = repo / 'probe_r04.txt'
NODE = r'C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe'
lines = []

# 1) SWC native binding present?
swc_dir = repo / 'node_modules' / '@next'
lines.append('@next exists=' + str(swc_dir.exists()))
if swc_dir.exists():
    lines.append('@next entries=' + str(sorted(p.name for p in swc_dir.iterdir())))

# 2) load swc in-process
r = subprocess.run([NODE, '-e', 'const s=require("@next/swc-win32-x64-msvc"); console.log(Object.keys(s).slice(0,8).join(","))'],
                   cwd=str(repo), capture_output=True, timeout=120)
lines.append('swc-load rc=%s out=%r err=%r' % (r.returncode, r.stdout[:300], r.stderr[:600]))

# 3) network reachability (registry + vercel)
r2 = subprocess.run([NODE, '-e', '''
const https=require("https");
let done=0;
for (const u of ["https://registry.npmjs.org/","https://api.vercel.com/"]) {
  const req=https.get(u,{timeout:8000},res=>{console.log("HTTP "+res.statusCode+" "+u);res.resume();if(++done===2)process.exit(0);});
  req.on("error",e=>{console.log("ERR "+u+" "+e.message);if(++done===2)process.exit(0);});
  req.on("timeout",()=>{console.log("TIMEOUT "+u);req.destroy();if(++done===2)process.exit(0);});
}
setTimeout(()=>process.exit(0),15000);
'''], cwd=str(repo), capture_output=True, timeout=60)
lines.append('network rc=%s out=%r err=%r' % (r2.returncode, r2.stdout[:600], r2.stderr[:300]))

out.write_text('\n'.join(lines), encoding='utf-8')
