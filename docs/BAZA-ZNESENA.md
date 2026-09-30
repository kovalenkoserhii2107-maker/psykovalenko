# Як знести базу на Fly і перестати за неї платити

Базу з проєкту прибрано, але на акаунті Fly вона ще існує — і рахунок
іде саме за неї. Порядок важливий.

> **Спершу деплой.** Поки на Fly крутиться стара версія сайту, вона ще
> ходить у базу. Знесете базу раніше — живий сайт ляже. Дочекайтесь, щоб
> у вкладці **Actions** випуск завершився зеленим, відкрийте сайт і
> переконайтесь, що він працює. Аж тоді далі.

## 1. Кластер Postgres — це і є ті $24

```bash
fly mpg list
fly mpg destroy <ім'я-кластера>
```

У браузері: **fly.io/dashboard** → застосунок `psykovalenko` →
**Managed Postgres** → кластер → **Settings** → **Destroy**.

Дані зникнуть назавжди. Якщо шкода — спершу зніміть дамп:

```bash
fly mpg connect <ім'я-кластера>     # перевірити, що підключення живе
fly mpg proxy <ім'я-кластера> &      # відкриє localhost:5432
pg_dump "postgresql://<user>:<pass>@localhost:5432/<db>" > psy-backup.sql
```

## 2. Диск під вкладення

```bash
fly volumes list -a psykovalenko
fly volumes destroy <id>
```

Диск `psy_data` тримав вкладення домашніх завдань і обкладинки дописів.
`fly.toml` його більше не згадує, тож нова машина його не монтує — але
сам диск лишається й тарифікується, доки його не знести. Потрібні файли
звідти — зніміть до видалення.

## 3. Секрети, які більше ні до чого

```bash
fly secrets list -a psykovalenko
fly secrets unset DATABASE_URL DIRECT_DATABASE_URL AUTH_SECRET AUTH_URL \
  AUTH_GOOGLE_ID AUTH_GOOGLE_SECRET ANTHROPIC_API_KEY \
  ADMIN_EMAIL ADMIN_PASSWORD ADMIN_NAME UPLOAD_DIR -a psykovalenko
```

Прибирайте лише ті імена, що справді є у списку. На рахунок це не
впливає, але зайвих ключів у застосунку бути не повинно. Google OAuth і
ключ Anthropic варто ще й відкликати в їхніх консолях.

## 4. Чужі застосунки на акаунті

```bash
fly apps list
```

У рахунку були ще `spacemmo` і `spacemmo-db` — разом близько $5.89 на
місяць. До цього сайту вони не мають стосунку. Якщо не потрібні:

```bash
fly apps destroy spacemmo spacemmo-db
```

## 5. Перевірка

```bash
fly mpg list         # порожньо
fly volumes list -a psykovalenko   # порожньо
fly apps list        # лишився тільки psykovalenko
```

Далі в рахунку має лишитись сам застосунок — центи на місяць, бо машина
згортається без відвідувачів. Поточні витрати видно на
**fly.io/dashboard** → **Billing**.

## Якщо передумаєте

Кабінет, CRM, блог і анкети лежать у git і відновлюються з коміту
`5fa23c8`. База під них піднімається будь-де, не обов'язково на Fly:
міграції перевірено на порожній базі — усі п'ять накочуються чисто, а
`prisma migrate diff` після них не бачить різниці зі схемою.
