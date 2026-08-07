import { MenuDiariosService, CombosService } from '../services/api.js';

// Paleta de gradientes de placeholder para menús (rotan por índice)
const MENU_GRADIENTS = [
  'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
  'from-[#2d1b69] via-[#11998e] to-[#38ef7d]',
  'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
  'from-[#0f2027] via-[#203a43] to-[#2c5364]',
  'from-[#373b44] via-[#4286f4] to-[#373b44]',
];

const COMBO_GRADIENTS = [
  'from-[#bc4800] via-[#943700] to-[#7d2d00]',
  'from-[#6a3093] via-[#a044ff] to-[#6a3093]',
  'from-[#004ac6] via-[#2563eb] to-[#003ea8]',
  'from-[#11998e] via-[#38ef7d] to-[#11998e]',
  'from-[#f7971e] via-[#ffd200] to-[#f7971e]',
];

class AppComidasCaseras extends HTMLElement {
  constructor() {
    super();
    this._tab = 'menus'; // 'menus' | 'combos'
    this._menus = [];
    this._combos = [];
    this._menusPage = { number: 0, totalPages: 0, totalElements: 0 };
    this._combosPage = { number: 0, totalPages: 0, totalElements: 0 };
    this._loading = false;
    this._filters = { nombre: '', fecha: '', activo: '' };
  }

  connectedCallback() {
    this._render();
    this._loadAll();

    // Listen to changes from modals
    document.addEventListener('menu-created', () => {
      this._loadMenus(0);
      this._updateKpis();
    });
    document.addEventListener('menu-updated', () => {
      this._loadMenus(this._menusPage.number);
      this._updateKpis();
    });
    document.addEventListener('combo-created', () => {
      this._loadCombos(0);
      this._updateKpis();
    });
    document.addEventListener('combo-updated', () => {
      this._loadCombos(this._combosPage.number);
      this._updateKpis();
    });
  }

  // ─── Data ─────────────────────────────────────────────────────────────────

  async _loadAll() {
    await Promise.all([this._loadMenus(0), this._loadCombos(0)]);
    this._updateKpis();
  }

  async _loadMenus(page = 0) {
    this._setLoading(true);
    try {
      const params = { page, size: 8 };
      if (this._filters.fecha) params.fecha = this._filters.fecha;
      const data = await MenuDiariosService.getPaged(params);
      this._menus = data.content || [];
      this._menusPage = {
        number: data.number || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      };
    } catch (e) {
      console.error('Error cargando menús:', e);
      this._menus = [];
    } finally {
      this._setLoading(false);
      this._renderContent();
    }
  }

  async _loadCombos(page = 0) {
    this._setLoading(true);
    try {
      const params = { page, size: 8 };
      const data = await CombosService.getPaged(params);
      this._combos = data.content || [];
      this._combosPage = {
        number: data.number || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      };
    } catch (e) {
      console.error('Error cargando combos:', e);
      this._combos = [];
    } finally {
      this._setLoading(false);
      this._renderContent();
    }
  }

  _updateKpis() {
    const kpiMenus = document.getElementById('kpi-menus-total');
    const kpiCombos = document.getElementById('kpi-combos-total');
    if (kpiMenus) kpiMenus.setAttribute('value', this._menusPage.totalElements);
    if (kpiCombos) kpiCombos.setAttribute('value', this._combosPage.totalElements);
  }

  // ─── Skeleton de carga ────────────────────────────────────────────────────

  _skeletonGrid(count = 8) {
    const items = Array.from({ length: count }, () => `
      <div class="rounded-2xl overflow-hidden border border-outline-variant/20 shadow-card animate-pulse flex flex-col">
        <div class="h-48 bg-surface-container"></div>
        <div class="p-4 flex flex-col gap-3">
          <div class="h-4 bg-surface-container rounded-lg w-3/4"></div>
          <div class="h-3 bg-surface-container rounded-lg w-1/2"></div>
          <div class="h-3 bg-surface-container rounded-lg w-2/3"></div>
        </div>
      </div>
    `).join('');
    return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-card-gap">${items}</div>`;
  }

  // ─── Shell ────────────────────────────────────────────────────────────────

  _render() {
    this.innerHTML = `
      <div class="flex flex-col gap-6">

        <!-- Tab & Actions Bar -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <!-- Tab Switcher -->
          <div class="flex bg-surface-container rounded-2xl p-1.5 gap-1 w-fit shadow-card">
            <button id="tab-menus" data-tab="menus"
              class="tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-data-table font-semibold transition-all duration-200 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings:'FILL' 1">restaurant_menu</span>
              <span>Menús del Día</span>
            </button>
            <button id="tab-combos" data-tab="combos"
              class="tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-data-table font-semibold transition-all duration-200 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings:'FILL' 1">lunch_dining</span>
              <span>Combos</span>
            </button>
          </div>
          <!-- Admin Actions -->
          <div id="admin-actions-container" class="flex gap-3"></div>
        </div>

        <!-- Filters -->
        <div id="filters-bar"></div>

        <!-- Cards area -->
        <div id="content-area">
          ${this._skeletonGrid()}
        </div>
      </div>
    `;

    this.querySelector('#tab-menus').addEventListener('click', () => this._switchTab('menus'));
    this.querySelector('#tab-combos').addEventListener('click', () => this._switchTab('combos'));

    this._applyTabStyles();
    this._renderFilters();
    this._updateAdminActions();
  }

  _switchTab(tab) {
    this._tab = tab;
    this._filters = { nombre: '', fecha: '', activo: '' };
    this._applyTabStyles();
    this._renderFilters();
    this._updateAdminActions();
    this._renderContent();
  }

  _applyTabStyles() {
    this.querySelectorAll('.tab-btn').forEach(btn => {
      const active = btn.dataset.tab === this._tab;
      btn.className = `tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-data-table font-semibold transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-primary text-on-primary shadow-card'
          : 'text-on-surface-variant hover:bg-surface-container-high'
      }`;
    });
  }

  _updateAdminActions() {
    const container = this.querySelector('#admin-actions-container');
    if (!container) return;
    const showAdmin = window.KioskoAPI?.Auth?.isAdmin();
    if (!showAdmin) {
      container.innerHTML = '';
      return;
    }

    if (this._tab === 'menus') {
      container.innerHTML = `
        <button id="btn-new-menu" class="h-11 px-5 flex items-center gap-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer text-data-table">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Nuevo Menú</span>
        </button>
      `;
      this.querySelector('#btn-new-menu')?.addEventListener('click', () => {
        if (window.openMenuDiarioModal) window.openMenuDiarioModal();
      });
    } else {
      container.innerHTML = `
        <button id="btn-new-combo" class="h-11 px-5 flex items-center gap-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer text-data-table">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Nuevo Combo</span>
        </button>
      `;
      this.querySelector('#btn-new-combo')?.addEventListener('click', () => {
        if (window.openComboModal) window.openComboModal();
      });
    }
  }

  // ─── Filtros ──────────────────────────────────────────────────────────────

  _renderFilters() {
    const bar = this.querySelector('#filters-bar');
    if (!bar) return;

    if (this._tab === 'menus') {
      bar.innerHTML = `
        <div class="flex flex-wrap gap-3 items-center">
          <div class="relative min-w-[190px]">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">calendar_month</span>
            <input id="filter-fecha" type="date" value="${this._filters.fecha}"
              class="pl-10 pr-4 h-11 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-data-table text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full"/>
          </div>
          <button id="btn-clear-filters"
            class="h-11 px-4 flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-colors text-data-table font-medium cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">filter_list_off</span>
            <span>Limpiar</span>
          </button>
        </div>
      `;
      this.querySelector('#filter-fecha')?.addEventListener('input', e => {
        this._filters.fecha = e.target.value;
        this._loadMenus(0);
      });
      this.querySelector('#btn-clear-filters')?.addEventListener('click', () => {
        this._filters.fecha = '';
        this.querySelector('#filter-fecha').value = '';
        this._loadMenus(0);
      });

    } else {
      bar.innerHTML = `
        <div class="flex flex-wrap gap-3 items-center">
          <!-- Search -->
          <div class="relative min-w-[220px] max-w-sm flex-1">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">search</span>
            <input id="filter-nombre" type="text" value="${this._filters.nombre}"
              placeholder="Buscar combo..."
              class="pl-10 pr-4 h-11 w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-data-table text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"/>
          </div>
          <!-- Estado pills -->
          <div class="flex gap-2">
            <button data-activo="" class="filter-activo-btn h-11 px-4 rounded-xl text-data-table font-semibold cursor-pointer border transition-all">Todos</button>
            <button data-activo="true" class="filter-activo-btn h-11 px-4 rounded-xl text-data-table font-semibold cursor-pointer border transition-all">Activos</button>
            <button data-activo="false" class="filter-activo-btn h-11 px-4 rounded-xl text-data-table font-semibold cursor-pointer border transition-all">Inactivos</button>
          </div>
          <!-- Clear -->
          <button id="btn-clear-filters"
            class="h-11 px-4 flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-colors text-data-table font-medium cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">filter_list_off</span>
            <span>Limpiar</span>
          </button>
        </div>
      `;
      let debounce;
      this.querySelector('#filter-nombre')?.addEventListener('input', e => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this._filters.nombre = e.target.value.trim();
          this._renderContent();
        }, 300);
      });
      this._applyActivoPills();
      this.querySelectorAll('.filter-activo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._filters.activo = btn.dataset.activo;
          this._applyActivoPills();
          this._renderContent();
        });
      });
      this.querySelector('#btn-clear-filters')?.addEventListener('click', () => {
        this._filters.nombre = '';
        this._filters.activo = '';
        const inp = this.querySelector('#filter-nombre');
        if (inp) inp.value = '';
        this._applyActivoPills();
        this._renderContent();
      });
    }
  }

  _applyActivoPills() {
    this.querySelectorAll('.filter-activo-btn').forEach(btn => {
      const active = btn.dataset.activo === (this._filters.activo ?? '');
      btn.className = `filter-activo-btn h-11 px-4 rounded-xl text-data-table font-semibold cursor-pointer border transition-all ${
        active
          ? 'bg-primary text-on-primary border-primary'
          : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-high'
      }`;
    });
  }

  // ─── Render central ───────────────────────────────────────────────────────

  _setLoading(val) { this._loading = val; }

  _renderContent() {
    const area = this.querySelector('#content-area');
    if (!area) return;
    if (this._loading) {
      area.innerHTML = this._skeletonGrid();
      return;
    }
    if (this._tab === 'menus') this._renderMenus(area);
    else this._renderCombos(area);
  }

  // ─── MENÚS — cards con imagen ─────────────────────────────────────────────

  _renderMenus(area) {
    if (!this._menus.length) {
      area.innerHTML = this._emptyState('restaurant_menu', 'No hay menús para mostrar', 'Probá con otra fecha o limpiá los filtros.');
      return;
    }
    area.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-card-gap">
        ${this._menus.map((m, i) => this._menuCard(m, i)).join('')}
      </div>
      ${this._paginationHtml(this._menusPage, 'menus')}
    `;
    this._bindPagination(area, 'menus');
    this._bindMenuActions(area);
  }

  _menuCard(menu, idx) {
    const fecha = menu.fecha
      ? new Date(menu.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      : '—';
    const gradient = MENU_GRADIENTS[idx % MENU_GRADIENTS.length];
    const showAdmin = window.KioskoAPI?.Auth?.isAdmin();
    const precio = menu.precio ? `$${Number(menu.precio).toLocaleString('es-AR')}` : null;

    const adminOverlay = showAdmin
      ? `
        <div class="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button data-id="${menu.menuDiarioId}" class="btn-edit-menu w-8 h-8 rounded-full bg-white/95 text-on-surface shadow-md hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/30">
            <span class="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button data-id="${menu.menuDiarioId}" class="btn-delete-menu w-8 h-8 rounded-full bg-white/95 text-error shadow-md hover:bg-error-container/20 flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/30">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      `
      : '';

    const priceBadge = precio
      ? `
        <!-- Price chip overlay -->
        <div class="absolute top-3 right-3 bg-primary/90 text-on-primary text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <span class="material-symbols-outlined text-[13px]">payments</span>
          ${precio}
        </div>
      `
      : '';

    // Imagen placeholder elegante con ícono centrado
    const imgSection = `
      <div class="relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden group-hover:brightness-110 transition-all duration-300">
        ${adminOverlay}
        ${priceBadge}
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-80">
          <span class="material-symbols-outlined text-white/90 text-5xl" style="font-variation-settings:'FILL' 1">restaurant_menu</span>
          <span class="text-white/60 text-xs font-semibold uppercase tracking-widest">Menú del día</span>
        </div>
        <!-- Date chip overlay -->
        <div class="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
          <span class="text-white text-xs font-semibold capitalize">${fecha}</span>
        </div>
      </div>
    `;

    return `
      <article class="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-active transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
        ${imgSection}
        <div class="p-4 flex flex-col flex-1 gap-2.5">
          <div>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-0.5">Menú del día</p>
            <h2 class="font-semibold text-on-surface text-[15px] leading-tight line-clamp-2">${menu.nombre || 'Menú Especial'}</h2>
          </div>
          <p class="text-xs text-on-surface-variant capitalize mt-auto font-medium">${fecha}</p>
        </div>
      </article>
    `;
  }

  _bindMenuActions(area) {
    area.querySelectorAll('.btn-edit-menu').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        try {
          const menu = await MenuDiariosService.getById(id);
          if (window.openMenuDiarioModal) window.openMenuDiarioModal(menu);
        } catch (err) {
          alert('Error al obtener menú diario: ' + err.message);
        }
      });
    });

    area.querySelectorAll('.btn-delete-menu').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('¿Seguro que deseas eliminar este menú diario?')) return;
        const id = parseInt(btn.dataset.id, 10);
        try {
          await MenuDiariosService.delete(id);
          alert('Menú diario eliminado.');
          this._loadMenus(this._menusPage.number);
        } catch (err) {
          alert('Error al eliminar menú diario: ' + err.message);
        }
      });
    });
  }

  // ─── COMBOS — cards con imagen ─────────────────────────────────────────────

  _renderCombos(area) {
    let combos = this._combos;
    if (this._filters.nombre) {
      const q = this._filters.nombre.toLowerCase();
      combos = combos.filter(c => c.nombre?.toLowerCase().includes(q));
    }
    if (this._filters.activo !== '') {
      const val = this._filters.activo === 'true';
      combos = combos.filter(c => c.activo === val);
    }

    if (!combos.length) {
      area.innerHTML = this._emptyState('lunch_dining', 'No hay combos para mostrar', 'Probá modificando los filtros.');
      return;
    }

    area.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-card-gap">
        ${combos.map((c, i) => this._comboCard(c, i)).join('')}
      </div>
      ${this._paginationHtml(this._combosPage, 'combos')}
    `;
    this._bindPagination(area, 'combos');
    this._bindComboActions(area);
  }

  _comboCard(combo, idx) {
    const items = combo.items || [];
    const gradient = COMBO_GRADIENTS[idx % COMBO_GRADIENTS.length];
    const precio = combo.precio ? `$${Number(combo.precio).toLocaleString('es-AR')}` : null;
    const showAdmin = window.KioskoAPI?.Auth?.isAdmin();

    const adminOverlay = showAdmin
      ? `
        <div class="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button data-id="${combo.comboId}" class="btn-edit-combo w-8 h-8 rounded-full bg-white/95 text-on-surface shadow-md hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/30">
            <span class="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button data-id="${combo.comboId}" class="btn-delete-combo w-8 h-8 rounded-full bg-white/95 text-error shadow-md hover:bg-error-container/20 flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/30">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      `
      : '';

    const activoBadge = combo.activo
      ? `<span class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/90 text-white backdrop-blur-sm"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>Activo</span>`
      : `<span class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-black/40 text-white/70 backdrop-blur-sm">Inactivo</span>`;

    // Imagen real si existe imgUrl, sino placeholder gradiente
    const imgContent = combo.imgUrl
      ? `<img src="${combo.imgUrl}" alt="${combo.nombre || 'Combo'}"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div style="display:none" class="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-80">
            <span class="material-symbols-outlined text-white/90 text-5xl" style="font-variation-settings:'FILL' 1">lunch_dining</span>
          </div>`
      : `<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-80">
            <span class="material-symbols-outlined text-white/90 text-5xl" style="font-variation-settings:'FILL' 1">lunch_dining</span>
            <span class="text-white/50 text-xs font-semibold uppercase tracking-widest">Combo</span>
          </div>`;

    const itemList = items.length
      ? items.slice(0, 4).map(i => `
          <li class="flex items-center gap-2 py-1.5 border-b border-outline-variant/15 last:border-0">
            <span class="w-1.5 h-1.5 rounded-full bg-secondary/60 shrink-0"></span>
            <span class="text-data-table text-on-surface flex-1 truncate">${i.producto?.nombre || '—'}</span>
            <span class="text-xs text-on-surface-variant shrink-0">×${i.cantidad}</span>
          </li>`).join('')
        + (items.length > 4 ? `<li class="text-xs text-on-surface-variant italic pt-1.5">+${items.length - 4} más...</li>` : '')
      : `<li class="text-data-table text-on-surface-variant italic py-2">Sin ítems cargados aún</li>`;

    return `
      <article class="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-active transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
        <!-- Image area -->
        <div class="relative h-48 bg-gradient-to-br ${gradient} overflow-hidden">
          ${imgContent}
          <!-- Overlay badges -->
          <div class="absolute top-3 left-3">${activoBadge}</div>
          ${adminOverlay}
          ${precio
            ? `<div class="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                <span class="text-white font-bold text-lg leading-none">${precio}</span>
              </div>`
            : ''}
        </div>
        <!-- Info -->
        <div class="p-4 flex flex-col flex-1 gap-3">
          <div>
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-0.5">Combo especial</p>
            <h2 class="font-semibold text-on-surface text-[15px] leading-tight">${combo.nombre || 'Sin nombre'}</h2>
          </div>
          <div>
            <p class="text-xs text-on-surface-variant font-semibold uppercase mb-1.5 tracking-wide">${items.length} ítem${items.length !== 1 ? 's' : ''}</p>
            <ul class="flex flex-col">${itemList}</ul>
          </div>
        </div>
      </article>
    `;
  }

  _bindComboActions(area) {
    area.querySelectorAll('.btn-edit-combo').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        try {
          const combo = await CombosService.getById(id);
          if (window.openComboModal) window.openComboModal(combo);
        } catch (err) {
          alert('Error al obtener combo: ' + err.message);
        }
      });
    });

    area.querySelectorAll('.btn-delete-combo').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('¿Seguro que deseas eliminar este combo?')) return;
        const id = parseInt(btn.dataset.id, 10);
        try {
          await CombosService.delete(id);
          alert('Combo eliminado.');
          this._loadCombos(this._combosPage.number);
        } catch (err) {
          alert('Error al eliminar combo: ' + err.message);
        }
      });
    });
  }

  // ─── Pagination ───────────────────────────────────────────────────────────

  _paginationHtml({ number, totalPages } = {}, type) {
    if (!totalPages || totalPages <= 1) return '';
    const prev = number > 0
      ? `<button data-page="${number - 1}" data-type="${type}" class="page-btn h-10 px-4 flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant rounded-xl hover:bg-primary hover:text-on-primary hover:border-primary transition-all text-data-table font-medium cursor-pointer">
          <span class="material-symbols-outlined text-[16px]">chevron_left</span>Anterior</button>`
      : `<span class="h-10 px-4 flex items-center gap-1.5 bg-surface-container text-outline rounded-xl text-data-table opacity-40">
          <span class="material-symbols-outlined text-[16px]">chevron_left</span>Anterior</span>`;
    const next = number < totalPages - 1
      ? `<button data-page="${number + 1}" data-type="${type}" class="page-btn h-10 px-4 flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant rounded-xl hover:bg-primary hover:text-on-primary hover:border-primary transition-all text-data-table font-medium cursor-pointer">
          Siguiente<span class="material-symbols-outlined text-[16px]">chevron_right</span></button>`
      : `<span class="h-10 px-4 flex items-center gap-1.5 bg-surface-container text-outline rounded-xl text-data-table opacity-40">
          Siguiente<span class="material-symbols-outlined text-[16px]">chevron_right</span></span>`;

    return `
      <div class="flex items-center justify-between mt-6 pt-5 border-t border-outline-variant/20">
        <p class="text-data-table text-on-surface-variant">
          Página <strong class="text-on-surface">${number + 1}</strong> de <strong class="text-on-surface">${totalPages}</strong>
        </p>
        <div class="flex gap-2">${prev}${next}</div>
      </div>
    `;
  }

  _bindPagination(area, type) {
    area.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        if (type === 'menus') this._loadMenus(page);
        else this._loadCombos(page);
      });
    });
  }

  // ─── Empty state ──────────────────────────────────────────────────────────

  _emptyState(icon, title, subtitle) {
    return `
      <div class="flex flex-col items-center justify-center py-24 gap-5 text-center">
        <div class="w-24 h-24 rounded-3xl bg-surface-container flex items-center justify-center shadow-card">
          <span class="material-symbols-outlined text-5xl text-on-surface-variant" style="font-variation-settings:'FILL' 1">${icon}</span>
        </div>
        <div>
          <p class="font-semibold text-on-surface text-[18px]">${title}</p>
          <p class="text-data-table text-on-surface-variant mt-1">${subtitle}</p>
        </div>
      </div>
    `;
  }
}

customElements.define('app-comidas-caseras', AppComidasCaseras);
