import ctypes, pathlib, time, subprocess, sys

repo = pathlib.Path(__file__).resolve().parent.parent
out = repo / 'tmp_lifetime.txt'

class M(ctypes.Structure):
    _fields_ = [('dwLength', ctypes.c_ulong), ('dwMemoryLoad', ctypes.c_ulong),
                ('ullTotalPhys', ctypes.c_ulonglong), ('ullAvailPhys', ctypes.c_ulonglong),
                ('ullTotalPageFile', ctypes.c_ulonglong), ('ullAvailPageFile', ctypes.c_ulonglong),
                ('ullTotalVirtual', ctypes.c_ulonglong), ('ullAvailVirtual', ctypes.c_ulonglong),
                ('ullAvailExtendedVirtual', ctypes.c_ulonglong)]

m = M()
m.dwLength = ctypes.sizeof(M)
ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))

lines = []
lines.append('mem_load_pct=%d total_phys=%.1fGB avail_phys=%.1fGB avail_page=%.1fGB'
             % (m.dwMemoryLoad, m.ullTotalPhys/2**30, m.ullAvailPhys/2**30, m.ullAvailPageFile/2**30))
lines.append('cpus=%d' % (os_cpu := len(__import__('os').sched_getaffinity(0)) if hasattr(__import__('os'), 'sched_getaffinity') else 0))
lines.append('python=%s' % sys.version)

# foreground survival test: append a heartbeat every 3s for 15 min
js = repo / 'tmp_lifetime.js'
js.write_text("""
const fs=require('fs');const t0=Date.now();
setInterval(()=>{fs.appendFileSync(process.argv[2], `tick ${Math.round((Date.now()-t0)/1000)}s\\n`);},3000);
""", encoding='utf-8')

out.write_text('\n'.join(lines) + '\n', encoding='utf-8')
p = subprocess.Popen([r'C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe',
                      str(js), str(out)])
p.wait()
out.write_text(out.read_text(encoding='utf-8') + 'NODE_EXITED rc=%s\n' % p.returncode, encoding='utf-8')
