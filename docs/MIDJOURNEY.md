# Промты для Midjourney

Файлы кладём в `public/assets/img/` **под теми же именами**, но с расширением
`.jpg` вместо `.svg` — я переключу пути одной правкой.

## Что уже есть

| Файл | Где |
|---|---|
| `hero.jpg` | главный экран лендинга |
| `stats.jpg` | подложка блока статистики |
| `good.jpg` | арка в блоке «Вам може стати легше» |

## Чего не хватает — семь картинок

| Файл | Где | Формат |
|---|---|---|
| `about.jpg` | портрет в блоке «Про мене» | `--ar 4:5` |
| `card-1.jpg` | карточка «Індивідуальна терапія» | `--ar 3:2` |
| `card-2.jpg` | карточка «Робота з парою» | `--ar 3:2` |
| `card-3.jpg` | карточка «Підтримувальні консультації» | `--ar 3:2` |
| `post-1.jpg` | обложка дописа про дневник | `--ar 3:4` |
| `post-2.jpg` | обложка дописа про разговор с партнёром | `--ar 3:4` |
| `post-3.jpg` | обложка дописа про выгорание | `--ar 3:4` |

---

## Общий стиль

Хвост добавляется к каждому промту — он держит серию в одной палитре
с уже готовыми `hero.jpg`, `stats.jpg` и `good.jpg`:

```
warm cream and sand palette, soft plum and sage-mint accents, natural window light,
shallow depth of field, 35mm film photography, Kodak Portra 400, fine grain,
calm editorial mood, muted desaturated colors --style raw --stylize 250 --v 7
--no text, letters, watermark, logo, harsh shadows, cold blue tint, clinical white
```

---

## 1. `about.jpg` — портрет · `--ar 4:5`

**Лучше живое фото Тетяни.** Midjourney не нарисует конкретного человека,
а на этом месте портрет работает как знакомство: клиент решает, идти или нет.

Временная замена, если фотосессии пока не было:

```
two armchairs facing each other at a low table, soft knitted throw, ceramic mug,
warm afternoon light through a window, quiet intimate room, vertical composition --ar 4:5
```

## 2. Карточки форматов работы · `--ar 3:2`

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

## 3. Обложки дописов · `--ar 3:4`

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

## Отдельно: иконка приложения

Кабинет открывают с телефона и добавляют на домашний экран — там нужна иконка.
Сейчас её нет, и система возьмёт скриншот страницы. Нужен **квадрат 1024×1024**,
простой знак, читаемый в размере ногтя:

```
minimalist app icon, single abstract sun-and-leaf mark, flat vector, thick soft lines,
deep plum symbol on warm cream background, centered, generous margins,
no gradient, no text --ar 1:1 --style raw --v 7
```

Сохранить как `public/icon-1024.png`. Остальные размеры и манифест я сделаю сам.

---

## Что делать с результатом

1. Скачать в максимальном разрешении.
2. Сжать до 200–400 КБ (например, на squoosh.app), формат `.jpg`.
3. Положить в `public/assets/img/` под именами выше.
4. Сказать мне — переключу пути и подгоню кадрирование.

Пока там лежит линейная графика в той же палитре.
