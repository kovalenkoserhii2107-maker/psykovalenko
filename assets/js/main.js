/* Psykovalenko — интерактив страницы */
(function () {
  'use strict';

  /* ---- шапка: фон при скролле ---- */
  var header = document.getElementById('header');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- мобильное меню ---- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  var closeNav = function () {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---- аккордеон FAQ ---- */
  var accordion = document.getElementById('accordion');
  if (accordion) {
    accordion.addEventListener('click', function (e) {
      var btn = e.target.closest('.accordion__btn');
      if (!btn) return;

      var item = btn.parentElement;
      var panel = item.querySelector('.accordion__panel');
      var isOpen = item.classList.contains('is-open');

      accordion.querySelectorAll('.accordion__item').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.accordion__panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  }

  /* ---- появление блоков при скролле ---- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, i * 90);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- форма: заглушка отправки ---- */
  var form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      // TODO: подключить реальную отправку (почта, Telegram-бот, CRM)
      btn.textContent = 'Спасибо! Я свяжусь с вами';
      btn.disabled = true;
    });
  }
})();
