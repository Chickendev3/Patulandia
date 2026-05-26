/**
 * PATULANDIA — ARMAR-EVENTO.JS
 * =============================
 * Script específico de la página "Armá tu evento".
 * Se carga DESPUÉS de index.js (que maneja header, menú, ripple, etc.)
 *
 * Módulos:
 * 1.  Estado global del simulador
 * 2.  Contador de invitados (qty buttons)
 * 3.  Toggles de edad y espacio
 * 4.  Cards de juegos — selección interactiva
 * 5.  Recomendaciones automáticas
 * 6.  Panel de resumen — actualización en tiempo real
 * 7.  Barra de progreso visual (pasos)
 * 8.  Lógica de precios (base + incremento por cantidad)
 * 9.  Generación de mensaje WhatsApp
 * 10. Contador de caracteres en textarea de notas
 * 11. Fecha del evento — actualización en resumen
 * 12. Inicialización
 */

'use strict';

/* ============================================================
   UTILIDADES LOCALES
============================================================ */
const $el  = (id)       => document.getElementById(id);
const $qs  = (sel)      => document.querySelector(sel);
const $qsa = (sel)      => [...document.querySelectorAll(sel)];

/** Formatea número como precio argentino ($1.000) */
function formatPrice(n) {
  return '$' + n.toLocaleString('es-AR');
}

/** Animación suave de contador numérico */
function animateCounter(el, from, to, duration = 350) {
  if (!el) return;
  const start = performance.now();
  const diff  = to - from;
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Easing out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatPrice(Math.round(from + diff * ease));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


/* ============================================================
   1. ESTADO GLOBAL DEL SIMULADOR
   Fuente única de verdad para todos los módulos.
============================================================ */
const state = {
  invitados: 20,
  edad:      '3-6',       // '3-6' | '7-10' | '11-15' | 'adultos'
  espacio:   'exterior',  // 'exterior' | 'interior'
  fecha:     '',
  nombre:    '',
  notas:     '',
  juegos:    new Set(),   // IDs de juegos seleccionados
  totalBase: 0,
};

/** Etiqueta legible para mostrar en resumen */
const EDAD_LABELS = {
  '3-6':    '3–6 años',
  '7-10':   '7–10 años',
  '11-15':  '11–15 años',
  'adultos': 'Adultos',
};

const ESPACIO_LABELS = {
  'exterior': 'Exterior',
  'interior': 'Interior',
};


/* ============================================================
   2. CONTADOR DE INVITADOS
============================================================ */
function initQtyCounter() {
  const qtyInput = $el('qty-input');
  const qtyMinus = $el('qty-minus');
  const qtyPlus  = $el('qty-plus');
  if (!qtyInput || !qtyMinus || !qtyPlus) return;

  function updateQty(value) {
    const clamped = Math.max(5, Math.min(300, value));
    state.invitados = clamped;
    qtyInput.value  = clamped;
    updateSummary();
    updateRecommendations();
  }

  qtyMinus.addEventListener('click', () => updateQty(state.invitados - 5));
  qtyPlus.addEventListener('click',  () => updateQty(state.invitados + 5));

  qtyInput.addEventListener('change', () => {
    const val = parseInt(qtyInput.value, 10);
    updateQty(isNaN(val) ? 20 : val);
  });

  qtyInput.addEventListener('blur', () => {
    const val = parseInt(qtyInput.value, 10);
    updateQty(isNaN(val) ? 20 : val);
  });
}


/* ============================================================
   3. TOGGLE BUTTONS — edad y espacio
============================================================ */
function initToggleGroups() {

  // Grupo: Edad
  $qsa('[data-edad]').forEach(btn => {
    btn.addEventListener('click', () => {
      $qsa('[data-edad]').forEach(b => b.classList.remove('toggle-btn--active'));
      btn.classList.add('toggle-btn--active');
      state.edad = btn.dataset.edad;
      updateSummary();
      updateRecommendations();
      updateProgressBar();
    });
  });

  // Grupo: Espacio
  $qsa('[data-espacio]').forEach(btn => {
    btn.addEventListener('click', () => {
      $qsa('[data-espacio]').forEach(b => b.classList.remove('toggle-btn--active'));
      btn.classList.add('toggle-btn--active');
      state.espacio = btn.dataset.espacio;
      updateSummary();
      updateRecommendations();
    });
  });
}


/* ============================================================
   4. CARDS DE JUEGOS — selección interactiva
============================================================ */
function initGameCards() {
  const cards = $qsa('.game-card');

  cards.forEach(card => {
    // Click con ratón
    card.addEventListener('click', () => toggleCard(card));

    // Accesibilidad: Enter y Espacio activan la card
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });
}

/**
 * Alterna la selección de una game-card.
 * @param {HTMLElement} card
 */
function toggleCard(card) {
  const id = card.dataset.id;
  if (!id) return;

  const isActive = card.classList.contains('active');

  if (isActive) {
    card.classList.remove('active');
    card.setAttribute('aria-pressed', 'false');
    state.juegos.delete(id);
  } else {
    card.classList.add('active');
    card.setAttribute('aria-pressed', 'true');
    state.juegos.add(id);
  }

  updateSelectionCounter();
  updateSummary();
  updateSubmitButtons();
  updateProgressBar();
}

/** Actualiza el contador "X juegos seleccionados" */
function updateSelectionCounter() {
  const countEl = $el('selection-count');
  if (countEl) countEl.textContent = state.juegos.size;
}


/* ============================================================
   5. RECOMENDACIONES AUTOMÁTICAS
   Sugiere juegos según edad, espacio e invitados.
============================================================ */

const RECOMMENDATIONS = {
  '3-6':    {
    exterior: '🏰 Inflable Chico o 🧸 Plaza Blanda — perfectos para los más pequeños al aire libre.',
    interior: '🏰 Inflable Chico — cabe en espacios cubiertos y es ideal para esta edad.',
  },
  '7-10':   {
    exterior: '🏯 Inflable Grande o 🤸 Cama Elástica — combo ideal para chicos activos.',
    interior: '⚽ Metegol + 🎱 Pool — diversión garantizada para esta edad.',
  },
  '11-15':  {
    exterior: '🎱 Pool + ⚽ Metegol — perfectos para adolescentes. Competitivo y divertido.',
    interior: '⚽ Metegol + 🎯Tejo — ideal para festejar en salones o patios cerrados.',
  },
  'adultos': {
    exterior: '🎯 Tejo + 🎱 Pool — clásicos para adultos. Ambiente relajado y festivo.',
    interior: '⚽ Metegol + 🎱 Pool + 🎯 Tejo  — combo premium para eventos de adultos.',
  },
};

function updateRecommendations() {
  const chip    = $el('recommendation-chip');
  const textEl  = $el('recommendation-text');
  if (!chip || !textEl) return;

  const rec = RECOMMENDATIONS[state.edad]?.[state.espacio];
  if (rec) {
    textEl.textContent = rec;
    chip.style.display = '';
  }
}


/* ============================================================
   6. PANEL DE RESUMEN — actualización en tiempo real
============================================================ */

/**
 * Devuelve los datos de un juego desde el DOM.
 * @param {string} id  data-id del .game-card
 */
function getGameData(id) {
  const card = $qs(`.game-card[data-id="${id}"]`);
  if (!card) return null;
  return {
    id:    card.dataset.id,
    name:  card.dataset.name,
    emoji: card.dataset.emoji,
    price: parseInt(card.dataset.price, 10) || 0,
  };
}

/**
 * Calcula el total con pequeño incremento proporcional a invitados.
 * Lógica: base + 2% por cada 10 invitados extra sobre 20.
 */
function calcTotal(basePrice) {
  const extra      = Math.max(0, state.invitados - 20);
  const increments = Math.floor(extra / 10);
  const multiplier = 1 + increments * 0.02;
  return Math.round(basePrice * multiplier);
}

function updateSummary() {
  // 1. Detalles del evento
  const sumInv    = $el('sum-invitados');
  const sumEdad   = $el('sum-edad');
  const sumEsp    = $el('sum-espacio');
  const sumFechaRow = $el('sum-fecha-row');
  const sumFecha  = $el('sum-fecha');

  if (sumInv)  sumInv.textContent  = state.invitados + ' personas';
  if (sumEdad) sumEdad.textContent = EDAD_LABELS[state.edad] || state.edad;
  if (sumEsp)  sumEsp.textContent  = ESPACIO_LABELS[state.espacio] || state.espacio;

  if (state.fecha && sumFechaRow && sumFecha) {
    sumFechaRow.style.display = '';
    // Formatear fecha en español
    const [y, m, d] = state.fecha.split('-');
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    sumFecha.textContent = `${d}/${meses[parseInt(m,10)-1]}/${y}`;
  } else if (sumFechaRow) {
    sumFechaRow.style.display = 'none';
  }

  // 2. Lista de juegos seleccionados
  const summaryItemsEl = $el('summary-items');
  const summaryEmpty   = $el('summary-empty');

  if (!summaryItemsEl) return;

  // Calcular total base
  let baseTotal = 0;
  state.juegos.forEach(id => {
    const g = getGameData(id);
    if (g) baseTotal += g.price;
  });

  const total = calcTotal(baseTotal);
  state.totalBase = baseTotal;

  if (state.juegos.size === 0) {
    // Estado vacío
    summaryItemsEl.innerHTML = '';
    const emptyEl = document.createElement('div');
    emptyEl.className = 'summary-empty';
    emptyEl.id = 'summary-empty';
    emptyEl.innerHTML = '<span class="summary-empty__icon" aria-hidden="true">🎮</span>Todavía no elegiste juegos.<br />¡Seleccioná alguno de arriba!';
    summaryItemsEl.appendChild(emptyEl);
  } else {
    // Lista de juegos
    summaryItemsEl.innerHTML = '';
    state.juegos.forEach(id => {
      const g = getGameData(id);
      if (!g) return;

      const item = document.createElement('div');
      item.className = 'summary-item';
      item.setAttribute('role', 'listitem');
      item.innerHTML = `
        <span class="summary-item__name">
          <span aria-hidden="true">${g.emoji}</span>
          ${g.name}
        </span>
        <div style="display:flex;align-items:center;gap:0.4rem;">
          <span class="summary-item__price">${formatPrice(g.price)}</span>
          <button
            class="summary-item__remove"
            type="button"
            aria-label="Quitar ${g.name}"
            data-remove="${g.id}"
          >✕</button>
        </div>
      `;
      summaryItemsEl.appendChild(item);
    });

    // Eventos de "quitar" en el panel
    summaryItemsEl.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const removeId = btn.dataset.remove;
        const card = $qs(`.game-card[data-id="${removeId}"]`);
        if (card) toggleCard(card);
      });
    });
  }

  // 3. Precio total con animación
  const priceEl = $el('summary-price');
  if (priceEl) {
    const prev = state._lastTotal || 0;
    animateCounter(priceEl, prev, total);
    state._lastTotal = total;

    // Flash verde brief
    priceEl.classList.add('updated');
    setTimeout(() => priceEl.classList.remove('updated'), 400);
  }

  // 4. Barra de completado (0–100% basado en máx 4 juegos)
  const fillEl    = $el('summary-fill');
  const fillLabel = $el('summary-fill-label');
  const pct = Math.min(100, Math.round((state.juegos.size / 4) * 100));

  if (fillEl) {
    fillEl.style.width = pct + '%';
    fillEl.setAttribute('aria-valuenow', pct);
  }

  if (fillLabel) {
    if (state.juegos.size === 0) {
      fillLabel.textContent = 'Agregá juegos para armar tu combo';
    } else if (state.juegos.size === 1) {
      fillLabel.textContent = `1 juego — ¡buen comienzo! Podés agregar más 🎉`;
    } else if (pct < 100) {
      fillLabel.textContent = `${state.juegos.size} juegos — combo casi listo ✨`;
    } else {
      fillLabel.textContent = `¡Combo completo! Listo para consultar 🚀`;
    }
  }

  // 5. Actualizar link de WhatsApp con el resumen
  updateWhatsAppLink(total);
}


/* ============================================================
   7. BARRA DE PROGRESO (pasos del hero)
============================================================ */
function updateProgressBar() {
  // Paso 1: siempre activo
  // Paso 2: cuando hay al menos 1 juego seleccionado
  // Paso 3: cuando hay al menos 2 juegos

  const dot1 = $el('step-dot-1');
  const dot2 = $el('step-dot-2');
  const dot3 = $el('step-dot-3');

  const hasGames    = state.juegos.size >= 1;
  const hasMultiple = state.juegos.size >= 2;

  if (dot1) {
    dot1.classList.toggle('progress-bar__step--done',   hasGames);
    dot1.classList.toggle('progress-bar__step--active', !hasGames);
  }
  if (dot2) {
    dot2.classList.toggle('progress-bar__step--done',   hasMultiple);
    dot2.classList.toggle('progress-bar__step--active', hasGames && !hasMultiple);
  }
  if (dot3) {
    dot3.classList.toggle('progress-bar__step--active', hasMultiple);
  }
}


/* ============================================================
   8. BOTONES DE ENVÍO (habilitar/deshabilitar)
============================================================ */
function updateSubmitButtons() {
  const btnDesktop = $el('btn-submit-desktop');
  const btnMobile  = $el('btn-submit-mobile');
  const hintMobile = $el('hint-mobile');
  const hasGames   = state.juegos.size > 0;

  if (btnDesktop) btnDesktop.disabled = !hasGames;
  if (btnMobile)  btnMobile.disabled  = !hasGames;

  if (hintMobile) {
    hintMobile.textContent = hasGames
      ? '¡Todo listo! Te vamos a contactar en menos de 1 hora.'
      : 'Seleccioná al menos un juego para continuar';
  }
}


/* ============================================================
   9. GENERACIÓN DEL MENSAJE WHATSAPP
============================================================ */
function buildWhatsAppMessage() {
  const juegosLista = [...state.juegos].map(id => {
    const g = getGameData(id);
    return g ? `${g.emoji} ${g.name}` : id;
  }).join(', ');

  const nombreStr  = state.nombre ? `Hola, soy ${state.nombre}! ` : 'Hola Patulandia! ';
  const fechaStr   = state.fecha ? `Fecha del evento: ${state.fecha}. ` : '';
  const notasStr   = state.notas ? `Notas: ${state.notas}. ` : '';
  const totalStr   = formatPrice(calcTotal(state.totalBase));

  return encodeURIComponent(
    `${nombreStr}Quiero consultar por un evento.\n\n` +
    `👥 Invitados: ${state.invitados}\n` +
    `🎂 Edad: ${EDAD_LABELS[state.edad]}\n` +
    `📍 Espacio: ${ESPACIO_LABELS[state.espacio]}\n` +
    `${fechaStr}` +
    `\n🎮 Juegos elegidos: ${juegosLista || 'Sin definir'}\n` +
    `💰 Estimado: ${totalStr}\n` +
    `${notasStr}` +
    `\n¡Espero su respuesta!`
  );
}

function updateWhatsAppLink(total) {
  const msg         = buildWhatsAppMessage();
  const baseUrl     = `https://wa.me/5491161980246?text=${msg}`;
  const waLink      = $el('summary-whatsapp-link');
  const btnDesktop  = $el('btn-submit-desktop');
  const btnMobile   = $el('btn-submit-mobile');

  if (waLink) waLink.href = baseUrl;

  // Actualizar handlers de los botones
  [btnDesktop, btnMobile].forEach(btn => {
    if (!btn) return;
    // Remover listener previo clonando el nodo
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      if (!newBtn.disabled) {
        window.open(baseUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // Re-bind el estado disabled después de clonar
  const newDesktop = $el('btn-submit-desktop');
  const newMobile  = $el('btn-submit-mobile');
  const hasGames   = state.juegos.size > 0;
  if (newDesktop) newDesktop.disabled = !hasGames;
  if (newMobile)  newMobile.disabled  = !hasGames;
}


/* ============================================================
   10. CONTADOR DE CARACTERES EN NOTAS
============================================================ */
function initNotasCounter() {
  const textarea = $el('notas');
  const counter  = $el('notas-counter');
  if (!textarea || !counter) return;

  const max = parseInt(textarea.getAttribute('maxlength'), 10) || 400;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${max} caracteres`;
    counter.style.color = len > max * 0.85
      ? 'var(--color-error)'
      : 'var(--color-text-muted)';
    state.notas = textarea.value;
    updateWhatsAppLink(calcTotal(state.totalBase));
  });
}


/* ============================================================
   11. CAMPO DE FECHA
============================================================ */
function initFechaField() {
  const fechaInput = $el('fecha-evento');
  if (!fechaInput) return;

  // Establecer mínimo en hoy
  const today = new Date().toISOString().split('T')[0];
  fechaInput.setAttribute('min', today);

  fechaInput.addEventListener('change', () => {
    state.fecha = fechaInput.value;
    updateSummary();
  });
}


/* ============================================================
   12. CAMPO DE NOMBRE
============================================================ */
function initNombreField() {
  const nombreInput = $el('nombre-contacto');
  if (!nombreInput) return;

  nombreInput.addEventListener('input', () => {
    state.nombre = nombreInput.value.trim();
    updateWhatsAppLink(calcTotal(state.totalBase));
  });
}


/* ============================================================
   INICIALIZACIÓN
   Se ejecuta cuando el DOM está completamente listo.
   Complementa los módulos ya iniciados por index.js.
============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Verificar que estamos en la página correcta
  if (!$el('simulador')) return;

  initQtyCounter();
  initToggleGroups();
  initGameCards();
  initNotasCounter();
  initFechaField();
  initNombreField();
  initResetButton();

  // Estado inicial
  updateRecommendations();
  updateSummary();
  updateSubmitButtons();
  updateProgressBar();

  console.log('🎪 Patulandia — Simulador de eventos cargado');
});


/* ============================================================
   12. REINICIAR SIMULADOR
   Vuelve todo al estado inicial sin recargar la página.
============================================================ */
function initResetButton() {
  const btns = [$el('btn-reset'), $el('btn-reset-panel')];
  btns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', resetSimulator);
  });
}

function resetSimulator() {
  // 1. Resetear estado
  state.invitados = 20;
  state.edad      = '3-6';
  state.espacio   = 'exterior';
  state.fecha     = '';
  state.nombre    = '';
  state.notas     = '';
  state.juegos    = new Set();
  state.totalBase = 0;
  state._lastTotal = 0;

  // 2. Resetear campo invitados
  const qtyInput = $el('qty-input');
  if (qtyInput) qtyInput.value = 20;

  // 3. Resetear toggles edad
  $qsa('[data-edad]').forEach(b => b.classList.remove('toggle-btn--active'));
  const btnEdad = $qs('[data-edad="3-6"]');
  if (btnEdad) btnEdad.classList.add('toggle-btn--active');

  // 4. Resetear toggles espacio
  $qsa('[data-espacio]').forEach(b => b.classList.remove('toggle-btn--active'));
  const btnEsp = $qs('[data-espacio="exterior"]');
  if (btnEsp) btnEsp.classList.add('toggle-btn--active');

  // 5. Deseleccionar todas las cards
  $qsa('.game-card').forEach(card => {
    card.classList.remove('active');
    card.setAttribute('aria-pressed', 'false');
  });

  // 6. Limpiar campos de texto
  const fecha   = $el('fecha-evento');
  const nombre  = $el('nombre-contacto');
  const notas   = $el('notas');
  const counter = $el('notas-counter');
  if (fecha)   fecha.value   = '';
  if (nombre)  nombre.value  = '';
  if (notas)   notas.value   = '';
  if (counter) counter.textContent = '0 / 400 caracteres';

  // 7. Actualizar todo
  updateSelectionCounter();
  updateRecommendations();
  updateSummary();
  updateSubmitButtons();
  updateProgressBar();

  // 8. Feedback visual — scroll al top del simulador + animación
  const simulador = $el('simulador');
  if (simulador) {
    simulador.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Flash breve en el botón
  const btns = [$el('btn-reset'), $el('btn-reset-panel')];
  btns.forEach(btn => {
    if (!btn) return;
    btn.textContent = '✓ ¡Listo!';
    btn.classList.add('btn-reset-simulator--done');
    setTimeout(() => {
      btn.innerHTML = '<span aria-hidden="true">↺</span> Reiniciar simulador';
      btn.classList.remove('btn-reset-simulator--done');
    }, 1400);
  });

  // El de panel tiene texto más corto
  const panelBtn = $el('btn-reset-panel');
  if (panelBtn) {
    setTimeout(() => {
      panelBtn.innerHTML = '<span aria-hidden="true">↺</span> Reiniciar';
    }, 1401);
  }
}
