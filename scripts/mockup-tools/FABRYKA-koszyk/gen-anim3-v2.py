# -*- coding: utf-8 -*-
"""ANIM-3 v2 po timeout 15 min fal: (1) RECLAIM oplaconego anim-zawieszony (re-poll darmowy,
rid w ledgerze), (2) gen_batch dla anim-mc (deadline 2400s — kolejka fal dzis wolna),
(3) web-kompresja obu + upload."""
import importlib.util, json, os, subprocess, sys, time, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ps', r'c:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py')
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
spec2 = importlib.util.spec_from_file_location('fal_client', r'c:\repos_tn\tn-crm\scripts\video-factory\fal.py')
fal = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(fal)

A = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
NEG = ('camera movement, zoom, pan, morphing product, deformed wire mesh, extra hands, '
       'flickering, color shift, text, watermark, fast motion, jump cut, people appearing')
OUT = os.path.join(HERE, 'assets')

# (1) reclaim anim-zawieszony (tag w ledgerze: 'odsaczek/anim-zawieszony' — bez prefiksu,
# bo set_project wolane w PADNIETYM procesie moglo nie zdazyc; szukam po obu formach)
led = json.load(open(fal.LEDGER, encoding='utf-8'))
ru = None
for c in reversed(led.get('calls', [])):
    if 'anim-zawieszony' in str(c.get('tag', '')) and c.get('response_url'):
        ru = c['response_url']; break
assert ru, 'brak anim-zawieszony w ledgerze'
raw1 = os.path.join(OUT, 'anim-zawieszony-raw.mp4')
for att in range(40):
    try:
        res = fal._post({'op': 'poll', 'url': ru})
    except Exception as e:
        print('[reclaim] blip:', str(e)[:80]); time.sleep(15); continue
    url = (res.get('video') or {}).get('url')
    if url:
        fal.download(url, raw1); print('[reclaim] anim-zawieszony OK'); break
    print('[reclaim] jeszcze nie gotowy (%d)' % att); time.sleep(20)
assert os.path.isfile(raw1), 'reclaim anim-zawieszony nie dociagnal'

# (2) anim-mc przez gen_batch (deadline 2400s)
jobs = [{'model': 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video', 'tag': 'anim-mc',
         'payload': {'prompt': ('Static camera, seamless subtle loop, morning kitchen counter: '
                                'soft dappled leaf shadows sway very gently across the counter and '
                                'the wall as if a light breeze moves leaves outside the window, warm '
                                'morning light breathes subtly. The folded steel wire basket stays '
                                'perfectly still, exact woven construction, no morphing, nothing else '
                                'moves. Loop returns to the exact first frame.'),
                     'image_url': A + 'bud-assets/odsaczek/assets/mc-scena.webp',
                     'duration': '5', 'negative_prompt': NEG, 'cfg_scale': 0.5}}]
done = fal.gen_batch(jobs, outdir=OUT, project='wf2-odsaczek', timeout_s=2400, poll_every=20)
raw2 = done.get('anim-mc')
assert isinstance(raw2, str) and os.path.isfile(raw2), 'anim-mc: %s' % str(done)[:200]
os.replace(raw2, os.path.join(OUT, 'anim-mc-raw.mp4'))
raw2 = os.path.join(OUT, 'anim-mc-raw.mp4')

# (3) kompresja + upload
for raw, outname in ((raw1, 'anim-zawieszony.mp4'), (raw2, 'anim-mc.mp4')):
    web = os.path.join(OUT, outname)
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'stream=width,height', '-of', 'csv=p=0', raw],
                           capture_output=True, text=True, check=True).stdout.strip()
    w, h = [int(x) for x in probe.split(',')[:2]]
    vf = "scale='-2:min(900,ih)'" if w >= h else "scale='min(900,iw):-2'"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-vf', vf,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', '-an', web], check=True)
    ps.storage_upload(web, 'bud-assets/odsaczek/assets/' + outname)
    print('OK', outname, os.path.getsize(web) // 1024, 'KB (%dx%d)' % (w, h))
print('KONIEC')
