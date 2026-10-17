import json,subprocess,sys,re
T=json.load(open('/home/claude/anat/app/tour-script.json'))
only=set(sys.argv[1:])
for i,s in enumerate(T):
    if only and s['id'] not in only: continue
    t=s['text'].replace('911','nine one one').replace('TOURMIN',open('mins').read().strip() if True else 'seven')
    open('t.txt','w').write(t)
    subprocess.run(f"piper -m /tmp/claude-0/tts/lessac.onnx --sentence-silence 0.3 -f {i:02d}.wav < t.txt",shell=True,check=True,capture_output=True)
    subprocess.run(f"ffmpeg -y -loglevel error -i {i:02d}.wav -ac 1 -ar 22050 -b:a 48k /home/claude/anat/app/tour/{i:02d}.mp3",shell=True,check=True)
    print(i,s['id'])
