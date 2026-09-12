'use client';

import { useEffect } from 'react';

/**
 * Інтерактив лендинга: шапка, що ховається, мобільне меню, акордеони
 * і поява блоків при скролі. Перенесено з assets/js/main.js.
 */
export function LandingInteractions() {
  useEffect(() => {
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (!header || !burger || !nav) return;

    // --- шапка ховається при скролі вниз ---
    // Читаємо позицію раз на кадр, а не на кожну подію скролу, і не реагуємо
    // на рухи дрібніші за 8px: без цього шапка смикалася туди-сюди на
    // інерційному скролі та на «гумці» вгорі сторінки.
    let lastY = Math.max(window.scrollY, 0);
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(window.scrollY, 0); // на iOS scrollY буває від'ємним
      if (Math.abs(y - lastY) < 8) return;
      header.classList.toggle('is-hidden', y > 240 && y > lastY);
      lastY = y;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // --- мобільне меню ---
    const closeNav = () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      header.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    const toggleNav = () => {
      const open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      header.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    const onNavClick = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'A') closeNav();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNav();
    };
    burger.addEventListener('click', toggleNav);
    nav.addEventListener('click', onNavClick);
    document.addEventListener('keydown', onKeyDown);

    // --- акордеони ---
    const accordions = Array.from(document.querySelectorAll('.accordion'));
    const onAccordionClick = (event: Event) => {
      const accordion = event.currentTarget as HTMLElement;
      const btn = (event.target as HTMLElement).closest('.accordion__btn');
      if (!btn) return;

      const item = btn.parentElement;
      if (!item) return;
      const panel = item.querySelector<HTMLElement>('.accordion__panel');
      const wasOpen = item.classList.contains('is-open');

      accordion.querySelectorAll('.accordion__item').forEach((other) => {
        other.classList.remove('is-open');
        const p = other.querySelector<HTMLElement>('.accordion__panel');
        if (p) p.style.maxHeight = '';
      });

      if (!wasOpen && panel) {
        item.classList.add('is-open');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    };
    accordions.forEach((a) => a.addEventListener('click', onAccordionClick));

    // --- поява блоків при скролі ---
    const reveals = Array.from(document.querySelectorAll('.reveal'));
    const timers: ReturnType<typeof setTimeout>[] = [];
    let io: IntersectionObserver | undefined;

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            timers.push(
              setTimeout(() => entry.target.classList.add('is-visible'), Math.min(i, 4) * 80),
            );
            io?.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -60px' },
      );
      reveals.forEach((el) => io?.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('is-visible'));
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      burger.removeEventListener('click', toggleNav);
      nav.removeEventListener('click', onNavClick);
      document.removeEventListener('keydown', onKeyDown);
      accordions.forEach((a) => a.removeEventListener('click', onAccordionClick));
      timers.forEach(clearTimeout);
      io?.disconnect();
      document.body.style.overflow = '';
    };
  }, []);

  return null;
}
