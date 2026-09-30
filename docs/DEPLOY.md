# Деплой

Сайт — статичний лендинг: Next збирає його в набір готових файлів
(`output: 'export'`), а роздає GitHub Pages. Сервера немає, бази немає,
платити нема за що.

Адреса: **https://kovalenkoserhii2107-maker.github.io/psykovalenko/**

## Як це працює

Випуск робить `.github/workflows/pages.yml`. Кожен push у `main`
запускає два кроки поспіль:

1. **Збірка.** `npm ci` з нуля, `npm run lint`, `npm run build`. На
   виході тека `out/` — HTML, CSS, JS, шрифти й знімки.
2. **Випуск.** `actions/deploy-pages` віддає `out/` у Pages.

Стан видно у вкладці **Actions**. Там же кнопка **Run workflow** —
перевипустити без нового коміту.

## Разова підготовка

**Settings → Pages → Build and deployment → Source → GitHub Actions.**

Доки там стоїть «Deploy from a branch», Pages віддаватиме стару копію, а
не цю збірку. Більше нічого не потрібно: ні секретів, ні токенів.

## Префікс у шляхах

Pages віддає проєктний сайт за адресою з іменем репозиторію всередині,
тож кожен шлях починається з `/psykovalenko`. Звідси:

- `basePath` у `next.config.ts` — Next сам префіксує `_next/…`, стилі,
  шрифти та іконки;
- `lib/base-path.ts` — а ось звичайний `<img src="/assets/…">` Next не
  чіпає, такі шляхи проганяємо через `asset()` руками;
- `NEXT_PUBLIC_SITE_URL` у workflow — звідси береться `metadataBase`, до
  якої Next приклеює шлях `og:image`. **Тут префікс уже враховано**, тож
  у самих метаданих шлях знімка пишеться без нього — інакше вийде
  `/psykovalenko/psykovalenko/…`.

Обидві змінні підставляються на етапі збірки: `NEXT_PUBLIC_*` у
рантаймі вже не змінити.

## Локально

```bash
npm install
npm run dev          # http://localhost:3000, без префікса
```

Локально `NEXT_PUBLIC_BASE_PATH` порожня, тож сайт відкривається з
кореня. Перевірити збірку саме такою, якою її побачить Pages:

```bash
NEXT_PUBLIC_BASE_PATH=/psykovalenko \
NEXT_PUBLIC_SITE_URL=https://kovalenkoserhii2107-maker.github.io/psykovalenko \
npm run build
```

## Якщо з'явиться власний домен

Pages дає безкоштовний HTTPS для свого домену. Тоді ім'я репозиторію зі
шляхів зникає:

1. покласти в `public/` файл `CNAME` з одним рядком — доменом;
2. у `pages.yml` прибрати `NEXT_PUBLIC_BASE_PATH` і поставити
   `NEXT_PUBLIC_SITE_URL` рівним домену;
3. у реєстратора домену — записи, які покаже **Settings → Pages**.

Код чіпати не доведеться: `asset()` із порожнім префіксом нічого не
додає.
