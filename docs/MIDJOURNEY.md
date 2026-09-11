# Промты для Midjourney

Картинки под лендинг. Файлы кладём в `assets/img/` **под теми же именами**
(только расширение `.jpg` вместо `.svg`) — тогда я переключу пути одной правкой.

## Общий стиль

Хвост, который добавляется к каждому промту, — он держит всю серию в одной палитре:

```
warm cream and sand palette, soft plum and sage-mint accents, natural window light,
shallow depth of field, 35mm film photography, Kodak Portra 400, fine grain,
calm editorial mood, muted desaturated colors --style raw --stylize 250 --v 7
```

Плюс всегда: `--no text, letters, watermark, logo, harsh shadows, cold blue tint, clinical white`

> **Важно:** Midjourney не сделает портрет Тетяны — это конкретный человек.
> Все слоты с её лицом (герой, «Про мене») закрываются только настоящей
> фотосъёмкой. Midjourney хорош для атмосферы: кабинет, кресло, детали,
> обложки дописов.

---

## 1. `hero.jpg` — главный экран · `--ar 16:10` ✅ готово

Левая треть кадра должна остаться пустой: поверх неё ложится заголовок.

```
sunlit corner of a cozy therapy room, one soft empty armchair beside a tall arched
window, sheer linen curtain moving slightly, potted olive tree, warm cream walls,
morning light pooling on a wooden floor, wide shot, subject on the right side,
empty calm space on the left third --ar 16:10
```

## 2. `about.jpg` — портрет в блоке «Про мене» · `--ar 4:5`

Лучше живое фото Тетяны. Если нужна временная атмосферная замена:

```
two armchairs facing each other at a low table, soft knitted throw, ceramic mug,
warm afternoon light through a window, quiet intimate room, vertical composition --ar 4:5
```

## 3. `good.jpg` — маленькая арка в блоке «Вам може стати легше» · `--ar 3:4` ✅ готово (букет)

```
close-up of hands cradling a warm ceramic mug, knitted sleeve, soft daylight,
blurred plant in the background, gentle and hopeful --ar 3:4
```

## 4. `stats.jpg` — тёмная подложка под статистику · `--ar 16:9` ✅ готово

Поверх ложится тёмно-сливовый слой и белый текст, поэтому кадр нужен тёмный и спокойный.

```
moody interior of an empty consulting room at dusk, deep plum walls, low warm lamp,
long soft shadows, minimal furniture, low key, lots of negative space --ar 16:9
```

## 5. Карточки форматов работы · `--ar 3:2`

`card-1.jpg` — индивидуальная терапия:
```
single upholstered armchair by a window, small side table with a glass of water,
soft morning light, calm empty room, warm neutral tones --ar 3:2
```

`card-2.jpg` — работа с парой:
```
two armchairs side by side facing the viewer, a small table between them with two cups,
warm living room light, no people --ar 3:2
```

`card-3.jpg` — поддерживающие консультации:
```
open notebook, fountain pen and a cup of herbal tea on a linen tablecloth,
dried eucalyptus branch, soft window light, top-down view --ar 3:2
```

## 6. Обложки дописов · `--ar 3:4`

`post-1.jpg` — дневник и тревога:
```
open journal with handwriting blurred out, pen resting on the page, linen surface,
morning light and soft shadow of a window frame, vertical --ar 3:4
```

`post-2.jpg` — разговор с партнёром:
```
two pairs of hands resting on a wooden table across from each other, two mugs,
faces out of frame, warm soft light, intimate quiet conversation --ar 3:4
```

`post-3.jpg` — усталость и выгорание:
```
a candle burned almost to the end beside a wilting eucalyptus branch, warm dim light,
dark cream background, quiet melancholic still life, vertical --ar 3:4
```

---

## Что делать с результатом

1. Скачать в максимальном разрешении (Upscale → Web).
2. Сжать — например, на squoosh.app, до 200–400 КБ, формат `.jpg`.
3. Положить в `assets/img/` под именами выше.
4. Сказать мне — я переключу пути в разметке и подгоню кадрирование.

Осталось: `about.jpg` (портрет), `card-1..3.jpg`, `post-1..3.jpg` —
под ними пока временные SVG-иллюстрации в той же палитре.

Присланные PNG пережаты в JPEG (~130–200 КБ вместо 1,4–2 МБ): PNG такого
веса тормозил бы загрузку страницы. Оригиналы остались в истории `main`.
