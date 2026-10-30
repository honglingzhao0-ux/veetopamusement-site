import ctypes, pathlib, os, subprocess, sys

repo = pathlib.Path(__file__).resolve().parent.parent
out = repo / 'probe_r02.txt'

class M(ctypes.Structure):
    _fields_ = [('dwLength', ctypes.c_ulong), ('dwMemoryLoad', ctypes.c_ulong),
                ('ullTotalPhys', ctypes.c_ulonglong), ('ullAvailPhys', ctypes.c_ulonglong),
                ('ullTotalPageFile', ctypes.c_ulonglong), ('ullAvailPageFile', ctypes.c_ulonglong),
                ('ullTotalVirtual', ctypes.c_ulonglong), ('ullAvailVirtual', ctypes.c_ulonglong),
                ('ullAvailExtendedVirtual', ctypes.c_ulonglong)]

m = M(); m.dwLength = ctypes.sizeof(M)
ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
lines = ['mem_load=%d%% total_phys=%.1fGB avail_phys=%.1fGB avail_pagefile=%.1fGB'
         % (m.dwMemoryLoad, m.ullTotalPhys/2**30, m.ullAvailPhys/2**30, m.ullAvailPageFile/2**30)]

# can we write into .next ?
try:
    t = repo / '.next' / '_probe_write.txt'
    t.write_text('ok', encoding='utf-8')
    lines.append('write .next: OK')
    t.unlink()
except Exception as e:
    lines.append('write .next FAILED: %r' % (e,))

# can we delete? (next build clears .next)
try:
    d = repo / '.next' / '_probe_dir'
    d.mkdir(exist_ok=True)
    (d / 'x.txt').write_text('x', encoding='utf-8')
    import shutil; shutil.rmtree(d)
    lines.append('rmtree .next subdir: OK')
except Exception as e:
    lines.append('rmtree .next subdir FAILED: %r' % (e,))

# can we write into out/ ?
try:
    t = repo / 'out' / '_probe_write.txt'
    t.write_text('ok', encoding='utf-8')
    lines.append('write out: OK')
    t.unlink()
except Exception as e:
    lines.append('write out FAILED: %r' % (e,))

# can we rmtree out/ entirely (publish.sh does rm -rf .next out) ?
try:
    import shutil
    tmpd = repo / 'out' / '_probe_rmtree'
    tmpd.mkdir(exist_ok=True)
    (tmpd / 'y.txt').write_text('y', encoding='utf-8')
    shutil.rmtree(tmpd)
    lines.append('rmtree out subdir: OK')
except Exception as e:
    lines.append('rmtree out subdir FAILED: %r' % (e,))

# does out/ have write-protected files?
lines.append('out file count=%d' % len(list((repo/'out').rglob('*'))))

out.write_text('\n'.join(lines), encoding='utf-8')
