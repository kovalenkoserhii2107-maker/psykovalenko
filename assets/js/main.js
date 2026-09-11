/* Лендинг Тетяни Коваленко — інтерактив сторінки */
(function () {
  'use strict';

  /* ---- адреса особистого кабінету (PWA) ----
     Коли кабінет з'явиться, впишіть сюди його адресу —
     усі кнопки «Кабінет» на сторінці підхоплять її автоматично. */
  var CABINET_URL = '';

  if (CABINET_URL) {
    document.querySelectorAll('[data-cabinet]').forEach(function (a) {
      a.href = CABINET_URL;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---- шапка ховається при скролі вниз ---- */
  var header = document.getElementById('header');
  var lastY = 0;

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    header.classList.toggle('is-hidden', y > 240 && y > lastY);
    lastY = y;
  }, { passive: true });

  /* ---- мобільне меню ---- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  var closeNav = function () {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    header.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    header.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeNav(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---- акордеони (про мене + питання) ---- */
  document.querySelectorAll('.accordion').forEach(function (accordion) {
    accordion.addEventListener('click', function (e) {
      var btn = e.target.closest('.accordion__btn');
      if (!btn) return;

      var item = btn.parentElement;
      var panel = item.querySelector('.accordion__panel');
      var wasOpen = item.classList.contains('is-open');

      accordion.querySelectorAll('.accordion__item').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.accordion__panel').style.maxHeight = null;
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---- поява блоків при скролі ---- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        setTimeout(function () { entry.target.classList.add('is-visible'); }, i * 80);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px' });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
