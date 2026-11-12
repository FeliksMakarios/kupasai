"""Markup shared by the page builders."""
COURSE_LABELS={'ml':'ML INF24042','ml-lanjut':'ML Lanjut INF24141','nlp':'NLP INF20161','kecerdasan-komputasional':'Kecerdasan Komputasional INF20052'}

def footer(rel):
    """Site footer for a page path such as 'nlp/rnn' or 'trek-belajar'."""
    label=COURSE_LABELS.get(rel.split('/')[0])
    text='KupasAI &copy; 2026'+(' &middot; '+label if label else '')
    return f'<footer class="footer">\n  <span>{text}</span>\n</footer>'

def ensure_footer(html,rel):
    """Add the footer after </main> when a page has none. Idempotent."""
    if '<footer' in html or '</main>' not in html:return html
    return html.replace('</main>','</main>\n\n'+footer(rel)+'\n',1)

def summary(text,limit=160):
    """Leading sentences of a description that fit a meta description."""
    out=''
    for sentence in text.replace('? ','?|').replace('. ','.|').split('|'):
        if out and len(out)+1+len(sentence)>limit:break
        out=(out+' '+sentence).strip()
    return out if len(out)<=limit else out[:limit-1].rsplit(' ',1)[0]+'…'
