import pathlib, time, threading, sys

repo = pathlib.Path(__file__).resolve().parent.parent
out = repo / 'tmp_fg_life.txt'
stop = threading.Event()

def beat():
    t0 = time.time()
    while not stop.is_set():
        with open(out, 'a', encoding='utf-8') as fh:
            fh.write('beat %.1fs\n' % (time.time() - t0))
        time.sleep(2)

out.write_text('python parent start\n', encoding='utf-8')
th = threading.Thread(target=beat, daemon=True)
th.start()
time.sleep(90)
stop.set()
out.write_text(out.read_text(encoding='utf-8') + 'python parent survived 90s\n', encoding='utf-8')
