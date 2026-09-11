# Деплой на Fly.io

Усе, що нижче, виконується з вашої машини: потрібен обліковий запис Fly
і встановлений `flyctl` (`curl -L https://fly.io/install.sh | sh`).

## 1. Створити застосунок

```bash
fly auth login
fly launch --no-deploy          # ім'я застосунку і регіон уже є у fly.toml
```

Якщо оберете інше ім'я — виправте `app` і `NEXT_PUBLIC_SITE_URL` у `fly.toml`.

## 2. База даних

```bash
fly postgres create --name psykovalenko-db --region waw
fly postgres attach psykovalenko-db --app psykovalenko
```

`attach` сам пропише секрет `DATABASE_URL`. Міграції накочуються автоматично
перед кожним деплоєм — це `release_command` у `fly.toml`.

## 3. Диск під вкладення

```bash
fly volumes create psy_data --region waw --size 1
```

Без диска файли домашніх завдань зникнуть при першому ж перезапуску машини.

## 4. Секрети

```bash
fly secrets set \
  AUTH_SECRET="$(openssl rand -base64 32)" \
  AUTH_URL="https://psykovalenko.fly.dev" \
  ANTHROPIC_API_KEY="..."
```

`AUTH_URL` має точно збігатися з адресою сайту, інакше вхід кидатиме
на неправильний домен.

## 5. Деплой

```bash
fly deploy
fly open
```

## 6. Створити обліковий запис психологині

Пароль задається один раз, із вашої машини через тунель до бази:

```bash
fly proxy 15432:5432 -a psykovalenko-db     # лишіть відкритим в окремому вікні

# у другому вікні, у теці проєкту:
DATABASE_URL="postgresql://postgres:<пароль>@localhost:15432/psykovalenko" \
ADMIN_EMAIL="kovalenkotanya2205@gmail.com" \
ADMIN_PASSWORD="<довгий пароль>" \
npm run db:seed
```

Пароль до бази показує `fly postgres attach` — або `fly secrets list` укаже,
що `DATABASE_URL` уже виставлено.

## 7. Свій домен

```bash
fly certs add psykovalenko.com
```

Далі Fly покаже, які A/AAAA записи прописати в реєстратора. Після того як
домен запрацює, змініть у `fly.toml` `NEXT_PUBLIC_SITE_URL`, оновіть секрет
`AUTH_URL` і задеплойте ще раз — обидві адреси зашиті в збірку й у сесії.

## Після першого вдалого деплою

Статичний лендинг у корені репозиторію (`index.html`, `assets/`, `.nojekyll`)
більше не потрібен: його роль виконує сам застосунок. Тоді ж можна вимкнути
GitHub Pages, щоб не лишалося другої, застарілої копії сайту.

## Чого я не перевірив

Образ не збирався: у середовищі, де писався код, немає демона Docker.
Перевірено інше — що збирається сам застосунок, що міграція накочується
на чисту базу, і що standalone-збірка (те, що запускається всередині
образу) стартує, віддає сторінки, статику й ходить у базу.

Якщо `fly deploy` упаде на збірці образу — надішліть лог, виправлю.
