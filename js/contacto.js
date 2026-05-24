/**
 * PATULANDIA — contacto.js  (versión corregida)
 *
 * Fixes aplicados:
 *  - FAQ: eliminado manejo de `hidden`; solo se toggle la clase is-open
 *    (el CSS ya controla visibilidad con max-height)
 *  - Formulario: submitBtn ya no queda disabled si hay errores;
 *    se rehabilita correctamente después de un error
 *  - Fecha: fix de zona horaria (parseo local en vez de UTC)
 *  - Selects: listeners de change registrados correctamente desde el inicio
 *  - Año dinámico: ya no depende de index.js
 *  - Header scroll: incorporado aquí para no necesitar index.js
 */

'use strict';

/* ============================================================
   0. UTILIDADES
============================================================ */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];


/* ============================================================
   1. HEADER — scroll shadow (antes vivía en index.js)
============================================================ */
(function initHeaderScroll() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
})();


/* ============================================================
   2. MENÚ HAMBURGUESA MOBILE
============================================================ */
(function initHamburger() {
  const hamburger = $('#hamburger');
  const navMobile = $('#navMobile');
  const navOverlay = $('#navOverlay');
  const navClose  = $('#navClose');

  if (!hamburger || !navMobile) return;

  function openMenu() {
    navMobile.classList.add('is-open');
    navOverlay?.classList.add('is-visible');
    navMobile.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMobile.classList.remove('is-open');
    navOverlay?.classList.remove('is-visible');
    navMobile.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  navClose?.addEventListener('click', closeMenu);
  navOverlay?.addEventListener('click', closeMenu);

  $$('.nav-mobile__link', navMobile).forEach(link =>
    link.addEventListener('click', closeMenu)
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobile.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();


/* ============================================================
   3. FECHA MÍNIMA — no permite fechas pasadas
============================================================ */
(function setMinDate() {
  const fechaInput = $('#fecha');
  if (!fechaInput) return;

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd   = String(hoy.getDate()).padStart(2, '0');
  fechaInput.min = `${yyyy}-${mm}-${dd}`;
})();


/* ============================================================
   4. CONTADOR DE CARACTERES DEL TEXTAREA
============================================================ */
(function initCharCounter() {
  const textarea = $('#mensaje');
  const counter  = $('#charCount');
  if (!textarea || !counter) return;

  const MAX = parseInt(textarea.getAttribute('maxlength'), 10) || 600;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${MAX}`;
    counter.style.color = len > MAX * 0.9
      ? 'var(--color-orange)'
      : 'var(--color-text-muted)';
  });
})();


/* ============================================================
   5. VALIDACIÓN DEL FORMULARIO
============================================================ */
(function initFormValidation() {
  const form      = $('#contactForm');
  const submitBtn = $('#submitBtn');
  if (!form) return;

  /* ── Reglas de validación ── */
  const rules = {
    nombre: {
      validate: (v) => v.trim().length >= 2,
      message: 'Ingresá tu nombre (mínimo 2 caracteres)'
    },
    telefono: {
      validate: (v) => /^[\d\s\-\+\(\)]{7,}$/.test(v.trim()),
      message: 'Ingresá un teléfono válido (mínimo 7 dígitos)'
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Ingresá un email válido (ej: nombre@email.com)'
    },
    tipoEvento: {
      validate: (v) => v !== '',
      message: 'Seleccioná el tipo de evento'
    },
    invitados: {
      validate: (v) => v !== '',
      message: 'Seleccioná la cantidad de invitados'
    },
    fecha: {
      validate: (v) => {
        if (!v) return false;
        // FIX: parseo local para evitar desfase de timezone UTC
        const [year, month, day] = v.split('-').map(Number);
        const selected = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      message: 'Seleccioná una fecha válida (no puede ser en el pasado)'
    },
    ubicacion: {
      validate: (v) => v.trim().length >= 3,
      message: 'Ingresá tu barrio o localidad'
    }
  };

  function validateField(input) {
    const name  = input.name;
    const rule  = rules[name];
    if (!rule) return true;

    const isValid = rule.validate(input.value);
    const errorEl = $(`#${name}Error`);

    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      if (errorEl) errorEl.textContent = rule.message;
    }

    return isValid;
  }

  function validateAcepta() {
    const checkbox = $('#acepta');
    const errorEl  = $('#aceptaError');
    if (!checkbox) return true;

    const isValid = checkbox.checked;
    if (errorEl) {
      errorEl.textContent = isValid ? '' : 'Necesitamos tu consentimiento para contactarte';
    }
    return isValid;
  }

  /* ── Listeners en tiempo real ──
     FIX: se agrega siempre el listener de change/input,
     no solo cuando el campo ya fue tocado.
     Para selects se usa 'change'; para el resto 'input' + 'blur'.
  ── */
  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    if (!input) return;

    if (input.tagName === 'SELECT') {
      // Los selects validan inmediatamente al cambiar
      input.addEventListener('change', () => validateField(input));
    } else {
      // Inputs de texto: valida al salir (blur) y también al escribir
      // si el campo ya fue marcado como válido o inválido
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid') || input.classList.contains('is-valid')) {
          validateField(input);
        }
      });
    }
  });

  $('#acepta')?.addEventListener('change', validateAcepta);

  /* ── Submit ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;

    Object.keys(rules).forEach(name => {
      const input = form.elements[name];
      if (input && !validateField(input)) allValid = false;
    });

    if (!validateAcepta()) allValid = false;

    if (!allValid) {
      // FIX: NO deshabilitar el botón si hay errores
      const firstError = form.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // ── Simulación de envío ──
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando… ⏳';

    setTimeout(() => {
      showSuccessMessage(form.elements['nombre'].value.trim());
    }, 1500);
  });

  function showSuccessMessage(nombre) {
    const successDiv  = $('#formSuccess');
    const successName = $('#successName');

    // Rehabilitar el botón como fallback por si algo falla
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar consulta 🎈';

    if (!successDiv) return;

    if (successName) successName.textContent = nombre || 'usuario';

    // Mostrar mensaje de éxito, ocultar form
    form.style.display = 'none';
    successDiv.removeAttribute('hidden');
    successDiv.style.display = 'block';
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Después de 4 segundos: ocultar éxito, resetear y mostrar el form de nuevo
    setTimeout(() => {
      successDiv.style.display = 'none';
      successDiv.setAttribute('hidden', '');
      form.reset();
      // Limpiar clases de validación de todos los campos
      $$('.is-valid, .is-invalid', form).forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });
      // Limpiar mensajes de error
      $$('.form__error', form).forEach(el => { el.textContent = ''; });
      // Resetear contador de caracteres
      const counter = $('#charCount');
      if (counter) counter.textContent = '0 / 600';
      form.style.display = '';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 4000);
  }
})();


/* ============================================================
   6. ACORDEÓN FAQ
   FIX PRINCIPAL: eliminado todo manejo de `hidden`.
   El CSS controla la visibilidad con max-height: 0 / max-height: 400px
   según la clase is-open. Solo toggleamos la clase.
============================================================ */
(function initFAQ() {
  const faqItems = $$('.faq__item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Cierra todos los demás (acordeón)
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.faq__question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          // NO tocar .hidden — el CSS lo maneja
        }
      });

      // Toggle del ítem actual
      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Navegación con teclado entre preguntas
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        item.nextElementSibling?.querySelector('.faq__question')?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        item.previousElementSibling?.querySelector('.faq__question')?.focus();
      }
    });
  });
})();


/* ============================================================
   7. ANIMACIONES REVEAL AL SCROLL
============================================================ */
(function initReveal() {
  const revealEls = $$('.reveal');
  if (!revealEls.length) return;

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => observer.observe(el));
})();


/* ============================================================
   8. AÑO DINÁMICO EN EL FOOTER
============================================================ */
(function setCurrentYear() {
  const yearEl = $('#currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
