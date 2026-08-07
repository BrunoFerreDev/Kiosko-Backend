import { ClientesService, ProductosService, AnotadosService, CombosService, MenuDiariosService, AnotadosComboService, AnotadosMenuService } from '../services/api.js';

class AppModalAnnotation extends HTMLElement {
  connectedCallback() {
    this.items = [];
    this.availableProducts = [];
    this.availableClients = [];
    this.availableCombos = [];
    this.availableMenus = [];
    this.loadingData = false;
    this.annotationType = 'product'; // 'product' | 'combo' | 'menu'

    this.render();
  }

  async loadCatalogs() {
    this.loadingData = true;
    try {
      const [clientsResp, prodsResp, combosResp, menusResp] = await Promise.all([
        ClientesService.getAll().catch(() => []),
        ProductosService.getAll().catch(() => []),
        CombosService.getActivos().catch(() => []),
        MenuDiariosService.getAll().catch(() => [])
      ]);

      this.availableClients = Array.isArray(clientsResp) ? clientsResp : (clientsResp.content || []);
      this.availableProducts = Array.isArray(prodsResp) ? prodsResp : (prodsResp.content || []);
      this.availableCombos = Array.isArray(combosResp) ? combosResp : (combosResp.content || []);
      this.availableMenus = Array.isArray(menusResp) ? menusResp : (menusResp.content || []);
    } catch (err) {
      console.warn('No se pudo cargar catálogos desde la API:', err);
    } finally {
      this.loadingData = false;
      this.updateCatalogOptions();
    }
  }

  updateCatalogOptions() {
    const clientSelect = this.querySelector('#select-annotation-client');
    const prodSelect = this.querySelector('#select-product');

    if (clientSelect) {
      clientSelect.innerHTML = `<option value="">-- Seleccionar Cliente --</option>` +
        this.availableClients.map(c => `<option value="${c.clienteId}">${c.nombreCompleto || `${c.nombre || ''} ${c.apellido || ''}`.trim()}</option>`).join('');
      if (this.preselectedClienteId) {
        clientSelect.value = this.preselectedClienteId;
      }
    }

    if (prodSelect) {
      if (this.annotationType === 'product') {
        prodSelect.innerHTML = `<option value="">-- Elegir producto del catálogo (${this.availableProducts.length}) --</option>` +
          this.availableProducts.map(p => {
            const catName = p.categoria ? (typeof p.categoria === 'object' ? p.categoria.nombre : p.categoria) : 'Sin Cat.';
            return `<option value="${p.productoId}">${p.nombre} [${catName}] - $${(p.precioVenta || 0).toLocaleString('es-AR')}</option>`;
          }).join('');
      } else if (this.annotationType === 'combo') {
        prodSelect.innerHTML = `<option value="">-- Elegir combo activo (${this.availableCombos.length}) --</option>` +
          this.availableCombos.map(c => {
            return `<option value="${c.comboId}">${c.nombre} - $${(c.precio || 0).toLocaleString('es-AR')}</option>`;
          }).join('');
      } else if (this.annotationType === 'menu') {
        prodSelect.innerHTML = `<option value="">-- Elegir menú diario (${this.availableMenus.length}) --</option>` +
          this.availableMenus.map(m => {
            const dateStr = m.fecha ? new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—';
            return `<option value="${m.menuDiarioId}">${m.nombre} (${dateStr}) - $${(m.precio || 0).toLocaleString('es-AR')}</option>`;
          }).join('');
      }
    }
  }

  render() {
    this.innerHTML = `
      <div id="modal-annotation-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-xl mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-tertiary-container/30 text-tertiary flex items-center justify-center">
                <span class="material-symbols-outlined">edit_document</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Nueva Anotación (Fiado)</h3>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Seleccionar cliente y productos a anotar</p>
              </div>
            </div>
            <button id="btn-close-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form id="form-new-annotation" class="p-6 flex flex-col gap-4">
            
            <!-- Client Selection -->
            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Seleccionar Cliente *</label>
              <select id="select-annotation-client" name="clienteId" required class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md">
                <option value="">Cargando clientes...</option>
              </select>
            </div>

            <!-- Product Selection Row -->
            <div class="p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
              <label class="block font-label-caps text-label-caps text-on-surface uppercase font-semibold">Agregar Elemento a la Anotación</label>
              
              <!-- Tab Switcher for type -->
              <div class="flex bg-surface-container rounded-xl p-1 gap-1 w-full border border-outline-variant/30">
                <button type="button" class="annotation-type-btn flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer" data-type="product">Producto</button>
                <button type="button" class="annotation-type-btn flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer" data-type="combo">Combo</button>
                <button type="button" class="annotation-type-btn flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer" data-type="menu">Menú Diario</button>
              </div>

              <!-- Buscador de producto por nombre o categoría (only visible for product type) -->
              <div id="search-product-container">
                <input type="text" id="input-search-product" placeholder="Buscar por nombre o categoría..." class="w-full h-11 px-3 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium" />
              </div>

              <div class="flex flex-col gap-3">
                <select id="select-product" class="w-full h-11 px-3 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="">Cargando catálogo...</option>
                </select>

                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-on-surface-variant uppercase">Cantidad:</span>
                    <input type="number" id="input-qty" value="1" min="1" max="99" class="w-16 h-11 px-2 bg-surface text-on-surface border border-outline-variant rounded-xl text-center font-bold outline-none" title="Cantidad" />
                  </div>
                  
                  <button type="button" id="btn-add-item" class="h-11 px-6 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-fixed-variant transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    <span class="material-symbols-outlined text-sm">add</span>
                    <span>Agregar Elemento</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Items Added List -->
            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2 font-semibold">Elementos Anotados</label>
              
              <div id="items-container" class="max-h-48 overflow-y-auto border border-outline-variant/30 rounded-xl divide-y divide-outline-variant/20 bg-surface">
                <!-- Items rendered dynamically -->
              </div>
            </div>

            <!-- Total Bar -->
            <div class="p-3 bg-surface-container-high/40 rounded-xl border border-outline-variant/30 flex justify-between items-center">
              <span class="font-label-caps text-label-caps text-on-surface uppercase font-bold">Total a Fiar:</span>
              <span id="annotation-total" class="font-display-lg text-headline-md text-primary font-bold">$ 0.00</span>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
              <button type="button" id="btn-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" id="btn-submit-annotation" class="h-11 px-6 bg-tertiary-container text-on-tertiary-container rounded-xl font-data-table font-semibold hover:bg-tertiary transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">save</span>
                <span id="btn-annotation-label">Guardar Anotación</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    `;

    this.backdrop = this.querySelector('#modal-annotation-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.form = this.querySelector('#form-new-annotation');
    this.itemsContainer = this.querySelector('#items-container');
    this.totalEl = this.querySelector('#annotation-total');
    this.submitBtn = this.querySelector('#btn-submit-annotation');
    this.submitLabel = this.querySelector('#btn-annotation-label');

    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    this.querySelector('#btn-add-item')?.addEventListener('click', () => this.addItem());

    this.querySelector('#input-search-product')?.addEventListener('input', (e) => {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      const val = e.target.value;
      this.searchTimeout = setTimeout(() => {
        this.searchBackendProducts(val);
      }, 1000);
    });

    this.querySelector('#input-search-product')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchBackendProducts(e.target.value);
      }
    });

    // Bind Type Switcher Buttons
    this.querySelectorAll('.annotation-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchAnnotationType(btn.dataset.type);
      });
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      if (this.items.length === 0) {
        alert('Por favor agrega al menos un elemento a la anotación.');
        return;
      }

      this.setSubmitting(true);
      try {
        const promises = this.items.map(item => {
          if (item.type === 'combo') {
            return AnotadosComboService.create({
              clienteId: data.clienteId,
              comboId: item.id,
              cantidad: item.qty,
              precioUnitario: item.price,
              fechaAnotado: new Date().toISOString(),
              estado: 'PENDIENTE'
            });
          } else if (item.type === 'menu') {
            return AnotadosMenuService.create({
              clienteId: data.clienteId,
              menuDiarioId: item.id,
              cantidad: item.qty,
              precioUnitario: item.price,
              fechaAnotado: new Date().toISOString(),
              estado: 'PENDIENTE'
            });
          } else {
            return AnotadosService.create({
              clienteId: data.clienteId,
              productoId: item.id,
              cantidad: item.qty,
              precioUnitario: item.price,
              fechaAnotado: new Date().toISOString(),
              estado: 'PENDIENTE'
            });
          }
        });

        await Promise.all(promises);
        alert(`Anotación de ${this.items.length} elemento(s) guardada con éxito.`);
        this.dispatchEvent(new CustomEvent('annotation-created', { bubbles: true }));
        this.items = [];
        this.form.reset();
        this.renderItems();
        this.close();
      } catch (err) {
        alert(`Error al guardar anotación: ${err.message}`);
      } finally {
        this.setSubmitting(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.backdrop?.classList.contains('hidden')) {
        this.close();
      }
    });

    this.switchAnnotationType('product');
    this.renderItems();
  }

  switchAnnotationType(type) {
    this.annotationType = type;
    
    // Update button styling
    this.querySelectorAll('.annotation-type-btn').forEach(btn => {
      const active = btn.dataset.type === type;
      btn.className = `annotation-type-btn flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-primary text-on-primary shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-container-high'
      }`;
    });

    // Show/hide search field
    const searchContainer = this.querySelector('#search-product-container');
    if (searchContainer) {
      if (type === 'product') {
        searchContainer.style.display = 'block';
      } else {
        searchContainer.style.display = 'none';
      }
    }

    this.updateCatalogOptions();
  }

  setSubmitting(isSubmitting) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      this.submitLabel.textContent = 'Guardando...';
      this.submitBtn.classList.add('opacity-75');
    } else {
      this.submitLabel.textContent = 'Guardar Anotación';
      this.submitBtn.classList.remove('opacity-75');
    }
  }

  async searchBackendProducts(query) {
    const prodSelect = this.querySelector('#select-product');
    if (!prodSelect) return;

    const trimmed = query.trim();
    if (!trimmed) {
      this.updateCatalogOptions();
      return;
    }

    prodSelect.innerHTML = `<option value="">Buscando en el servidor...</option>`;

    try {
      const [respName, respCat, respBrand] = await Promise.all([
        ProductosService.search({ nombre: trimmed }).catch(() => ({ content: [] })),
        ProductosService.search({ categoria: trimmed }).catch(() => ({ content: [] })),
        ProductosService.search({ marca: trimmed }).catch(() => ({ content: [] }))
      ]);

      const extractProducts = (resp) => {
        if (!resp) return [];
        if (Array.isArray(resp)) return resp;
        if (Array.isArray(resp.content)) return resp.content;
        return [];
      };

      const combined = [
        ...extractProducts(respName),
        ...extractProducts(respCat),
        ...extractProducts(respBrand)
      ];

      const seen = new Set();
      const deduplicated = [];
      for (const p of combined) {
        if (p && p.productoId && !seen.has(p.productoId)) {
          seen.add(p.productoId);
          deduplicated.push(p);
          if (!this.availableProducts.some(ap => ap.productoId === p.productoId)) {
            this.availableProducts.push(p);
          }
        }
      }

      if (deduplicated.length === 0) {
        prodSelect.innerHTML = `<option value="">No se encontraron productos para "${trimmed}"</option>`;
      } else {
        prodSelect.innerHTML = `<option value="">-- Elegir producto del catálogo (${deduplicated.length}) --</option>` +
          deduplicated.map(p => {
            const catName = p.categoria ? (typeof p.categoria === 'object' ? p.categoria.nombre : p.categoria) : 'Sin Cat.';
            return `<option value="${p.productoId}">${p.nombre} [${catName}] - $${(p.precioVenta || 0).toLocaleString('es-AR')}</option>`;
          }).join('');
      }
    } catch (err) {
      console.warn('Error al buscar productos en backend:', err);
      prodSelect.innerHTML = `<option value="">Error al buscar productos</option>`;
    }
  }

  addItem() {
    const select = this.querySelector('#select-product');
    const qtyInput = this.querySelector('#input-qty');
    const id = select.value;
    const qty = parseInt(qtyInput.value) || 1;

    if (!id) {
      alert('Selecciona un elemento de la lista.');
      return;
    }

    let name = '';
    let price = 0;
    let unidadMedida = 'un.';

    if (this.annotationType === 'product') {
      const prod = this.availableProducts.find(p => String(p.productoId) === String(id));
      if (!prod) return;
      name = prod.nombre;
      price = prod.precioVenta || 0;
      unidadMedida = prod.unidadMedida || 'unidad';
    } else if (this.annotationType === 'combo') {
      const combo = this.availableCombos.find(c => String(c.comboId) === String(id));
      if (!combo) return;
      name = `[Combo] ${combo.nombre}`;
      price = combo.precio || 0;
      unidadMedida = 'combo';
    } else if (this.annotationType === 'menu') {
      const menu = this.availableMenus.find(m => String(m.menuDiarioId) === String(id));
      if (!menu) return;
      name = `[Menú] ${menu.nombre}`;
      price = menu.precio || 0;
      unidadMedida = 'menú';
    }

    const existingIndex = this.items.findIndex(item => String(item.id) === String(id) && item.type === this.annotationType);
    if (existingIndex >= 0) {
      this.items[existingIndex].qty += qty;
    } else {
      this.items.push({ id: parseInt(id, 10), name, price, qty, unidadMedida, type: this.annotationType });
    }

    select.value = '';
    qtyInput.value = '1';
    
    const searchInput = this.querySelector('#input-search-product');
    if (searchInput) searchInput.value = '';
    this.updateCatalogOptions();
    
    this.renderItems();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.renderItems();
  }

  calculateTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  renderItems() {
    if (!this.itemsContainer) return;

    if (this.items.length === 0) {
      this.itemsContainer.innerHTML = `
        <div class="p-4 text-center text-on-surface-variant text-sm font-medium">
          No hay elementos en la lista. Selecciona arriba para agregar.
        </div>
      `;
    } else {
      const getUnidadAbbr = (unidad) => {
        const u = String(unidad || '').toLowerCase();
        switch (u) {
          case 'kilogramo':
          case 'kg':
            return 'kg';
          case 'unidad':
            return 'unidad';
          case 'decena':
            return 'decena';
          case 'litro':
            return 'litro';
          case 'caja':
            return 'caja';
          default:
            return 'un.';
        }
      };

      this.itemsContainer.innerHTML = this.items.map((item, idx) => `
        <div class="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors">
          <div>
            <p class="font-semibold text-on-surface text-sm">${item.name}</p>
            <p class="text-xs text-on-surface-variant">$${item.price.toLocaleString('es-AR')} x ${item.qty} ${getUnidadAbbr(item.unidadMedida)}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-bold text-on-surface text-sm">$${(item.price * item.qty).toLocaleString('es-AR')}</span>
            <button type="button" class="btn-delete-item text-error hover:bg-error-container/30 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer" data-index="${idx}">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      `).join('');

      this.itemsContainer.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'));
          this.removeItem(idx);
        });
      });
    }

    const total = this.calculateTotal();
    if (this.totalEl) {
      this.totalEl.textContent = `$ ${total.toLocaleString('es-AR')}.00`;
    }
  }

  open(clienteId = null) {
    this.items = [];
    this.renderItems();
    
    const searchInput = this.querySelector('#input-search-product');
    if (searchInput) searchInput.value = '';

    this.preselectedClienteId = clienteId || new URLSearchParams(window.location.search).get('id') || null;
    this.loadCatalogs();
    this.backdrop?.classList.remove('hidden');
    setTimeout(() => {
      this.modalContent?.classList.remove('scale-95', 'opacity-0');
      this.modalContent?.classList.add('scale-100', 'opacity-100');
    }, 10);
  }

  close() {
    this.modalContent?.classList.remove('scale-100', 'opacity-100');
    this.modalContent?.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      this.backdrop?.classList.add('hidden');
    }, 150);
  }
}

customElements.define('app-modal-annotation', AppModalAnnotation);
