import subprocess, pathlib, os, sys, time, threading

NODE = r'C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe'
repo = pathlib.Path(__file__).resolve().parent.parent

env = dict(os.environ)
env['PATH'] = r'C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6' + os.pathsep + env.get('PATH', '')
env['NEXT_TELEMETRY_DISABLED'] = '1'
env['CODEBUDDY_SAFE_DELETE_ENABLED'] = '0'
env['NEXT_TRACE_UPLOAD_DISABLED'] = '1'

outf = repo / 'tmp_build_stderr.txt'
errf = repo / 'tmp_build_stderr2.txt'
outf.write_text('', encoding='utf-8')
errf.write_text('', encoding='utf-8')

proc = subprocess.Popen([NODE, 'node_modules/next/dist/bin/next', 'build'], cwd=str(repo),
                        stdout=open(outf, 'wb'), stderr=open(errf, 'wb'), env=env)

watch = repo / 'tmp_build_watch.txt'
t0 = time.time()
for i in range(120):
    if proc.poll() is not None:
        break
    time.sleep(1)
    if proc.poll() is None:
        with open(watch, 'a', encoding='utf-8') as fh:
            fh.write('alive %.1fs\n' % (time.time() - t0))

rc = proc.poll()
watch.write_text('final rc=%s at %.1fs\n' % (rc, time.time() - t0), encoding='utf-8')
