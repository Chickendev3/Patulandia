/**
 * FIESTAYA — SCRIPT PRINCIPAL
 * ===========================
 * Interacciones puras en JavaScript vanilla (sin frameworks).
 *
 * Módulos:
 * 1. Header con efecto scroll
 * 2. Menú hamburguesa (mobile)
 * 3. Scroll suave para anclas internas
 * 4. Animaciones "reveal" al entrar al viewport
 * 5. Cerrar menú mobile al hacer click en un enlace
 * 6. Año dinámico en el footer
 * 7. Efecto ripple en botones
 * 8. Lazy load de imágenes de avatar
 */

'use strict';

/* ============================================================
   UTILIDADES
============================================================ */

/**
 * Shorthand para querySelector
 * @param {string} selector
 * @param {Element} [context=document]
 */
const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Shorthand para querySelectorAll (devuelve array)
 * @param {string} selector
 * @param {Element} [context=document]
 */
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];


/* ============================================================
   1. HEADER — EFECTO SOMBRA AL HACER SCROLL
   Agrega clase "scrolled" cuando el usuario baja de 10px.
   Esto activa la sombra del header via CSS.
============================================================ */
function initHeaderScroll() {
  const header = $('#header');
  if (!header) return;

  const SCROLL_THRESHOLD = 10;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Listener con throttle simple para rendimiento
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Ejecutar inmediatamente por si la página carga con scroll
  onScroll();
}


/* ============================================================
   2. MENÚ HAMBURGUESA (MOBILE)
   Alterna clases y atributos ARIA para accesibilidad.
============================================================ */
function initHamburger() {
  const hamburger = $('#hamburger');
  const navMobile  = $('#navMobile');
  if (!hamburger || !navMobile) return;

  function toggleMenu() {
    const isOpen = hamburger.classList.toggle('open');
    navMobile.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navMobile.setAttribute('aria-hidden', String(!isOpen));

    // Evitar scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) {
      toggleMenu();
      hamburger.focus();
    }
  });
}


/* ============================================================
   3. SCROLL SUAVE PARA ANCLAS INTERNAS
   Intercepta clicks en links del tipo href="#seccion"
   y hace scroll suave descontando la altura del header.
============================================================ */
function initSmoothScroll() {
  const HEADER_OFFSET = 80; // Altura del header fijo

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return; // Skip si apunta a nada

    const target = $(targetId);
    if (!target) return;

    e.preventDefault();

    const targetPosition = target.getBoundingClientRect().top
      + window.scrollY
      - HEADER_OFFSET;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });

    // Actualizar URL sin recargar
    history.pushState(null, '', targetId);

    // Foco accesible en el elemento destino
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}


/* ============================================================
   4. ANIMACIONES REVEAL AL ENTRAR AL VIEWPORT
   Usa IntersectionObserver para agregar la clase "visible"
   cuando un elemento con clase "reveal" entra en pantalla.
============================================================ */
function initRevealAnimations() {
  const elements = $$('.reveal');
  if (elements.length === 0) return;

  // Si el navegador no soporta IntersectionObserver, mostrar todo
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Dejar de observar una vez que ya apareció
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,        // El 12% del elemento debe ser visible
      rootMargin: '0px 0px -40px 0px', // Trigger un poco antes del borde
    }
  );

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   5. CERRAR MENÚ MOBILE AL CLICKEAR UN ENLACE
   Mejora UX: el menú se cierra automáticamente al navegar.
============================================================ */
function initCloseMobileMenuOnLink() {
  const hamburger = $('#hamburger');
  const navMobile  = $('#navMobile');
  if (!hamburger || !navMobile) return;

  const links = $$('.nav-mobile__link', navMobile);

  links.forEach((link) => {
    link.addEventListener('click', () => {
      // Solo cerrar si el menú está abierto
      if (hamburger.classList.contains('open')) {
        hamburger.classList.remove('open');
        navMobile.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navMobile.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  });
}


/* ============================================================
   6. AÑO DINÁMICO EN EL FOOTER
   Evita tener que actualizar el año manualmente.
============================================================ */
function initCurrentYear() {
  const yearEl = $('#currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


/* ============================================================
   7. EFECTO RIPPLE EN BOTONES
   Animación de onda al hacer click, estilo Material Design.
   Puramente en JS + CSS inline, sin dependencias.
============================================================ */
function initRippleEffect() {
  const buttons = $$('.btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      // Crear elemento de ripple
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';

      // Calcular posición relativa al botón
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top  - size / 2;

      // Aplicar estilos inline (sin necesidad de nueva clase en CSS)
      Object.assign(ripple.style, {
        width:      `${size}px`,
        height:     `${size}px`,
        left:       `${x}px`,
        top:        `${y}px`,
        position:   'absolute',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.3)',
        transform:  'scale(0)',
        animation:  'rippleAnim 0.6s linear',
        pointerEvents: 'none',
      });

      // El botón necesita position relative
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';

      btn.appendChild(ripple);

      // Eliminar el elemento después de la animación
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Inyectar keyframe de ripple en el documento (solo una vez)
  if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}


/* ============================================================
   8. HIGHLIGHT ACTIVO EN NAVEGACIÓN
   Marca como "activo" el link de la nav que corresponde
   a la sección visible actualmente (scroll spy básico).
============================================================ */
function initScrollSpy() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link[href^="#"]');
  if (sections.length === 0 || navLinks.length === 0) return;

  const OFFSET = 120;

  function updateActiveLink() {
    let current = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - OFFSET;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('nav__link--active');
      }
    });
  }

  let spyTicking = false;
  window.addEventListener('scroll', () => {
    if (!spyTicking) {
      window.requestAnimationFrame(() => {
        updateActiveLink();
        spyTicking = false;
      });
      spyTicking = true;
    }
  }, { passive: true });

  // Ejecutar al cargar
  updateActiveLink();
}


/* ============================================================
   INICIALIZACIÓN
   Todos los módulos se inicializan cuando el DOM está listo.
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initHamburger();
  initSmoothScroll();
  initRevealAnimations();
  initCloseMobileMenuOnLink();
  initCurrentYear();
  initRippleEffect();
  initScrollSpy();

  console.log('🎉 FiestaYa — scripts cargados correctamente');
});
