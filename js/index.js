'use strict';

/**
 * PATULANDIA — SCRIPT PRINCIPAL v2
 * ==================================
 * Módulos:
 * 1.  Utilidades
 * 2.  Header — sombra al scroll
 * 3.  Menú mobile (drawer lateral)
 * 4.  Submenú mobile expandible (Combos) ← NUEVO
 * 5.  Scroll suave para anclas
 * 6.  Animaciones reveal (IntersectionObserver)
 * 7.  Año dinámico en el footer
 * 8.  Efecto ripple en botones
 * 9.  Scroll spy (resalta link activo en nav)
 * 10. Formulario de contacto — validación + envío simulado
 * 11. Contador de caracteres en textarea
 */


/* ============================================================
   1. UTILIDADES
============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function setOpen(el, open) {
  el.classList.toggle('is-open', open);
  el.setAttribute('aria-hidden', String(!open));
}


/* ============================================================
   2. HEADER — SOMBRA AL SCROLL
============================================================ */
function initHeaderScroll() {
  const header = $('#header');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  header.classList.toggle('scrolled', window.scrollY > 10);
}


/* ============================================================
   3. MENÚ MOBILE — DRAWER LATERAL
============================================================ */
function initMobileMenu() {
  const hamburger = $('#hamburger');
  const navMobile = $('#navMobile');
  const overlay   = $('#navOverlay');
  const btnClose  = $('#navClose');

  if (!hamburger || !navMobile) return;

  function openMenu() {
    setOpen(navMobile, true);
    if (overlay) { overlay.classList.add('is-visible'); overlay.setAttribute('aria-hidden', 'false'); }
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = navMobile.querySelector('.nav-mobile__link');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    setOpen(navMobile, false);
    if (overlay) { overlay.classList.remove('is-visible'); overlay.setAttribute('aria-hidden', 'true'); }
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    navMobile.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  if (btnClose) btnClose.addEventListener('click', closeMenu);
  if (overlay)  overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobile.classList.contains('is-open')) closeMenu();
  });

  // Links que NO son el trigger del dropdown → cierran el menú
  $$('.nav-mobile__link:not(.nav-mobile__link--parent)', navMobile).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Links del submenú → también cierran
  $$('.nav-mobile__submenu-link', navMobile).forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}


/* ============================================================
   4. SUBMENÚ MOBILE EXPANDIBLE (Combos)
   Permite abrir/cerrar la lista de combos en el drawer
   sin cerrar el menú principal.
============================================================ */
function initMobileSubmenu() {
  const parentItems = $$('.nav-mobile__item--parent');

  parentItems.forEach(item => {
    const trigger  = item.querySelector('.nav-mobile__link--parent');
    const submenu  = item.querySelector('.nav-mobile__submenu');
    const arrow    = item.querySelector('.nav-mobile__arrow');
    if (!trigger || !submenu) return;

    trigger.addEventListener('click', (e) => {
      e.preventDefault(); // No navegar, solo togglear

      const isOpen = item.classList.contains('is-open');

      // Cerrar todos los demás
      parentItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const oa = other.querySelector('.nav-mobile__arrow');
          const os = other.querySelector('.nav-mobile__submenu');
          if (oa) oa.setAttribute('aria-expanded', 'false');
          if (os) os.setAttribute('aria-hidden', 'true');
        }
      });

      // Toggle el actual
      item.classList.toggle('is-open', !isOpen);
      if (arrow) arrow.setAttribute('aria-expanded', String(!isOpen));
      submenu.setAttribute('aria-hidden', String(isOpen));
    });
  });
}


/* ============================================================
   5. SCROLL SUAVE PARA ANCLAS
============================================================ */
function initSmoothScroll() {
  const OFFSET = 80;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = $(id);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    history.pushState(null, '', id);

    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}


/* ============================================================
   6. ANIMACIONES REVEAL AL ENTRAR AL VIEWPORT
============================================================ */
function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}


/* ============================================================
   7. AÑO DINÁMICO EN EL FOOTER
============================================================ */
function initYear() {
  const el = $('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* ============================================================
   8. EFECTO RIPPLE EN BOTONES
============================================================ */
function initRipple() {
  if (!$('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
    document.head.appendChild(style);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn || btn.disabled) return;

    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);

    Object.assign(ripple.style, {
      position:     'absolute',
      width:        `${size}px`,
      height:       `${size}px`,
      left:         `${e.clientX - rect.left - size / 2}px`,
      top:          `${e.clientY - rect.top  - size / 2}px`,
      borderRadius: '50%',
      background:   'rgba(255,255,255,0.3)',
      transform:    'scale(0)',
      animation:    'ripple 0.6s linear',
      pointerEvents:'none',
    });

    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}


/* ============================================================
   9. SCROLL SPY — RESALTA LINK ACTIVO EN NAV DESKTOP
============================================================ */
function initScrollSpy() {
  const sections = $$('section[id]');
  const links    = $$('.nav__link[href^="#"]');
  if (!sections.length || !links.length) return;

  const OFFSET = 120;
  let spyTick = false;

  function update() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - OFFSET) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', () => {
    if (!spyTick) {
      requestAnimationFrame(() => { update(); spyTick = false; });
      spyTick = true;
    }
  }, { passive: true });

  update();
}


/* ============================================================
   10. FORMULARIO DE CONTACTO
============================================================ */
function initContactForm() {
  const form        = $('#contactForm');
  const formSuccess = $('#formSuccess');
  const successName = $('#successName');
  const submitBtn   = $('#submitBtn');

  if (!form) return;

  const RULES = {
    nombre: {
      validate: v => v.trim().length >= 2,
      message:  'Por favor ingresá tu nombre completo.',
    },
    telefono: {
      validate: v => /^[\d\s\-\+\(\)]{7,15}$/.test(v.trim()),
      message:  'Ingresá un número válido (7 a 15 dígitos).',
    },
    email: {
      validate: v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message:  'El email no parece válido.',
    },
    fechaEvento: {
      validate: (v) => {
        if (!v) return false;
        const selected = new Date(v);
        const today    = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      message: 'La fecha debe ser hoy o en el futuro.',
    },
    servicio: {
      validate: v => v !== '',
      message:  'Seleccioná qué necesitás.',
    },
    acepta: {
      validate: () => form.querySelector('#acepta').checked,
      message:  'Necesitamos tu aceptación para poder contactarte.',
    },
  };

  function validateField(fieldId) {
    const rule  = RULES[fieldId];
    if (!rule) return true;

    const input = $(`#${fieldId}`, form);
    const error = $(`#${fieldId}Error`);
    if (!input) return true;

    const value   = input.type === 'checkbox' ? '' : input.value;
    const isValid = rule.validate(value);

    if (error) error.textContent = isValid ? '' : rule.message;
    input.classList.toggle('has-error', !isValid);
    input.classList.toggle('is-valid',   isValid && value.trim() !== '');

    return isValid;
  }

  Object.keys(RULES).forEach(id => {
    const input = $(`#${id}`, form);
    if (!input) return;

    const eventType = input.type === 'checkbox' ? 'change' : 'blur';
    input.addEventListener(eventType, () => validateField(id));

    if (input.tagName === 'INPUT' && input.type !== 'checkbox') {
      input.addEventListener('input', () => {
        if (input.classList.contains('has-error')) validateField(id);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const requiredFields = ['nombre', 'telefono', 'email', 'fechaEvento', 'servicio', 'acepta'];
    const results = requiredFields.map(id => validateField(id));
    const allValid = results.every(Boolean);

    if (!allValid) {
      const firstError = form.querySelector('.has-error, input:invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    setTimeout(() => {
      const nombre = form.querySelector('#nombre').value.trim().split(' ')[0];
      form.hidden = true;
      formSuccess.hidden = false;
      if (successName) successName.textContent = nombre;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1200);
  });
}


/* ============================================================
   11. CONTADOR DE CARACTERES EN TEXTAREA
============================================================ */
function initCharCounter() {
  const textarea  = $('#mensaje');
  const counter   = $('#charCount');
  if (!textarea || !counter) return;

  const max = parseInt(textarea.getAttribute('maxlength'), 10) || 600;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.style.color = len > max * 0.9
      ? 'var(--color-error)'
      : 'var(--color-text-muted)';
  });
}


/* ============================================================
   INICIALIZACIÓN
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initMobileSubmenu();   // ← Nuevo: submenú de combos en mobile
  initSmoothScroll();
  initReveal();
  initYear();
  initRipple();
  initScrollSpy();
  initContactForm();
  initCharCounter();

  console.log('🎉 Patulandia — scripts cargados correctamente v2');
});
