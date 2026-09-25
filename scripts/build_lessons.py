"""Insert consistent learning aids. Idempotent, does not alter lesson algorithms."""
from pathlib import Path
from html import escape
import re
from lessons import LESSONS, STEPS
ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://github.com/FeliksMakarios/kupasai/tree/main/'
for topic,(prereq,minutes,origin,note,predict,transfer,reference) in LESSONS.items():
    page=ROOT/topic/'index.html';s=page.read_text()
    explore,compute=STEPS[topic]
    section=f'''<!-- learning-aid:start -->
<section class="learning-aid" aria-label="Panduan belajar mandiri">
<h2>Panduan Belajar Mandiri</h2>
<p><strong>Prasyarat:</strong> {escape(prereq)}. <strong>Durasi:</strong> sekitar {minutes} menit.</p>
<details><summary>Asal data dan batas contoh</summary><p>{escape(origin)}</p><p>{escape(note)}</p></details>
<ol><li><strong>Prediksi sebelum mencoba:</strong> {escape(predict)}</li>
<li><strong>Eksplorasi:</strong> {escape(explore)}</li>
<li><strong>Perhitungan:</strong> {escape(compute)}</li>
<li><strong>Refleksi dan transfer:</strong> {escape(transfer)}</li></ol>
<label for="reflection">Catatan belajar Anda</label><textarea id="reflection" rows="3" placeholder="Prediksi, hasil pengamatan, dan penjelasan Anda" aria-describedby="reflection-status"></textarea>
<p class="reflection-status" id="reflection-status">Catatan tersimpan otomatis di peramban ini saja.</p>
<p><a href="{escape(reference)}" target="_blank" rel="noopener">Rujukan utama</a> · <a href="{SOURCE+topic}" target="_blank" rel="noopener">Kode dan data pendamping</a></p>
<p class="source-note">Nomor modul mengacu pada urutan kuliah.</p>
</section><!-- learning-aid:end -->'''
    s=re.sub(r'<!-- learning-aid:start -->[\s\S]*?<!-- learning-aid:end -->\n?','',s)
    pos=s.find('</main>')
    if pos<0:pos=s.find('<footer')
    if pos<0:pos=s.find('</body>')
    s=s[:pos]+section+'\n'+s[pos:]
    page.write_text(s)
for course in ['ml','ml-lanjut','nlp','kecerdasan-komputasional']:
    p=ROOT/course/'index.html';s=p.read_text().replace('Estimasi Effort','Durasi Belajar')
    def duration(m):
        row=m.group();link=re.search(r'href="([^"#]+)',row)
        if not link:return row
        target=course+'/'+link[1].strip('/').replace('/index.html','')
        if target not in LESSONS:return row
        return re.sub(r'(<span class="effort-badge">).*?(</span>)',r'\g<1>'+str(LESSONS[target][1])+' menit'+r'\g<2>',row)
    s=re.sub(r'<tr>[\s\S]*?</tr>',duration,s)
    p.write_text(s)
print(f'Updated learning aids for {len(LESSONS)} topics')
