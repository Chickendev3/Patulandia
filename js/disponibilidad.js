/**
 * PATULANDIA — disponibilidad.js
 * ================================
 * Script específico de la página disponibilidad.html.
 * Vanilla JS puro, sin frameworks ni dependencias externas.
 *
 * Módulos:
 * 1.  Datos mockeados (reservas simuladas)
 * 2.  Estado de la aplicación
 * 3.  Utilidades de fecha
 * 4.  Motor del calendario
 * 5.  Filtros por categoría
 * 6.  Panel de detalles
 * 7.  Inicialización
 *
 * Arquitectura preparada para conectar con Firebase / Supabase / API REST.
 * Para integrar un backend: reemplazá `RESERVAS_DATA` con una llamada fetch()
 * al endpoint que devuelva el mismo formato de objeto.
 */

'use strict';

/* ============================================================
   1. DATOS MOCKEADOS
   Estructura lista para reemplazar con llamada a API.
   ─────────────────────────────────────────────────────────
   Formato de cada reserva:
   {
     fecha:     "YYYY-MM-DD",
     producto:  "Nombre del producto",
     categoria: "slug de categoría (para filtros)",
     estado:    "completo" | "limitado" | "disponible",
     horario:   "HH:MM - HH:MM"
   }
============================================================ */
const RESERVAS_DATA = [

  // ── Mayo 2026 ──────────────────────────────────────────────
  { fecha: "2026-05-23", producto: "Inflable 4x4",         categoria: "inflables",     estado: "completo",  horario: "14:00 - 22:00" },
  { fecha: "2026-05-23", producto: "Metegol estándar",     categoria: "metegoles",     estado: "completo",  horario: "14:00 - 22:00" },
  { fecha: "2026-05-24", producto: "Inflable 2x2",         categoria: "inflables",     estado: "limitado",  horario: "15:00 - 20:00" },
  { fecha: "2026-05-24", producto: "Cama elástica grande", categoria: "cama-elastica", estado: "disponible",horario: "Libre" },
  { fecha: "2026-05-25", producto: "Pool de pelotas",      categoria: "pool",          estado: "completo",  horario: "10:00 - 18:00" },
  { fecha: "2026-05-25", producto: "Living 6 personas",    categoria: "livings",       estado: "disponible",horario: "Libre" },
  { fecha: "2026-05-30", producto: "Inflable 3x3",         categoria: "inflables",     estado: "completo",  horario: "12:00 - 20:00" },
  { fecha: "2026-05-30", producto: "Tejo reglamentario",   categoria: "tejo",          estado: "completo",  horario: "12:00 - 20:00" },
  { fecha: "2026-05-31", producto: "Cama elástica grande", categoria: "cama-elastica", estado: "limitado",  horario: "15:00 - 21:00" },

  // ── Junio 2026 ─────────────────────────────────────────────
  { fecha: "2026-06-06", producto: "Inflable 4x4",         categoria: "inflables",     estado: "completo",  horario: "13:00 - 21:00" },
  { fecha: "2026-06-06", producto: "Metegol estándar",     categoria: "metegoles",     estado: "limitado",  horario: "16:00 - 21:00" },
  { fecha: "2026-06-07", producto: "Inflable 2x2",         categoria: "inflables",     estado: "disponible",horario: "Libre" },
  { fecha: "2026-06-07", producto: "Pool de pelotas",      categoria: "pool",          estado: "completo",  horario: "10:00 - 19:00" },
  { fecha: "2026-06-13", producto: "Tejo reglamentario",   categoria: "tejo",          estado: "limitado",  horario: "15:00 - 22:00" },
  { fecha: "2026-06-13", producto: "Living 6 personas",    categoria: "livings",       estado: "disponible",horario: "Libre" },
  { fecha: "2026-06-14", producto: "Inflable 6x4",         categoria: "inflables",     estado: "completo",  horario: "11:00 - 20:00" },
  { fecha: "2026-06-14", producto: "Cama elástica grande", categoria: "cama-elastica", estado: "completo",  horario: "11:00 - 20:00" },
  { fecha: "2026-06-20", producto: "Inflable 3x3",         categoria: "inflables",     estado: "limitado",  horario: "14:00 - 20:00" },
  { fecha: "2026-06-21", producto: "Pool de pelotas",      categoria: "pool",          estado: "disponible",horario: "Libre" },
  { fecha: "2026-06-27", producto: "Metegol estándar",     categoria: "metegoles",     estado: "completo",  horario: "12:00 - 22:00" },
  { fecha: "2026-06-28", producto: "Inflable 4x4",         categoria: "inflables",     estado: "limitado",  horario: "15:00 - 21:00" },
  { fecha: "2026-06-28", producto: "Tejo reglamentario",   categoria: "tejo",          estado: "disponible",horario: "Libre" },

  // ── Julio 2026 ─────────────────────────────────────────────
  { fecha: "2026-07-04", producto: "Inflable 4x4",         categoria: "inflables",     estado: "completo",  horario: "13:00 - 21:00" },
  { fecha: "2026-07-05", producto: "Cama elástica grande", categoria: "cama-elastica", estado: "limitado",  horario: "14:00 - 20:00" },
  { fecha: "2026-07-11", producto: "Pool de pelotas",      categoria: "pool",          estado: "completo",  horario: "10:00 - 18:00" },
  { fecha: "2026-07-12", producto: "Inflable 2x2",         categoria: "inflables",     estado: "disponible",horario: "Libre" },
  { fecha: "2026-07-18", producto: "Tejo reglamentario",   categoria: "tejo",          estado: "completo",  horario: "12:00 - 22:00" },
  { fecha: "2026-07-18", producto: "Living 6 personas",    categoria: "livings",       estado: "limitado",  horario: "16:00 - 22:00" },
  { fecha: "2026-07-19", producto: "Inflable 6x4",         categoria: "inflables",     estado: "completo",  horario: "11:00 - 20:00" },
  { fecha: "2026-07-25", producto: "Metegol estándar",     categoria: "metegoles",     estado: "limitado",  horario: "15:00 - 21:00" },
  { fecha: "2026-07-26", producto: "Inflable 3x3",         categoria: "inflables",     estado: "completo",  horario: "12:00 - 20:00" },
];

/**
 * Catálogo completo de productos (para mostrar disponibilidad completa por día)
 * Si en una fecha no hay reserva de un producto → está libre.
 */
const PRODUCTOS_CATALOGO = [
  { id: "inflables",     nombre: "Inflables",        icon: "🏠" },
  { id: "metegoles",     nombre: "Metegol",           icon: "⚽" },
  { id: "pool",          nombre: "Pool de pelotas",   icon: "🏊" },
  { id: "cama-elastica", nombre: "Cama elástica",     icon: "🤸" },
  { id: "livings",       nombre: "Livings",           icon: "🛋️" },
  { id: "tejo",          nombre: "Tejo",              icon: "🎯" },
];

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const DIAS_SEMANA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];


/* ============================================================
   2. ESTADO DE LA APLICACIÓN
============================================================ */
const state = {
  /** Mes y año actualmente visible */
  viewYear:  new Date().getFullYear(),
  viewMonth: new Date().getMonth(),   // 0-indexed

  /** Fecha seleccionada en el calendario (string "YYYY-MM-DD" o null) */
  selectedDate: null,

  /** Categoría activa en los filtros */
  activeFilter: "todos",
};


/* ============================================================
   3. UTILIDADES DE FECHA
============================================================ */

/**
 * Formatea un Date como "YYYY-MM-DD" en hora local.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Devuelve la fecha de hoy como "YYYY-MM-DD".
 * @returns {string}
 */
function today() {
  return formatDate(new Date());
}

/**
 * Devuelve las reservas de una fecha, filtradas por categoría activa.
 * @param {string} fecha  "YYYY-MM-DD"
 * @returns {Array}
 */
function getReservasPorFecha(fecha) {
  return RESERVAS_DATA.filter(r => {
    if (r.fecha !== fecha) return false;
    if (state.activeFilter !== 'todos' && r.categoria !== state.activeFilter) return false;
    return true;
  });
}

/**
 * Calcula el estado general de un día basándose en sus reservas.
 * @param {string} fecha
 * @returns {"disponible"|"limitado"|"completo"|"libre"}
 */
function calcEstadoDia(fecha) {
  const reservas = getReservasPorFecha(fecha);
  if (!reservas.length) return "libre";

  const tieneCompleto  = reservas.some(r => r.estado === "completo");
  const tieneLimitado  = reservas.some(r => r.estado === "limitado");

  if (tieneCompleto && tieneLimitado) return "limitado";
  if (tieneCompleto) return "completo";
  if (tieneLimitado) return "limitado";
  return "disponible";
}


/* ============================================================
   4. MOTOR DEL CALENDARIO
============================================================ */

/**
 * Renderiza el calendario completo para el mes/año del estado.
 * Aplica animación de transición.
 */
function renderCalendar() {
  const grid = document.getElementById('calGrid');
  const monthName = document.getElementById('calMonthName');
  const monthTag  = document.getElementById('calMonthTag');
  if (!grid) return;

  const { viewYear, viewMonth } = state;
  const todayStr = today();

  // Actualizar cabecera
  monthName.textContent = `${MESES[viewMonth]} ${viewYear}`;

  const now = new Date();
  if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) {
    monthTag.textContent = 'Este mes';
  } else if (
    viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1 ||
    viewYear === now.getFullYear() + 1 && viewMonth === 0 && now.getMonth() === 11
  ) {
    monthTag.textContent = 'Próximo mes';
  } else {
    monthTag.textContent = '';
  }

  // Animación de salida → nueva renderización
  grid.classList.remove('is-animating');
  void grid.offsetWidth; // reflow
  grid.classList.add('is-animating');

  // Limpiar
  grid.innerHTML = '';

  // Primer día del mes (0=Dom, 1=Lun, ...)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Celdas vacías al inicio
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'disp-day disp-day--empty';
    empty.setAttribute('aria-hidden', 'true');
    grid.appendChild(empty);
  }

  // Renderizar cada día
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const estadoDia = calcEstadoDia(dateStr);

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `${d} de ${MESES[viewMonth]}`);

    // Clases base
    let classes = ['disp-day'];

    // ¿Pasado?
    if (dateStr < todayStr) {
      classes.push('disp-day--past');
      cell.setAttribute('aria-disabled', 'true');
    } else {
      // Estado de disponibilidad
      if      (estadoDia === 'completo')   classes.push('disp-day--full');
      else if (estadoDia === 'limitado')   classes.push('disp-day--limited');
      else if (estadoDia === 'disponible') classes.push('disp-day--available');
      // "libre" → sin clase especial (blanco)

      // ¿Es hoy?
      if (dateStr === todayStr) classes.push('disp-day--today');

      // ¿Está seleccionado?
      if (dateStr === state.selectedDate) classes.push('disp-day--selected');

      // Click handler
      cell.addEventListener('click', () => onDayClick(dateStr, d));
    }

    cell.className = classes.join(' ');

    // Número
    const numEl = document.createElement('span');
    numEl.className = 'disp-day__num';
    numEl.textContent = d;
    cell.appendChild(numEl);

    // Dot indicador
    const dot = document.createElement('span');
    dot.className = 'disp-day__dot';
    dot.setAttribute('aria-hidden', 'true');
    cell.appendChild(dot);

    // Descripción accesible del estado
    if (estadoDia !== 'libre' && dateStr >= todayStr) {
      const labels = { completo: 'Completo', limitado: 'Limitado', disponible: 'Disponible' };
      cell.setAttribute('aria-label', `${d} de ${MESES[viewMonth]}, ${labels[estadoDia] || ''}`);
    }

    grid.appendChild(cell);
  }
}

/**
 * Handler al hacer click en un día.
 * @param {string} dateStr
 * @param {number} dayNum
 */
function onDayClick(dateStr, dayNum) {
  state.selectedDate = dateStr;

  // Re-renderizar solo para actualizar la celda seleccionada
  renderCalendar();

  // Actualizar el panel
  renderPanel(dateStr, dayNum);

  // Scroll suave al panel en mobile
  if (window.innerWidth < 900) {
    const panel = document.getElementById('dispPanel');
    if (panel) {
      const top = panel.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}


/* ============================================================
   5. FILTROS POR CATEGORÍA
============================================================ */
function initFilters() {
  const pills = document.querySelectorAll('.disp-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;
      if (filter === state.activeFilter) return;

      // Actualizar estado
      state.activeFilter = filter;
      state.selectedDate = null;

      // Actualizar clases activas
      pills.forEach(p => p.classList.remove('disp-pill--active'));
      pill.classList.add('disp-pill--active');

      // Re-renderizar calendario
      renderCalendar();

      // Ocultar panel
      showPanelEmpty();
    });
  });
}


/* ============================================================
   6. PANEL DE DETALLES
============================================================ */

/** Muestra el estado vacío del panel. */
function showPanelEmpty() {
  const empty  = document.getElementById('panelEmpty');
  const detail = document.getElementById('panelDetail');
  if (empty)  empty.hidden  = false;
  if (detail) detail.hidden = true;
}

/**
 * Renderiza el panel con los detalles de la fecha seleccionada.
 * @param {string} dateStr
 * @param {number} dayNum
 */
function renderPanel(dateStr, dayNum) {
  const empty  = document.getElementById('panelEmpty');
  const detail = document.getElementById('panelDetail');
  if (!empty || !detail) return;

  empty.hidden  = true;
  detail.hidden = false;

  // Parsear fecha
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const diaSemana = DIAS_SEMANA[dateObj.getDay()];

  // Cabecera
  document.getElementById('detailDay').textContent      = dayNum;
  document.getElementById('detailDateFull').textContent = `${diaSemana} ${day} de ${MESES[month-1]}`;
  document.getElementById('detailDateSub').textContent  = `${year}`;

  // Obtener reservas filtradas
  const reservas = getReservasPorFecha(dateStr);

  // Estado general
  const estado = calcEstadoDia(dateStr);
  const badge  = document.getElementById('detailStatusBadge');
  const badgeConfig = {
    completo:   { clase: 'disp-panel__status-badge--full',      texto: '🔴 Completo'   },
    limitado:   { clase: 'disp-panel__status-badge--limited',   texto: '🟡 Limitado'   },
    disponible: { clase: 'disp-panel__status-badge--available', texto: '🟢 Disponible' },
    libre:      { clase: 'disp-panel__status-badge--available', texto: '🟢 Libre'      },
  };
  const cfg = badgeConfig[estado] || badgeConfig.libre;
  badge.className = `disp-panel__status-badge ${cfg.clase}`;
  badge.textContent = cfg.texto;

  // Resumen textual
  const summary = document.getElementById('detailSummary');
  if (reservas.length === 0) {
    summary.textContent = '✅ Sin reservas registradas. Todos los productos disponibles para esta fecha.';
  } else {
    const completos = reservas.filter(r => r.estado === 'completo').length;
    const limitados = reservas.filter(r => r.estado === 'limitado').length;
    let txt = '';
    if (completos)  txt += `${completos} producto${completos > 1 ? 's' : ''} completo${completos > 1 ? 's' : ''}`;
    if (limitados)  txt += (txt ? ', ' : '') + `${limitados} con disponibilidad limitada`;
    summary.textContent = txt ? `${txt}. Consultanos para confirmar disponibilidad.` : '';
  }

  // Lista de productos
  const list = document.getElementById('productsList');
  list.innerHTML = '';

  if (state.activeFilter === 'todos') {
    // Mostrar todos los productos del catálogo con su estado
    PRODUCTOS_CATALOGO.forEach((prod, idx) => {
      const reservasProd = RESERVAS_DATA.filter(r => r.fecha === dateStr && r.categoria === prod.id);
      const estadoProd = calcEstadoProducto(reservasProd);
      const item = buildProductItem(prod, estadoProd, reservasProd, idx);
      list.appendChild(item);
    });
  } else {
    // Mostrar solo el producto filtrado
    const prod = PRODUCTOS_CATALOGO.find(p => p.id === state.activeFilter);
    if (prod) {
      const reservasProd = RESERVAS_DATA.filter(r => r.fecha === dateStr && r.categoria === prod.id);
      const estadoProd = calcEstadoProducto(reservasProd);
      list.appendChild(buildProductItem(prod, estadoProd, reservasProd, 0));
    }
  }
}

/**
 * Calcula el estado de un producto específico para una fecha.
 * @param {Array} reservas  Reservas del producto en esa fecha
 * @returns {"disponible"|"limitado"|"completo"|"libre"}
 */
function calcEstadoProducto(reservas) {
  if (!reservas.length) return "libre";
  if (reservas.some(r => r.estado === 'completo')) return "completo";
  if (reservas.some(r => r.estado === 'limitado')) return "limitado";
  return "disponible";
}

/**
 * Construye el elemento <li> de un producto en el panel.
 * @param {Object} prod
 * @param {string} estado
 * @param {Array}  reservas
 * @param {number} idx
 * @returns {HTMLElement}
 */
function buildProductItem(prod, estado, reservas, idx) {
  const tagConfig = {
    libre:      { clase: 'disp-product-item__tag--available', texto: 'Disponible' },
    disponible: { clase: 'disp-product-item__tag--available', texto: 'Disponible' },
    limitado:   { clase: 'disp-product-item__tag--limited',   texto: 'Limitado'   },
    completo:   { clase: 'disp-product-item__tag--full',      texto: 'Completo'   },
  };

  const tagCfg = tagConfig[estado] || tagConfig.libre;

  // Horario: si hay reservas, mostrar el primer horario; si no, "Libre"
  const horario = reservas.length ? reservas[0].horario : 'Libre';
  const prodNombre = reservas.length ? reservas[0].producto : prod.nombre;

  const li = document.createElement('li');
  li.className = 'disp-product-item';
  li.style.animationDelay = `${idx * 0.05}s`;

  li.innerHTML = `
    <div class="disp-product-item__left">
      <span class="disp-product-item__icon" aria-hidden="true">${prod.icon}</span>
      <div class="disp-product-item__info">
        <div class="disp-product-item__name">${prodNombre}</div>
        <div class="disp-product-item__schedule">⏰ ${horario}</div>
      </div>
    </div>
    <span class="disp-product-item__tag ${tagCfg.clase}">${tagCfg.texto}</span>
  `;

  return li;
}


/* ============================================================
   7. NAVEGACIÓN ENTRE MESES
============================================================ */
function initMonthNav() {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');

  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    state.viewMonth--;
    if (state.viewMonth < 0) {
      state.viewMonth = 11;
      state.viewYear--;
    }
    state.selectedDate = null;
    showPanelEmpty();
    renderCalendar();
  });

  nextBtn.addEventListener('click', () => {
    state.viewMonth++;
    if (state.viewMonth > 11) {
      state.viewMonth = 0;
      state.viewYear++;
    }
    state.selectedDate = null;
    showPanelEmpty();
    renderCalendar();
  });
}


/* ============================================================
   8. INICIALIZACIÓN
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initMonthNav();
  renderCalendar();
  showPanelEmpty();

  console.log('📅 Patulandia — disponibilidad.js cargado correctamente');
});
