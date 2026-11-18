#!/usr/bin/env python3
"""
Договір оферти: content/oferta.docx → content/oferta.html.

Текст договору переноситься дослівно — pandoc розбирає .docx, а цей
скрипт лише розставляє розмітку під стиль сайту: заголовки розділів,
блок «Коротко про головне», таблицю повернень, реквізити, додатки.
Ручної передруковки юридичного тексту немає.

Після кожної нової редакції договору:
    python3 scripts/oferta-html.py
    node scripts/oferta-pdf.mjs      # PDF із тієї самої сторінки

Скрипт перевіряє, що документ має очікувану будову, і падає з
поясненням, якщо щось змінилось, — замість того щоб тихо зламати сторінку.
"""
import html
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'content' / 'oferta.docx'
OUT = ROOT / 'content' / 'oferta.html'


def fail(msg):
    sys.exit(f'oferta-html: {msg}')


def sentence(text):
    """«1. ТЕРМІНИ» → «Терміни»: великі літерами заголовки в Playfair надто важкі."""
    t = text.strip().lower()
    return t[:1].upper() + t[1:]


raw = subprocess.run(['pandoc', str(SRC), '-t', 'html5', '--wrap=none'],
                     check=True, capture_output=True, text=True).stdout

# ---- шапку (назву й підзаголовок) малює сама сторінка, тут її знімаємо
head = re.match(r'<p><strong>(.+?)</strong></p>\n<p><strong>(.+?)</strong></p>\n', raw)
if not head or 'ОФЕРТА' not in head.group(1):
    fail('документ має починатися з назви «ПУБЛІЧНИЙ ДОГОВІР (ОФЕРТА)» і підзаголовка')
s = raw[head.end():]

# ---- редакція й дата розміщення
s, n = re.subn(r'^<p><em>(Редакція .+?)</em></p>', r'<p class="offer-edition">\1</p>', s, count=1)
if n != 1:
    fail('не знайдено рядок «Редакція від …» одразу після назви')

# ---- «Коротко про головне»: цитата з «• …» → картка зі списком
m = re.search(r'<p><strong>КОРОТКО ПРО ГОЛОВНЕ</strong></p>\n<blockquote>\n(.*?)</blockquote>\n', s, re.S)
if not m:
    fail('не знайдено блок «КОРОТКО ПРО ГОЛОВНЕ»')
items = re.findall(r'<p>•\s*(.*?)</p>', m.group(1))
s = s[:m.start()] + (
    '<section class="offer-summary">\n<h2 id="golovne">Коротко про головне</h2>\n<ul>\n'
    + ''.join(f'<li>{i}</li>\n' for i in items) + '</ul>\n</section>\n'
) + s[m.end():]

# ---- розділи «N. НАЗВА»
s, sections = re.subn(
    r'<p><strong>(\d+)\.\s+([^<]+)</strong></p>',
    lambda m: f'<h2 id="r{m.group(1)}"><span class="offer-num">{m.group(1)}.</span> {sentence(m.group(2))}</h2>',
    s)
if sections < 10:
    fail(f'знайдено лише {sections} розділів «N. НАЗВА» — будова документа змінилась')

# ---- перелік цін: абзаци з «– » поспіль → список
s = re.sub(r'(?:<p>–\s+.*?</p>\n)+',
           lambda m: '<ul class="offer-dash">\n' + ''.join(
               f'<li>{x}</li>\n' for x in re.findall(r'<p>–\s+(.*?)</p>', m.group(0))) + '</ul>\n',
           s)

# ---- таблиця: без colgroup, підписи колонок у кожній клітинці для вузьких екранів
m = re.search(r'<table>.*?</table>', s, re.S)
if m:
    t = re.sub(r'<colgroup>.*?</colgroup>\n?', '', m.group(0), flags=re.S)
    labels = [html.unescape(re.sub(r'<[^>]+>', '', x)).strip() for x in re.findall(r'<th>(.*?)</th>', t)]
    t = re.sub(r'<th><strong>(.*?)</strong></th>', r'<th>\1</th>', t)

    def label_row(row):
        cells = iter(labels)
        return re.sub(r'<td>', lambda _: f'<td data-label="{html.escape(next(cells, ""))}">', row.group(0))
    t = re.sub(r'<tr class="(?:odd|even)">.*?</tr>', label_row, t, flags=re.S)
    # Службові класи pandoc на рядках прибираємо: class="header" збігався з
    # шапкою сайту (.header { position: fixed }), і рядок заголовків таблиці
    # прилипав до верху екрана — а в PDF висів на кожній сторінці.
    t = re.sub(r'<tr class="(?:header|odd|even)">', '<tr>', t)
    s = s[:m.start()] + f'<div class="offer-table">\n{t}\n</div>' + s[m.end():]

# ---- додатки: «Додаток N» + «до Публічного договору …» + НАЗВА → один заголовок
s, appx = re.subn(
    r'<p><strong>Додаток (\d+)</strong></p>\n<p><strong>(до Публічного договору[^<]*)</strong></p>\n<p><strong>([^<]+)</strong></p>',
    lambda m: (f'<h2 id="dodatok-{m.group(1)}" class="offer-appx"><span class="offer-num">Додаток {m.group(1)}</span> '
               f'{sentence(m.group(3))}</h2>\n<p class="offer-appx-of">{m.group(2)}</p>'),
    s)

# ---- реквізити: жирні рядки після розділу 18 → картка
m = re.search(r'(<h2 id="r18">.*?</h2>\n)(.*?)(?=<h2 )', s, re.S)
if not m:
    fail('не знайдено розділ 18 з реквізитами')
req = re.sub(r'<p><strong>(.*?)</strong></p>', r'<p>\1</p>', m.group(2))
s = s[:m.start()] + m.group(1) + f'<div class="offer-req">\n{req}</div>\n' + s[m.end():]

# ---- решта жирних рядків без цифр — підзаголовки (рубрики гарячих ліній)
s = re.sub(r'<p><strong>([^<\d]+)</strong></p>', r'<h3>\1</h3>', s)

leftover = re.findall(r'<p><strong>[^<]*</strong></p>', s)
if leftover:
    fail('лишились нерозпізнані жирні рядки: ' + '; '.join(leftover[:3]))

OUT.write_text(
    '<!-- Згенеровано scripts/oferta-html.py з content/oferta.docx. Руками не правити. -->\n' + s,
    encoding='utf-8')
print(f'oferta-html: {sections} розділів, {appx} додатки, {len(items)} пунктів «коротко» → {OUT.relative_to(ROOT)}')
