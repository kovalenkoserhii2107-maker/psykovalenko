import type { Metadata } from 'next';
import Link from 'next/link';

import './landing.css';
import { LandingInteractions } from './landing-interactions';

export const metadata: Metadata = {
  title: 'Тетяна Коваленко — психологиня. Онлайн та очно',
  description:
    'Бути не ОК — це ОК. Тривога, вигорання, стосунки, самооцінка. Консультації онлайн та очно.',
  openGraph: {
    type: 'website',
    title: 'Тетяна Коваленко — психологиня',
    description:
      'Бути не ОК — це ОК. Тривога, вигорання, стосунки, самооцінка. Консультації онлайн та очно.',
    images: ['/assets/img/hero.jpg'],
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
            <a href="#experience">Досвід клієнтів</a>
            <a href="#social">Соцмережі</a>
            <a href="#faq">Питання</a>
            <a href="#contact" className="nav__cta">Записатись</a>
            <Link href="/login" className="nav__cabinet">Особистий кабінет</Link>
          </nav>

          <a href="#hero" className="logo"><span className="logo__mark"></span>Тетяна Коваленко</a>

          <div className="header__actions">
            <a href="/login" className="btn btn--ghost header__label">Кабінет</a>
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
        <div className="hero__media"><img src="assets/img/hero.jpg" alt="" /></div>

        <div className="hero__inner">
          <div className="hero__col reveal">
            <p className="rule-label rule-label--left"><b>Онлайн</b> та очні сесії</p>
            <h1>Бути не ОК — <em>це ОК</em></h1>
            <p className="lead">Психологиня Тетяна Коваленко. Тривога, вигорання, стосунки та самооцінка — у темпі, який підходить саме вам.</p>

            <div className="btn-row">
              <a href="#contact" className="btn">Записатись на консультацію</a>
              <a href="#experience" className="btn btn--ghost">Як проходить робота</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ХОРОША НОВИНА ============ */}
      <section className="section good">
        <div className="container container--narrow">
          <div className="good__photo arch reveal"><img src="assets/img/good.jpg" alt="" /></div>

          <div className="reveal">
            <p className="good__kicker">А <em>хороша</em> новина?</p>
            <h2>Вам може стати легше.</h2>
            <p className="good__sub">Не за один день, а крок за кроком</p>
            <p className="lead">
              У терапії ви не просто «перечікуєте» складний період — ви набуваєте навичок,
              які лишаються з вами назавжди. Нижче — як влаштована робота і з чим я допомагаю.
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
            <p className="caption">Спеціалізована підтримка для конкретних запитів</p>
          </div>

          <ul className="focus__list reveal">
            <li>Тривога і панічні атаки</li>
            <li>Стрес і вигорання</li>
            <li>Травма і ПТСР</li>
            <li>Підтримка під час війни</li>
            <li>Стосунки і сім'я</li>
            <li>Дитячо-батьківські стосунки</li>
            <li>Самооцінка</li>
            <li>Втрата і горювання</li>
            <li>Кризові стани</li>
            <li>Емоційне виснаження</li>
            <li>Особисті межі</li>
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
              <div className="about__photo"><img src="assets/img/about.jpg" alt="Тетяна Коваленко" /></div>
              <p className="about__card-title"><em>Магістр психології</em> — Тетяна Коваленко</p>
              <p>Моя мета — не втримати вас у терапії назавжди, а допомогти віднайти опору й іти далі самостійно.</p>
            </div>

            <div className="reveal">
              <p className="lead">
                Я працюю з дорослими, які втомилися тягнути все на собі. В основі — доказові методи,
                підібрані під ваш запит, а не універсальна схема «для всіх».
              </p>
              <p className="lead">
                Очно чи онлайн, індивідуально чи в парі — ми починаємо з того місця, де ви зараз,
                без оцінок і без поспіху.
              </p>

              <div className="accordion" id="about-accordion">
                <div className="accordion__item">
                  <button className="accordion__btn">Освіта</button>
                  <div className="accordion__panel"><p>Освіта вища: у 2025 році закінчила Південноукраїнський національний педагогічний університет ім. К. Д. Ушинського, спеціальність «Психологія». Від 2025 року працює на кафедрі психології та педагогіки (<a href="https://oduvs.edu.ua/persone/kovalenko_tetana_vasilivna" target="_blank" rel="noopener">сторінка в ОДУВС</a>).</p></div>
                </div>
                <div className="accordion__item">
                  <button className="accordion__btn">Навчання та курси</button>
                  <div className="accordion__panel"><p>2022 — «Практична психологія», «Сімейна психологія», «Транзакційний аналіз». 2024 — «Вступ до раннього втручання», «Базова психологічна допомога в умовах війни», «Перша психологічна допомога», курс-практикум для психологів (24 академічні години теорії та 21 година практики). 2025 — «Основи консультування із застосуванням МАК в психологічній практиці та коучингу» (90 академічних годин), курс «Психіатрія для психологів».</p></div>
                </div>
                <div className="accordion__item">
                  <button className="accordion__btn">Мій підхід до терапії</button>
                  <div className="accordion__panel"><p>Працюю в методі транзакційного аналізу: аналіз життєвих сценаріїв — тих повторюваних схем, за якими ми раз за разом потрапляємо в ті самі ситуації. Учасниця конференції «Інтегративна психотерапія: посилення спеціалізації та розширення можливостей» Інституту транзакційного аналізу та інтегративної психотерапії. У роботі також застосовую метафоричні асоціативні карти (МАК).</p></div>
                </div>
                <div className="accordion__item">
                  <button className="accordion__btn">Простір без осуду</button>
                  <div className="accordion__panel"><p>У кабінеті немає «правильних» почуттів. Усе, що ви приносите, — доречне. Конфіденційність повна: сказане лишається між нами.</p></div>
                </div>
              </div>

              <div className="btn-row">
                <a href="#contact" className="btn">Записатись на першу сесію</a>
                <a href="#experience" className="btn btn--ghost">Досвід клієнтів</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ СТАТИСТИКА ============ */}
      <section className="section stats">
        <div className="stats__media"><img src="assets/img/stats.jpg" alt="" /></div>
        <div className="container">
          <h2 className="reveal">Щоб якісна терапія була доступною кожному</h2>

          <div className="stats__grid">
            <div className="stat reveal"><strong>ТА</strong><span>транзакційний аналіз та інтегративна психотерапія</span></div>
            <div className="stat reveal"><strong>2025</strong><span>ПНПУ ім. К. Д. Ушинського, спеціальність «Психологія»</span></div>
            <div className="stat reveal"><strong>90 год</strong><span>курс консультування із застосуванням МАК, 2025</span></div>
            <div className="stat reveal"><strong>Онлайн</strong><span>та очні сесії в Одесі</span></div>
          </div>
        </div>
      </section>

      {/* ============ ПОСЛУГИ (ФОРМАТИ) ============ */}
      <section className="section services">
        <div className="container">
          <div className="section-head section-head--center reveal">
            <h2>Формати <em>роботи</em></h2>
            <p className="caption">Оберіть те, що зручно саме вам</p>
          </div>

          <div className="services__grid">
            <article className="svc reveal">
              <div className="svc__media"><img src="assets/img/card-1.jpg" alt="" /></div>
              <h3>Індивідуальна терапія</h3>
              <p>50 хвилин наодинці зі своїм запитом. Регулярність — зазвичай раз на тиждень.</p>
              <div className="svc__foot"><span className="arrow-btn" aria-hidden="true"></span></div>
            </article>

            <article className="svc reveal">
              <div className="svc__media"><img src="assets/img/card-2.jpg" alt="" /></div>
              <h3>Робота з парою</h3>
              <p>Про конфлікти, близькість і вміння чути одне одного. 80 хвилин разом.</p>
              <div className="svc__foot"><span className="arrow-btn" aria-hidden="true"></span></div>
            </article>

            <article className="svc reveal">
              <div className="svc__media"><img src="assets/img/card-3.jpg" alt="" /></div>
              <h3>Підтримувальні консультації</h3>
              <p>Коли гострої кризи немає, але хочеться стійкості та ясності. Раз на 2–4 тижні.</p>
              <div className="svc__foot"><span className="arrow-btn" aria-hidden="true"></span></div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ ДОСВІД КЛІЄНТІВ ============
           Блок під наповнення: історії, кейси, шлях клієнта.
           Тексти нижче — рибка, замінюємо на реальні.
           ============================================= */}
      <section className="section experience" id="experience">
        <div className="container">
          <div className="section-head section-head--center reveal">
            <h2>Досвід <em>клієнтів</em></h2>
            <p className="caption">Як виглядає шлях від першого листа до змін</p>
          </div>

          <div className="experience__grid">
            <article className="exp reveal">
              <span className="exp__num">01</span>
              <h3>Перший лист</h3>
              <p>Ви пишете кілька речень про те, що відбувається. Я відповідаю впродовж дня і пропоную час.</p>
            </article>
            <article className="exp reveal">
              <span className="exp__num">02</span>
              <h3>Знайомство</h3>
              <p>Перша зустріч — 50 хвилин. Дивимось, чи комфортно вам зі мною, і формулюємо запит.</p>
            </article>
            <article className="exp reveal">
              <span className="exp__num">03</span>
              <h3>Робота</h3>
              <p>Регулярні сесії та невеликі практики між ними. Поступово з'являються перші зрушення.</p>
            </article>
            <article className="exp reveal">
              <span className="exp__num">04</span>
              <h3>Опора</h3>
              <p>Зустрічі стають рідшими. Навички залишаються з вами — далі ви спираєтесь на них самостійно.</p>
            </article>
          </div>

          <div className="experience__cta reveal">
            <p className="lead">Тут з'являться реальні історії клієнтів — з їхнього дозволу та без імен.</p>
            <a href="#contact" className="btn btn--ghost">Почати свою історію</a>
          </div>
        </div>
      </section>

      {/* ============ СОЦМЕРЕЖІ + ДОПИСИ ============
           Акцентний блок. Дописи дублюють те, що виходить у соцмережах.
           Посилання підставити у href нижче.
           ============================================= */}
      <section className="section social" id="social">
        <div className="container">
          <div className="social__head reveal">
            <div>
              <h2>Стежте <em>за</em> мною</h2>
              <p className="lead">Розбори, вправи та короткі нотатки про психіку — щотижня. Той самий допис виходить і тут, і в соцмережах.</p>
            </div>

            <ul className="social__links">
              <li><a href="https://www.instagram.com/psykovalenko/" data-social="instagram" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg>
                <span>Instagram</span><b>@psykovalenko</b>
              </a></li>
              <li><a href="https://www.threads.net/@psykovalenko" data-social="threads" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17.5" textAnchor="middle" fontSize="17" fontFamily="Inter, sans-serif" fill="currentColor" stroke="none">@</text></svg>
                <span>Threads</span><b>@psykovalenko</b>
              </a></li>
              <li><a href="https://t.me/Tetiana_psy_od" data-social="telegram" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4.5 2.8 11.3c-.7.3-.7 1.2 0 1.4l4.6 1.4 1.7 5.1c.2.6 1 .8 1.4.3l2.5-2.6 4.6 3.4c.6.4 1.4.1 1.5-.6L22.4 5.6c.2-.8-.6-1.4-1.4-1.1z"/><path d="M7.4 14.1 18 7.2l-7.6 8.6"/></svg>
                <span>Telegram</span><b>@Tetiana_psy_od</b>
              </a></li>
              <li><a href="https://www.facebook.com/profile.php?id=100008093233980" data-social="facebook" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h3l.5-4H12V7.5c0-.6.4-1 1-1h2z"/></svg>
                <span>Facebook</span><b>Профіль</b>
              </a></li>
              <li><a href="#" data-social="tiktok">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3c.4 2.6 2 4.2 4.5 4.4v3c-1.7.1-3.2-.4-4.5-1.3v6.2c0 3.6-2.7 5.9-5.8 5.7A5.6 5.6 0 0 1 4 15.4c.2-2.9 2.7-5 5.6-4.8v3.1c-1.4-.3-2.7.6-2.8 2a2.4 2.4 0 0 0 2.3 2.6c1.4 0 2.4-1 2.4-2.6V3z"/></svg>
                <span>TikTok</span><b>Короткі відео</b>
              </a></li>
              <li><a href="#" data-social="youtube">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><polygon points="10.5 9.5 15.5 12 10.5 14.5" fill="currentColor" stroke="none"/></svg>
                <span>YouTube</span><b>Розмови і лекції</b>
              </a></li>
            </ul>
          </div>

          <div className="posts__grid">
            <a href="https://www.instagram.com/reel/DWwXHYwjBWR/" className="post reveal" target="_blank" rel="noopener">
              <div className="post__media"><img src="assets/img/post-1.svg" alt="" /></div>
              <p className="post__date">Instagram · Reels</p>
              <h3>Чому щоденник допомагає впоратися з тривогою</h3>
            </a>
            <a href="#" className="post reveal">
              <div className="post__media"><img src="assets/img/post-2.svg" alt="" /></div>
              <p className="post__date">5 жовтня 2026</p>
              <h3>П'ять способів говорити з партнером про важке</h3>
            </a>
            <a href="#" className="post reveal">
              <div className="post__media"><img src="assets/img/post-3.svg" alt="" /></div>
              <p className="post__date">28 вересня 2026</p>
              <h3>Втома чи вигорання: як відрізнити</h3>
            </a>
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
              <div className="accordion__panel"><p>Вартість уточнюйте у листі або в Telegram — вона залежить від формату та регулярності. Оплата після сесії.</p></div>
            </div>
            <div className="accordion__item">
              <button className="accordion__btn">Чи є онлайн-сесії?</button>
              <div className="accordion__panel"><p>Так, працюю онлайн із будь-якої точки світу. Потрібні лише тихе місце і стабільний інтернет — результат не відрізняється від очного формату.</p></div>
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
              <a href="/login" className="btn btn--light">Особистий кабінет</a>
            </div>
          </div>

          <footer className="footer">
            <div className="footer__grid">
              <div>
                <a href="#hero" className="logo"><span className="logo__mark"></span>Тетяна Коваленко</a>
                <p>Психологиня. Дбайлива робота з дорослими — онлайн та очно.</p>
              </div>

              <div>
                <h4>Розділи</h4>
                <ul>
                  <li><a href="#about">Про мене</a></li>
                  <li><a href="#services">Напрямки</a></li>
                  <li><a href="#experience">Досвід клієнтів</a></li>
                  <li><a href="#faq">Питання</a></li>
                </ul>
              </div>

              <div>
                <h4>Соцмережі</h4>
                <ul>
                  <li><a href="https://www.instagram.com/psykovalenko/" data-social="instagram" target="_blank" rel="noopener">Instagram</a></li>
                  <li><a href="https://www.threads.net/@psykovalenko" data-social="threads" target="_blank" rel="noopener">Threads</a></li>
                  <li><a href="https://t.me/Tetiana_psy_od" data-social="telegram" target="_blank" rel="noopener">Telegram</a></li>
                  <li><a href="https://www.facebook.com/profile.php?id=100008093233980" data-social="facebook" target="_blank" rel="noopener">Facebook</a></li>
                  <li><a href="#" data-social="tiktok">TikTok</a></li>
                  <li><a href="#" data-social="youtube">YouTube</a></li>
                </ul>
              </div>

              <div>
                <h4>Контакти</h4>
                <a href="tel:+380665906199" className="footer__phone">+38 (066) 590-61-99</a>
                <ul>
                  <li><a href="mailto:kovalenkotanya2205@gmail.com">kovalenkotanya2205@gmail.com</a></li>
                  <li><a href="https://oduvs.edu.ua/persone/kovalenko_tetana_vasilivna" target="_blank" rel="noopener">Сторінка в ОДУВС</a></li>
                  <li><Link href="/login">Особистий кабінет</Link></li>
                </ul>
              </div>
            </div>

            <div className="footer__bottom">
              <span>© 2026 Тетяна Коваленко</span>
              <span>Політика конфіденційності</span>
            </div>
          </footer>
        </div>
      </section>

      <LandingInteractions />
    </div>
  );
}
