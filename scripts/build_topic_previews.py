"""Create per-topic social cards from the catalogue (Pillow, no browser required)."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
fonts=[Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf'),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')]
font=next((p for p in fonts if p.exists()),None)
def face(size):return ImageFont.truetype(str(font),size) if font else ImageFont.load_default(size=size)
for topic in json.loads((ROOT/'assets/lessons.json').read_text()):
 image=Image.new('RGB',(1200,630),'#f5f7fa');draw=ImageDraw.Draw(image)
 draw.rectangle((0,0,24,630),fill='#1f4e8c');draw.rectangle((0,500,1200,630),fill='#1f4e8c');draw.text((76,64),'Kupas',font=face(44),fill='#1f4e8c');draw.text((76+draw.textlength('Kupas',font=face(44)),64),'AI',font=face(44),fill='#b07f00');draw.rectangle((76,126,196,132),fill='#f2b705')
 words=topic['title'].split();lines=[];line=''
 for word in words:
  candidate=(line+' '+word).strip()
  if draw.textlength(candidate,font=face(56))>1030 and line:lines.append(line);line=word
  else:line=candidate
 lines.append(line)
 y=190
 for line in lines:draw.text((76,y),line,font=face(56),fill='#163a6b');y+=72
 draw.text((76,548),'Visualisasi interaktif • Bahasa Indonesia',font=face(29),fill='#ffffff')
 image.save(ROOT/'assets/img'/('og-'+topic['slug'].replace('/','-')+'.png'),optimize=True)
print('Generated 39 topic preview cards')
