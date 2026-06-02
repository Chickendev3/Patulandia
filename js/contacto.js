/**
 * PATULANDIA — contacto.js
 *
 * Solo lógica específica de la página de contacto:
 *  - Fecha mínima del input date
 *  - Contador de caracteres del textarea
 *  - Validación y envío del formulario
 *  - Acordeón FAQ
 *  - Animaciones reveal al scroll
 *
 * El menú hamburguesa, submenú mobile, header scroll,
 * año dinámico y ripple los maneja index.js.
 * Este archivo debe cargarse ANTES que index.js en el HTML.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. FECHA MÍNIMA — no permite fechas pasadas
  ============================================================ */
  (function setMinDate() {
    const fechaInput = document.querySelector('#fecha');
    if (!fechaInput) return;

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd   = String(hoy.getDate()).padStart(2, '0');
    fechaInput.min = `${yyyy}-${mm}-${dd}`;
  })();


  /* ============================================================
     2. CONTADOR DE CARACTERES DEL TEXTAREA
  ============================================================ */
  (function initCharCounter() {
    const textarea = document.querySelector('#mensaje');
    const counter  = document.querySelector('#charCount');
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
     3. VALIDACIÓN DEL FORMULARIO
  ============================================================ */
  (function initFormValidation() {
    const form      = document.querySelector('#contactForm');
    const submitBtn = document.querySelector('#submitBtn');
    if (!form) return;

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
      const errorEl = document.querySelector(`#${name}Error`);

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
      const checkbox = document.querySelector('#acepta');
      const errorEl  = document.querySelector('#aceptaError');
      if (!checkbox) return true;

      const isValid = checkbox.checked;
      if (errorEl) {
        errorEl.textContent = isValid ? '' : 'Necesitamos tu consentimiento para contactarte';
      }
      return isValid;
    }

    Object.keys(rules).forEach(name => {
      const input = form.elements[name];
      if (!input) return;

      if (input.tagName === 'SELECT') {
        input.addEventListener('change', () => validateField(input));
      } else {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid') || input.classList.contains('is-valid')) {
            validateField(input);
          }
        });
      }
    });

    document.querySelector('#acepta')?.addEventListener('change', validateAcepta);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let allValid = true;

      Object.keys(rules).forEach(name => {
        const input = form.elements[name];
        if (input && !validateField(input)) allValid = false;
      });

      if (!validateAcepta()) allValid = false;

      if (!allValid) {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando… ⏳';

      setTimeout(() => {
        showSuccessMessage(form.elements['nombre'].value.trim());
      }, 1500);
    });

    function showSuccessMessage(nombre) {
      const successDiv  = document.querySelector('#formSuccess');
      const successName = document.querySelector('#successName');

      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar consulta 🎈';

      if (!successDiv) return;

      if (successName) successName.textContent = nombre || 'usuario';

      form.style.display = 'none';
      successDiv.removeAttribute('hidden');
      successDiv.style.display = 'block';
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => {
        successDiv.style.display = 'none';
        successDiv.setAttribute('hidden', '');
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
          el.classList.remove('is-valid', 'is-invalid');
        });
        form.querySelectorAll('.form__error').forEach(el => { el.textContent = ''; });
        const counter = document.querySelector('#charCount');
        if (counter) counter.textContent = '0 / 600';
        form.style.display = '';
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 4000);
    }
  })();


  /* ============================================================
     4. ACORDEÓN FAQ
  ============================================================ */
  (function initFAQ() {
    const faqItems = [...document.querySelectorAll('.faq__item')];
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const btn    = item.querySelector('.faq__question');
      const answer = item.querySelector('.faq__answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('.faq__question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

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
     5. ANIMACIONES REVEAL AL SCROLL
  ============================================================ */
  (function initReveal() {
    const revealEls = [...document.querySelectorAll('.reveal')];
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

});
