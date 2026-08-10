import { MenuDiariosService, CombosService } from '../services/api.js';

// Número de teléfono de WhatsApp para recibir pedidos (código de país + número, sin el '+')
// Cambia este número por el tuyo real para que los clientes puedan enviarte el pedido.
const WHATSAPP_PHONE_NUMBER = '5493743582264';

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
      const hasFilter = !!this._filters.fecha;
      const title = hasFilter ? 'No hay menús para esta fecha' : 'No hay menús registrados';
      const subtitle = hasFilter ? 'Probá con otra fecha o limpiá los filtros.' : 'Creá un nuevo menú para el día para empezar.';
      const icon = hasFilter ? 'search_off' : 'restaurant_menu';
      area.innerHTML = this._emptyState(icon, title, subtitle);
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

    const productsList = menu.productos || [];
    const productsHtml = productsList.length > 0
      ? `
        <div class="mt-2.5 flex flex-col gap-1.5">
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Incluye:</p>
          <div class="flex flex-wrap gap-1">
            ${productsList.map(p => `
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/30">
                ${p.nombre}
              </span>
            `).join('')}
          </div>
        </div>
      `
      : '';

    const whatsappBtn = `
      <button data-id="${menu.menuDiarioId}" class="btn-order-whatsapp mt-3.5 w-full h-10 flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer select-none">
        <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>Pedir por WhatsApp</span>
      </button>
    `;

    return `
      <article class="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-active transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
        ${imgSection}
        <div class="p-4 flex flex-col flex-1 gap-2.5">
          <div class="flex-1">
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-0.5">Menú del día</p>
            <h2 class="font-semibold text-on-surface text-[15px] leading-tight line-clamp-2">${menu.nombre || 'Menú Especial'}</h2>
            ${productsHtml}
          </div>
          <div class="mt-auto pt-2">
            <p class="text-xs text-on-surface-variant capitalize font-medium">${fecha}</p>
            ${whatsappBtn}
          </div>
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

    area.querySelectorAll('.btn-order-whatsapp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const menu = this._menus.find(m => (m.menuDiarioId || m.id) === id);
        if (!menu) return;

        const fechaStr = menu.fecha
          ? new Date(menu.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
          : '—';
        const precioStr = menu.precio ? `$${Number(menu.precio).toLocaleString('es-AR')}` : '—';

        const prodNames = menu.productos && menu.productos.length > 0
          ? menu.productos.map(p => `- ${p.nombre}`).join('\n')
          : '';

        let message = `¡Hola! Me gustaría pedir el Menú del Día:\n\n`;
        message += `*${menu.nombre || 'Menú Especial'}*\n`;
        message += `*Precio:* ${precioStr}\n`;
        message += `*Fecha:* ${fechaStr}\n`;
        
        if (prodNames) {
          message += `\n*Productos incluidos:*\n${prodNames}\n`;
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
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
      const hasFilter = !!(this._filters.nombre || this._filters.activo !== '');
      const title = hasFilter ? 'No se encontraron combos' : 'No hay combos registrados';
      const subtitle = hasFilter ? 'Probá modificando o limpiando los filtros.' : 'Creá un nuevo combo para empezar a ofrecerlo.';
      const icon = hasFilter ? 'search_off' : 'lunch_dining';
      area.innerHTML = this._emptyState(icon, title, subtitle);
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

    const whatsappBtn = `
      <button data-id="${combo.comboId}" class="btn-order-combo-whatsapp mt-3.5 w-full h-10 flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer select-none">
        <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>Pedir por WhatsApp</span>
      </button>
    `;

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
          <div class="flex-1">
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-0.5">Combo especial</p>
            <h2 class="font-semibold text-on-surface text-[15px] leading-tight mb-3">${combo.nombre || 'Sin nombre'}</h2>
            <div>
              <p class="text-xs text-on-surface-variant font-semibold uppercase mb-1.5 tracking-wide">${items.length} ítem${items.length !== 1 ? 's' : ''}</p>
              <ul class="flex flex-col">${itemList}</ul>
            </div>
          </div>
          <div class="mt-auto pt-2">
            ${whatsappBtn}
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

    area.querySelectorAll('.btn-order-combo-whatsapp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const combo = this._combos.find(c => (c.comboId || c.id) === id);
        if (!combo) return;

        const precioStr = combo.precio ? `$${Number(combo.precio).toLocaleString('es-AR')}` : '—';
        const itemsList = combo.items || [];
        const itemNames = itemsList.length > 0
          ? itemsList.map(i => `- ${i.producto?.nombre || 'Producto'} ×${i.cantidad}`).join('\n')
          : '';

        let message = `¡Hola! Me gustaría pedir el Combo Especial:\n\n`;
        message += `*${combo.nombre || 'Combo'}*\n`;
        message += `*Precio:* ${precioStr}\n`;
        
        if (itemNames) {
          message += `\n*Productos incluidos:*\n${itemNames}\n`;
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
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
