"""Ingest: mp4 -> sceny (PySceneDetect) + klatki brzegowe + metryki rytmu -> ingest.json"""
import sys, json, os, subprocess
from scenedetect import detect, ContentDetector, AdaptiveDetector

def ingest(mp4, outdir):
    os.makedirs(outdir, exist_ok=True)
    scenes = detect(mp4, AdaptiveDetector())
    if len(scenes) <= 2:
        scenes = detect(mp4, ContentDetector(threshold=22.0))
    if not scenes:
        # ciagle ujecie bez ciec (walidacja glosnik: oba detektory daly 0) -> 1 scena = calosc
        from scenedetect import open_video
        v = open_video(mp4)
        from scenedetect.frame_timecode import FrameTimecode
        end = FrameTimecode(int(v.duration.get_frames()), v.frame_rate)
        scenes = [(FrameTimecode(0, v.frame_rate), end)]
    # duration via ffprobe
    dur = float(subprocess.check_output([
        'ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0', mp4
    ]).decode().strip())
    data = {'file': mp4, 'duration_s': round(dur,2), 'n_scenes': len(scenes),
            'cuts_per_min': round(max(len(scenes)-1,0)/(dur/60),1) if dur else None, 'scenes': []}
    for i,(a,b) in enumerate(scenes):
        s = {'i': i, 'start_s': round(a.get_seconds(),3), 'end_s': round(b.get_seconds(),3),
             'dur_s': round(b.get_seconds()-a.get_seconds(),3)}
        for tag, t in [('first', a.get_seconds()+0.04), ('mid', (a.get_seconds()+b.get_seconds())/2),
                       ('last', max(b.get_seconds()-0.08, a.get_seconds()))]:
            fp = os.path.join(outdir, f's{i:02d}_{tag}.jpg')
            subprocess.run(['ffmpeg','-v','quiet','-ss',str(t),'-i',mp4,'-frames:v','1','-q:v','2','-y',fp], check=True)
            s[tag] = fp
        data['scenes'].append(s)
    if data['scenes'] and max(s['dur_s'] for s in data['scenes']) > 0.4 * dur:
        data['warning'] = 'POD-SEGMENTACJA: najdluzsza scena >40% dlugosci — zrob reczna siatke klatek (fps=1) do mapowania beatow'
    with open(os.path.join(outdir,'ingest.json'),'w',encoding='utf-8') as f:
        json.dump(data,f,indent=1,ensure_ascii=False)
    print(json.dumps({k:v for k,v in data.items() if k!='scenes'} |
          {'scene_durs':[s['dur_s'] for s in data['scenes']]}, ensure_ascii=False))

if __name__ == '__main__':
    ingest(sys.argv[1], sys.argv[2])
