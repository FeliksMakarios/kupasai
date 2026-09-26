"""Insert consistent learning aids. Idempotent, does not alter lesson algorithms."""
from pathlib import Path
from html import escape
import re
from lessons import LESSONS, STEPS
ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://github.com/FeliksMakarios/kupasai/tree/main/'
def learning_aid(topic):
    prereq,minutes,origin,note,predict,transfer,reference = LESSONS[topic]
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
    return section

if __name__ == '__main__':
    for topic in LESSONS:
        lab=ROOT/topic/'laboratorium/index.html'
        page=lab if lab.exists() else ROOT/topic/'index.html'
        s=page.read_text()
        pattern=r'<!-- learning-aid:start -->[\s\S]*?<!-- learning-aid:end -->'
        if re.search(pattern,s):s=re.sub(pattern,lambda _:learning_aid(topic),s)
        else:s=s.replace('</main>',learning_aid(topic)+'\n</main>')
        page.write_text(s)
    print(f'Updated learning aids for {len(LESSONS)} topics')
