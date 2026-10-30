import subprocess, sys, pathlib, os, time

NODE = r'C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6\node.exe'
repo = pathlib.Path(__file__).resolve().parent.parent
log = (repo / sys.argv[1]).resolve()
args = sys.argv[2:]

env = dict(os.environ)
env['PATH'] = r'C:\Users\den\.workbuddy\binaries\node\versions\22.22.2-6' + os.pathsep + env.get('PATH', '')
env['NEXT_TELEMETRY_DISABLED'] = '1'
env['CODEBUDDY_SAFE_DELETE_ENABLED'] = '0'
env['NEXT_TRACE_UPLOAD_DISABLED'] = '1'

marker = log.with_suffix('.marker.txt')
marker.write_text('started %s\n' % time.strftime('%H:%M:%S'), encoding='utf-8')

with open(log, 'wb') as fh:
    proc = subprocess.Popen([NODE] + args, cwd=str(repo), stdout=fh, stderr=subprocess.STDOUT, env=env)
    rc = proc.wait()

log.with_suffix('.rc.txt').write_text('rc=%d\n' % rc, encoding='utf-8')
marker.write_text('done rc=%d %s\n' % (rc, time.strftime('%H:%M:%S')), encoding='utf-8')
sys.exit(rc)
