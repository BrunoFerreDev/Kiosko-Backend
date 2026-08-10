import { ProductosService, CombosService } from '../services/api.js';

// Número de teléfono de WhatsApp para recibir pedidos (código de país + número, sin el '+')
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
    
    // Inicializar Carrito desde LocalStorage
    this._cart = JSON.parse(localStorage.getItem('kiosco_cart') || '[]');
  }

  connectedCallback() {
    this._render();
    this._loadAll();
    this._renderCartDrawer();

    // Listen to changes from modals
    document.addEventListener('product-created', () => {
      this._loadMenus(0);
      this._updateKpis();
    });
    document.addEventListener('product-updated', () => {
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

  // ─── Lógica del Carrito ───────────────────────────────────────────────────

  _saveCart() {
    localStorage.setItem('kiosco_cart', JSON.stringify(this._cart));
    this._updateCartUI();
  }

  _addToCart(item) {
    const existing = this._cart.find(i => i.id === item.id && i.type === item.type);
    if (existing) {
      existing.quantity += 1;
    } else {
      this._cart.push({ ...item, quantity: 1 });
    }
    this._saveCart();
    this._openCartDrawer();
  }

  _removeFromCart(id, type) {
    this._cart = this._cart.filter(i => !(i.id === id && i.type === type));
    this._saveCart();
  }

  _updateQuantity(id, type, delta) {
    const item = this._cart.find(i => i.id === id && i.type === type);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this._removeFromCart(id, type);
      } else {
        this._saveCart();
      }
    }
  }

  _clearCart() {
    this._cart = [];
    this._saveCart();
  }

  _openCartDrawer() {
    const drawer = this.querySelector('#cart-drawer');
    const backdrop = this.querySelector('#cart-backdrop');
    if (drawer && backdrop) {
      backdrop.classList.remove('hidden');
      drawer.classList.remove('translate-x-full');
    }
  }

  _closeCartDrawer() {
    const drawer = this.querySelector('#cart-drawer');
    const backdrop = this.querySelector('#cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('translate-x-full');
      setTimeout(() => backdrop.classList.add('hidden'), 300);
    }
  }

  _updateCartUI() {
    // Actualizar indicador flotante
    const badge = this.querySelector('#cart-badge');
    const totalCount = this._cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
      badge.textContent = totalCount;
      if (totalCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    // Actualizar contenido del drawer
    const listContainer = this.querySelector('#cart-items-list');
    const totalEl = this.querySelector('#cart-total-price');
    if (!listContainer) return;

    if (this._cart.length === 0) {
      listContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-on-surface-variant/60">
          <span class="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
          <p class="text-xs font-semibold">El carrito está vacío</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = '$0.00';
      return;
    }

    listContainer.innerHTML = this._cart.map(item => `
      <div class="flex items-center justify-between py-3 border-b border-outline-variant/15">
        <div class="flex-1 min-w-0 pr-3">
          <p class="text-sm font-semibold text-on-surface truncate">${item.nombre}</p>
          <p class="text-xs text-on-surface-variant font-medium">$${item.precio.toLocaleString('es-AR')} c/u</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-qty-dec w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold" data-id="${item.id}" data-type="${item.type}">-</button>
          <span class="text-sm font-bold w-6 text-center">${item.quantity}</span>
          <button class="btn-qty-inc w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold" data-id="${item.id}" data-type="${item.type}">+</button>
          <button class="btn-qty-del text-error w-8 h-8 rounded-full hover:bg-error-container/20 flex items-center justify-center transition-colors ml-1" data-id="${item.id}" data-type="${item.type}">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    `).join('');

    const totalPrice = this._cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    if (totalEl) totalEl.textContent = `$${totalPrice.toLocaleString('es-AR')}.00`;

    // Bind events
    listContainer.querySelectorAll('.btn-qty-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        this._updateQuantity(id, type, -1);
      });
    });

    listContainer.querySelectorAll('.btn-qty-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        this._updateQuantity(id, type, 1);
      });
    });

    listContainer.querySelectorAll('.btn-qty-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        this._removeFromCart(id, type);
      });
    });
  }

  _sendCartToWhatsapp() {
    if (this._cart.length === 0) return;

    let message = `¡Hola! Me gustaría realizar el siguiente pedido:\n\n`;
    this._cart.forEach(item => {
      const typeLabel = item.type === 'combo' ? '[Combo]' : '[Plato]';
      message += `*${item.quantity}x* ${typeLabel} ${item.nombre} - $${(item.precio * item.quantity).toLocaleString('es-AR')}\n`;
    });

    const totalPrice = this._cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    message += `\n*Total estimado del pedido:* $${totalPrice.toLocaleString('es-AR')}.00\n`;
    message += `Muchas gracias.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;
    
    // Limpiar carrito tras iniciar el pedido si el usuario acepta
    if (confirm('¿Deseas enviar el pedido y vaciar el carrito?')) {
      this._clearCart();
      this._closeCartDrawer();
    }
    window.open(whatsappUrl, '_blank');
  }

  _renderCartDrawer() {
    // Si ya existe en el DOM, no duplicarlo
    if (this.querySelector('#cart-drawer')) return;

    const drawerContainer = document.createElement('div');
    drawerContainer.innerHTML = `
      <!-- Backdrop -->
      <div id="cart-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] hidden transition-opacity duration-300"></div>

      <!-- Drawer Panel -->
      <div id="cart-drawer" class="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface-container-lowest border-l border-outline-variant/30 shadow-2xl z-[70] transform translate-x-full transition-transform duration-300 flex flex-col">
        
        <!-- Header -->
        <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">shopping_cart</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Carrito de Pedido</h3>
          </div>
          <button id="btn-close-cart" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Body -->
        <div id="cart-items-list" class="flex-1 overflow-y-auto p-6 flex flex-col gap-1">
          <!-- Items render dynamic -->
        </div>

        <!-- Footer -->
        <div class="p-6 bg-surface-container-low border-t border-outline-variant/30 flex flex-col gap-4 shrink-0">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Total del pedido:</span>
            <span id="cart-total-price" class="text-2xl font-bold text-primary">$0.00</span>
          </div>

          <div class="flex gap-2">
            <button id="btn-clear-all-cart" class="flex-1 h-11 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high transition-colors cursor-pointer text-sm">
              Vaciar
            </button>
            <button id="btn-checkout-cart" class="flex-[2] h-11 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20ba5a] transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 text-sm">
              <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Enviar Pedido</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.appendChild(drawerContainer);

    // Event listeners del Drawer
    this.querySelector('#btn-close-cart')?.addEventListener('click', () => this._closeCartDrawer());
    this.querySelector('#cart-backdrop')?.addEventListener('click', () => this._closeCartDrawer());
    this.querySelector('#btn-clear-all-cart')?.addEventListener('click', () => this._clearCart());
    this.querySelector('#btn-checkout-cart')?.addEventListener('click', () => this._sendCartToWhatsapp());

    this._updateCartUI();
  }

  // ─── Data ─────────────────────────────────────────────────────────────────

  async _loadAll() {
    await Promise.all([this._loadMenus(0), this._loadCombos(0)]);
    this._updateKpis();
  }

  async _loadMenus(page = 0) {
    this._setLoading(true);
    try {
      const params = { page, size: 8, categoria: 'Caseros' };
      const data = await ProductosService.search(params);
      this._menus = data.content || [];
      this._menusPage = {
        number: data.number || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      };
    } catch (e) {
      console.error('Error cargando comidas caseras:', e);
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
              <span>Platos Caseros</span>
            </button>
            <button id="tab-combos" data-tab="combos"
              class="tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-data-table font-semibold transition-all duration-200 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings:'FILL' 1">lunch_dining</span>
              <span>Combos</span>
            </button>
          </div>
          
          <!-- Cart & Admin Actions Group -->
          <div class="flex items-center gap-3 self-end sm:self-auto">
            <!-- Floating Cart Button -->
            <button id="btn-toggle-cart" class="relative h-11 px-4 bg-secondary-container text-on-secondary-container rounded-xl font-semibold flex items-center gap-2 shadow-sm hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer">
              <span class="material-symbols-outlined">shopping_cart</span>
              <span class="text-sm font-bold">Ver Pedido</span>
              <span id="cart-badge" class="absolute -top-1.5 -right-1.5 bg-error text-on-error w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold hidden animate-bounce">0</span>
            </button>

            <!-- Admin Actions -->
            <div id="admin-actions-container" class="flex gap-3"></div>
          </div>
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
    this.querySelector('#btn-toggle-cart').addEventListener('click', () => this._openCartDrawer());

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
          <span>Nuevo Plato</span>
        </button>
      `;
      this.querySelector('#btn-new-menu')?.addEventListener('click', () => {
        if (window.openProductModal) {
          window.openProductModal({
            categoria: 8,
            unidadMedida: 'unidad',
            stock: 10
          });
        }
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
          <div class="relative min-w-[220px] max-w-sm flex-1">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">search</span>
            <input id="filter-comida" type="text" value="${this._filters.nombre}"
              placeholder="Buscar plato..."
              class="pl-10 pr-4 h-11 w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-data-table text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"/>
          </div>
          <button id="btn-clear-filters"
            class="h-11 px-4 flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-colors text-data-table font-medium cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">filter_list_off</span>
            <span>Limpiar</span>
          </button>
        </div>
      `;
      let debounce;
      this.querySelector('#filter-comida')?.addEventListener('input', e => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this._filters.nombre = e.target.value.trim();
          this._loadMenus(0);
        }, 300);
      });
      this.querySelector('#btn-clear-filters')?.addEventListener('click', () => {
        this._filters.nombre = '';
        const inp = this.querySelector('#filter-comida');
        if (inp) inp.value = '';
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
    let menus = this._menus;
    if (this._filters.nombre) {
      const q = this._filters.nombre.toLowerCase();
      menus = menus.filter(m => m.nombre?.toLowerCase().includes(q));
    }

    if (!menus.length) {
      const hasFilter = !!this._filters.nombre;
      const title = hasFilter ? 'No hay comidas con este filtro' : 'No hay comidas caseras registradas';
      const subtitle = hasFilter ? 'Probá con otra palabra o limpiá los filtros.' : 'Registrá un nuevo plato de comida casera en el catálogo.';
      const icon = hasFilter ? 'search_off' : 'restaurant_menu';
      area.innerHTML = this._emptyState(icon, title, subtitle);
      return;
    }
    area.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-card-gap">
        ${menus.map((m, i) => this._menuCard(m, i)).join('')}
      </div>
      ${this._paginationHtml(this._menusPage, 'menus')}
    `;
    this._bindPagination(area, 'menus');
    this._bindMenuActions(area);
  }

  _menuCard(menu, idx) {
    const gradient = MENU_GRADIENTS[idx % MENU_GRADIENTS.length];
    const showAdmin = window.KioskoAPI?.Auth?.isAdmin();
    const precioVal = menu.precioVenta || 0;
    const precio = precioVal ? `$${Number(precioVal).toLocaleString('es-AR')}` : null;
    const prodId = menu.productoId || menu.id;

    const adminOverlay = showAdmin
      ? `
        <div class="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button data-id="${prodId}" class="btn-edit-menu w-8 h-8 rounded-full bg-white/95 text-on-surface shadow-md hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/30">
            <span class="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button data-id="${prodId}" class="btn-delete-menu w-8 h-8 rounded-full bg-white/95 text-error shadow-md hover:bg-error-container/20 flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/30">
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
          <span class="text-white/60 text-xs font-semibold uppercase tracking-widest">Plato Casero</span>
        </div>
      </div>
    `;

    const buyButtonHtml = `
      <button data-id="${prodId}" data-price="${precioVal}" data-name="${menu.nombre}" class="btn-add-cart-menu mt-2 w-full h-10 flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer select-none">
        <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        <span>Agregar al Pedido</span>
      </button>
    `;

    return `
      <article class="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-card hover:shadow-active transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
        ${imgSection}
        <div class="p-4 flex flex-col flex-1 gap-2.5">
          <div class="flex-1">
            <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-0.5">Comida Casera</p>
            <h2 class="font-semibold text-on-surface text-[15px] leading-tight line-clamp-2">${menu.nombre || 'Plato Especial'}</h2>
            <p class="text-xs text-on-surface-variant mt-2">Disponibles: <strong class="text-on-surface">${menu.stock}</strong> ${menu.unidadMedida || 'unidad'}</p>
          </div>
          <div class="mt-auto pt-2">
            ${buyButtonHtml}
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
          const prod = await ProductosService.getById(id);
          if (window.openProductModal) window.openProductModal(prod);
        } catch (err) {
          alert('Error al obtener plato casero: ' + err.message);
        }
      });
    });

    area.querySelectorAll('.btn-delete-menu').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('¿Seguro que deseas eliminar este plato casero del catálogo?')) return;
        const id = parseInt(btn.dataset.id, 10);
        try {
          await ProductosService.delete(id);
          alert('Plato eliminado.');
          this._loadMenus(this._menusPage.number);
        } catch (err) {
          alert('Error al eliminar plato casero: ' + err.message);
        }
      });
    });

    area.querySelectorAll('.btn-add-cart-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const precio = parseFloat(btn.dataset.price);
        const nombre = btn.dataset.name;
        this._addToCart({ id, precio, nombre, type: 'plato' });
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
    const precioVal = combo.precio || 0;
    const precio = precioVal ? `$${Number(precioVal).toLocaleString('es-AR')}` : null;
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

    const buyButtonHtml = `
      <button data-id="${combo.comboId}" data-price="${precioVal}" data-name="${combo.nombre}" class="btn-add-cart-combo mt-3 w-full h-10 flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer select-none">
        <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        <span>Agregar al Pedido</span>
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
            ${buyButtonHtml}
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

    area.querySelectorAll('.btn-add-cart-combo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const precio = parseFloat(btn.dataset.price);
        const nombre = btn.dataset.name;
        this._addToCart({ id, precio, nombre, type: 'combo' });
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
