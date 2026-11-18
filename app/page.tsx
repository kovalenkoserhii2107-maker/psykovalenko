import type { Metadata } from 'next';
import Link from 'next/link';

import { asset } from '@/lib/base-path';

import './landing.css';
import { LandingInteractions } from './landing-interactions';

export const metadata: Metadata = {
  title: 'Тетяна Коваленко, психолог. Онлайн-консультації',
  description:
    'Місце, де можна бути собою. Тривога, вигорання, стосунки, самооцінка. Консультації онлайн.',
  // Шляхи знімків тут без basePath: Next приклеює їх до metadataBase,
  // а та вже містить префікс (NEXT_PUBLIC_SITE_URL). Інакше вийде
  // /psykovalenko/psykovalenko/… — саме так і було на першій збірці.
  openGraph: {
    type: 'website',
    title: 'Тетяна Коваленко, психолог',
    description:
      'Місце, де можна бути собою. Тривога, вигорання, стосунки, самооцінка. Консультації онлайн.',
    images: [
      {
        url: '/assets/img/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Два крісла одне навпроти одного біля високого вікна',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Тетяна Коваленко, психолог',
    description:
      'Місце, де можна бути собою. Тривога, вигорання, стосунки, самооцінка. Консультації онлайн.',
    images: ['/assets/img/og.jpg'],
  },
};

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ============ ШАПКА ============ */}
      <header className="header" id="header">
        <div className="header__inner">
          <nav className="nav" id="nav">
            <a href="#about">Про мене</a>
            <a href="#services">Послуги</a>
            <a href="#products">Матеріали</a>
            <a href="#social">Соцмережі</a>
            <a href="#faq">Питання</a>
            <a href="#contact" className="nav__cta">Записатись</a>
          </nav>

          <a href="#hero" className="logo"><span className="logo__mark"></span>Тетяна Коваленко</a>

          <div className="header__actions">
            <a href="#contact" className="btn">Записатись</a>
            <button className="burger" id="burger" aria-label="Меню" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <main>

      {/* ============ ГЕРОЙ ============ */}
      <section className="hero" id="hero">
        <div className="hero__media"><img src={asset('/assets/img/hero.jpg')} alt="" /></div>

        <div className="hero__inner">
          <div className="hero__col reveal">
            <p className="rule-label rule-label--left"><b>Онлайн</b>-консультації</p>
            <h1>Місце, де можна <em>бути собою.</em></h1>
            <p className="lead">Психолог Тетяна Коваленко. Тривога, вигорання, стосунки та самооцінка — у темпі, який підходить саме вам.</p>

            <div className="btn-row">
              <a href="#contact" className="btn">Записатись на консультацію</a>
              <a href="#about" className="btn btn--ghost">Про мене</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ХОРОША НОВИНА ============ */}
      <section className="section good">
        <div className="container container--narrow">
          <div className="good__photo arch reveal"><img src={asset('/assets/img/good.jpg')} alt="" /></div>

          <div className="reveal">
            <p className="good__kicker">А <em>хороша</em> новина?</p>
            <h2>Вам може стати легше.</h2>
            <p className="good__sub">Не за один день, а крок за кроком</p>
            <p className="lead">
              У терапії ви не просто «перечікуєте» складний період — ви набуваєте навичок,
              які лишаються з вами назавжди. Нижче — з чим я допомагаю і в яких форматах працюю.
            </p>

            <svg className="good__arrow" viewBox="0 0 24 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="2" x2="12" y2="36"/><polyline points="4 28 12 36 20 28"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ============ НАПРЯМКИ ============ */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-head section-head--center reveal">
            <h2>Напрямки <em>роботи</em></h2>
          </div>

          <ul className="focus__list reveal">
            <li>Тривога</li>
            <li>Підтримка під час війни</li>
            <li>Самооцінка</li>
            <li>Емоційне виснаження</li>
            <li>Стрес і вигорання</li>
            <li>Стосунки і сім’я</li>
            <li>Особисті межі</li>
            <li>Дитячо-батьківські стосунки</li>
            <li>Кризові стани</li>
            <li>Життєві сценарії</li>
          </ul>
        </div>
      </section>

      {/* ============ ПРО МЕНЕ ============ */}
      <section className="section" id="about">
        <div className="container">
          <h2 className="about__statement reveal">Тут баланс — це <em>не</em> про досконалість, <em>а</em> про право бути людиною.</h2>

          <div className="about__grid">
            <div className="about__card reveal">
              <div className="about__photo"><img src={asset('/assets/img/about.jpg')} alt="Тетяна Коваленко" /></div>
              <p className="about__card-title"><em>Психолог</em> Тетяна Коваленко</p>
              <p>Моя мета — не втримати вас у терапії назавжди, а допомогти віднайти опору й іти далі самостійно.</p>
            </div>

            <div className="reveal">
              <p className="lead">
                Я працюю з дорослими, які втомилися тягнути все на собі. В основі доказові методи,
                підібрані під ваш запит, а не універсальна схема «для всіх».
              </p>
              <p className="lead">
                Онлайн, індивідуально чи в парі — ми починаємо з того місця, де ви зараз,
                без оцінок і без поспіху.
              </p>

              <div className="accordion" id="about-accordion">
                <div className="accordion__item">
                  <button className="accordion__btn">Освіта</button>
                  <div className="accordion__panel">
                    <p>Південноукраїнський національний педагогічний університет імені К. Д. Ушинського, спеціальність «Психологія», практичний психолог.</p>
                    <p>Зараз проходжу навчання психотерапії в методі транзакційного аналізу. Пройшла курс ТА 101 з транзакційного аналізу.</p>
                  </div>
                </div>
                <div className="accordion__item">
                  <button className="accordion__btn">Навчання та курси</button>
                  <div className="accordion__panel">
                    <p><b>2022</b> «Практична психологія», «Сімейна психологія», «Транзакційний аналіз».</p>
                    <p><b>2024</b> «Вступ до раннього втручання», «Базова психологічна допомога в умовах війни», «Перша психологічна допомога», курс-практикум для психологів (24 академічні години теорії та 21 година практики).</p>
                    <p><b>2025</b> «Основи консультування із застосуванням МАК в психологічній практиці та коучингу» (90 академічних годин), курс «Психіатрія для психологів».</p>
                  </div>
                </div>
              </div>

              <div className="btn-row">
                <a href="#contact" className="btn">Записатись на першу сесію</a>
                <a href="#formats" className="btn btn--ghost">Формати роботи</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ПОСЛУГИ (ФОРМАТИ) ============ */}
      <section className="section services" id="formats">
        <div className="container">
          <div className="section-head section-head--center reveal">
            <h2>Формати <em>роботи</em></h2>
            <p className="caption">Оберіть те, що зручно саме вам</p>
          </div>

          <div className="services__grid">
            <article className="svc reveal">
              <div className="svc__media"><img src={asset('/assets/img/card-1.jpg')} alt="" /></div>
              <h3>Індивідуальна терапія</h3>
              <p>Наодинці зі своїм запитом. Тривалість 50 хвилин, рекомендована регулярність раз на тиждень.</p>
              <div className="svc__foot"><span className="arrow-btn" aria-hidden="true"></span></div>
            </article>

            <article className="svc reveal">
              <div className="svc__media"><img src={asset('/assets/img/card-2.jpg')} alt="" /></div>
              <h3>Робота з парою</h3>
              <p>Про конфлікти, близькість і вміння чути одне одного. Тривалість 80 хвилин.</p>
              <div className="svc__foot"><span className="arrow-btn" aria-hidden="true"></span></div>
            </article>

            <article className="svc reveal">
              <div className="svc__media"><img src={asset('/assets/img/card-3.jpg')} alt="" /></div>
              <h3>Підтримувальні консультації</h3>
              <p>Коли гострої кризи немає, але хочеться стійкості та ясності. Раз на 2–4 тижні.</p>
              <div className="svc__foot"><span className="arrow-btn" aria-hidden="true"></span></div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ ОСВІТНІ ПРОДУКТИ ============
           Місце під гайди, курси й вебінари. Поки все в розробці: картки
           без посилань. Коли продукт з'явиться, картка стає посиланням,
           а позначку «У розробці» прибираємо.
           ============================================= */}
      <section className="section products" id="products">
        <div className="container">
          <div className="section-head section-head--center reveal">
            <h2>Освітні <em>продукти</em></h2>
            <p className="caption">Матеріали для самостійної роботи. Готуються зараз</p>
          </div>

          <div className="products__grid">
            <article className="product reveal">
              <span className="product__badge">У розробці</span>
              <h3>Гайди</h3>
              <p>Короткі практичні матеріали, до яких можна повертатися самостійно.</p>
            </article>
            <article className="product reveal">
              <span className="product__badge">У розробці</span>
              <h3>Курси</h3>
              <p>Послідовна робота з однією темою у власному темпі.</p>
            </article>
            <article className="product reveal">
              <span className="product__badge">У розробці</span>
              <h3>Вебінари</h3>
              <p>Зустрічі на окремі теми з можливістю поставити питання.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ============ СОЦМЕРЕЖІ ============ */}
      <section className="section social" id="social">
        <div className="container">
          <div className="social__head reveal">
            <div>
              <h2>Стежте <em>за</em> мною</h2>
              <p className="lead">Розбори, вправи та короткі нотатки про психіку.</p>
            </div>

            <ul className="social__links">
              <li><a href="https://www.instagram.com/psykovalenko/" data-social="instagram" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg>
                <span>Instagram</span><b>@psykovalenko</b>
              </a></li>
              <li><a href="https://t.me/Tetiana_psy_od" data-social="telegram" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4.5 2.8 11.3c-.7.3-.7 1.2 0 1.4l4.6 1.4 1.7 5.1c.2.6 1 .8 1.4.3l2.5-2.6 4.6 3.4c.6.4 1.4.1 1.5-.6L22.4 5.6c.2-.8-.6-1.4-1.4-1.1z"/><path d="M7.4 14.1 18 7.2l-7.6 8.6"/></svg>
                <span>Telegram</span><b>@Tetiana_psy_od</b>
              </a></li>
              <li><a href="https://www.facebook.com/profile.php?id=100008093233980" data-social="facebook" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h3l.5-4H12V7.5c0-.6.4-1 1-1h2z"/></svg>
                <span>Facebook</span><b>Профіль</b>
              </a></li>
            </ul>
          </div>

        </div>
      </section>

      {/* ============ ПИТАННЯ ============ */}
      <section className="section faq" id="faq">
        <div className="container faq__grid">
          <div className="reveal">
            <h2>Часті <em>питання</em></h2>
            <p className="caption">Те, про що запитують найчастіше</p>
            <a href="#contact" className="btn">Поставити своє питання</a>
          </div>

          <div className="accordion reveal" id="faq-accordion">
            <div className="accordion__item">
              <button className="accordion__btn">Як зрозуміти, що терапія мені підходить?</button>
              <div className="accordion__panel"><p>Найпростіше — прийти на першу зустріч. За 50 хвилин стає зрозуміло, чи комфортно вам у контакті й чи збігається бачення роботи.</p></div>
            </div>
            <div className="accordion__item">
              <button className="accordion__btn">Скільки триває сесія?</button>
              <div className="accordion__panel"><p>Індивідуальна — 50 хвилин, парна — 80 хвилин.</p></div>
            </div>
            <div className="accordion__item">
              <button className="accordion__btn">Скільки це коштує?</button>
              <div className="accordion__panel"><p>Індивідуальна сесія: 1500 грн. Парна чи сімейна: 2200 грн. Пакет із 5 індивідуальних сесій: 7000 грн. Оплата 100% наперед, не пізніше ніж за 24 години до сесії. Усі умови в <Link href="/offer/#r9">договорі оферти</Link>.</p></div>
            </div>
            <div className="accordion__item">
              <button className="accordion__btn">Як проходять сесії?</button>
              <div className="accordion__panel"><p>Онлайн, через Zoom, Google Meet або Telegram, з будь-якої точки світу. Потрібні лише тихе місце, стабільний інтернет і пристрій із камерою та мікрофоном.</p></div>
            </div>
            <div className="accordion__item">
              <button className="accordion__btn">Що, якщо мені не підійде?</button>
              <div className="accordion__panel"><p>Це нормально і важливо сказати вголос. Я допоможу підібрати колегу: контакт зі спеціалістом впливає на результат сильніше за метод.</p></div>
            </div>
          </div>
        </div>
      </section>

      </main>

      {/* ============ ЗАПИС + ПІДВАЛ ============ */}
      <section className="closing" id="contact">
        <span className="closing__deco" aria-hidden="true"></span>

        <div className="container">
          <div className="cta reveal">
            <p className="rule-label rule-label--on-dark" style={{ justifyContent: 'center' }}><b>Перший крок</b></p>
            <h2>Запишіться на першу консультацію</h2>
            <p>Напишіть кілька слів про те, що відбувається. Відповім упродовж дня і запропоную зручний час.</p>

            <div className="btn-row">
              <a href="https://t.me/Tetiana_psy_od" className="btn btn--light" target="_blank" rel="noopener">Написати в Telegram</a>
              <a href="mailto:kovalenkotanya2205@gmail.com" className="btn btn--light">Написати на пошту</a>
            </div>
          </div>

          <footer className="footer">
            <div className="footer__grid">
              <div>
                <a href="#hero" className="logo"><span className="logo__mark"></span>Тетяна Коваленко</a>
                <p>Психолог</p>
              </div>

              <div>
                <h4>Розділи</h4>
                <ul>
                  <li><a href="#about">Про мене</a></li>
                  <li><a href="#services">Напрямки</a></li>
                  <li><a href="#products">Матеріали</a></li>
                  <li><a href="#faq">Питання</a></li>
                </ul>
              </div>

              <div>
                <h4>Соцмережі</h4>
                <ul>
                  <li><a href="https://www.instagram.com/psykovalenko/" data-social="instagram" target="_blank" rel="noopener">Instagram</a></li>
                  <li><a href="https://t.me/Tetiana_psy_od" data-social="telegram" target="_blank" rel="noopener">Telegram</a></li>
                  <li><a href="https://www.facebook.com/profile.php?id=100008093233980" data-social="facebook" target="_blank" rel="noopener">Facebook</a></li>
                </ul>
              </div>

              <div>
                <h4>Контакти</h4>
                <ul>
                  <li><a href="mailto:kovalenkotanya2205@gmail.com">kovalenkotanya2205@gmail.com</a></li>
                  <li><a href="https://t.me/Tetiana_psy_od" target="_blank" rel="noopener">Telegram @Tetiana_psy_od</a></li>
                </ul>
              </div>
            </div>

            <div className="footer__bottom">
              <span>© 2026 Тетяна Коваленко</span>
              <span>Політика конфіденційності</span>
              <Link href="/offer/">Договір оферти</Link>
            </div>
          </footer>
        </div>
      </section>

      <LandingInteractions />
    </div>
  );
}
