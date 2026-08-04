import { ClientesService, ProductosService, AnotadosService } from '../services/api.js';

class AppModalAnnotation extends HTMLElement {
  connectedCallback() {
    this.items = [];
    this.availableProducts = [];
    this.availableClients = [];
    this.loadingData = false;

    this.render();
  }

  async loadCatalogs() {
    this.loadingData = true;
    try {
      const [clientsResp, prodsResp] = await Promise.all([
        ClientesService.getAll().catch(() => []),
        ProductosService.getAll().catch(() => [])
      ]);

      this.availableClients = Array.isArray(clientsResp) ? clientsResp : (clientsResp.content || []);
      this.availableProducts = Array.isArray(prodsResp) ? prodsResp : (prodsResp.content || []);
    } catch (err) {
      console.warn('No se pudo cargar catálogos desde la API, usando datos por defecto:', err);
      this.availableClients = [
        { clienteId: 1, nombreCompleto: 'Juan Pérez' },
        { clienteId: 2, nombreCompleto: 'Familia Pérez' }
      ];
      this.availableProducts = [
        { productoId: 1, nombre: 'Coca Cola 2.25L', precioVenta: 1400 },
        { productoId: 2, nombre: 'Leche Entera 1L (Sachet)', precioVenta: 450 }
      ];
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
        this.availableClients.map(c => `<option value="${c.clienteId}">${c.nombreCompleto}</option>`).join('');
      if (this.preselectedClienteId) {
        clientSelect.value = this.preselectedClienteId;
      }
    }

    if (prodSelect) {
      prodSelect.innerHTML = `<option value="">-- Elegir producto del catálogo --</option>` +
        this.availableProducts.map(p => `<option value="${p.productoId}">${p.nombre} [${p.categoria || 'Sin Cat.'}] - $${(p.precioVenta || 0).toLocaleString('es-AR')}</option>`).join('');
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
              <label class="block font-label-caps text-label-caps text-on-surface uppercase font-semibold">Agregar Producto a la Anotación</label>
              
              <!-- Buscador de producto por nombre o categoría -->
              <input type="text" id="input-search-product" placeholder="Buscar por nombre o categoría..." class="w-full h-11 px-3 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium" />

              <div class="flex flex-col gap-3">
                <select id="select-product" class="w-full h-11 px-3 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="">Cargando productos...</option>
                </select>

                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-on-surface-variant uppercase">Cantidad:</span>
                    <input type="number" id="input-qty" value="1" min="1" max="99" class="w-16 h-11 px-2 bg-surface text-on-surface border border-outline-variant rounded-xl text-center font-bold outline-none" title="Cantidad" />
                  </div>
                  
                  <button type="button" id="btn-add-item" class="h-11 px-6 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-fixed-variant transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    <span class="material-symbols-outlined text-sm">add</span>
                    <span>Agregar Producto</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Items Added List -->
            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-2 font-semibold">Productos Anotados</label>
              
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
      }, 2000);
    });

    this.querySelector('#input-search-product')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchBackendProducts(e.target.value);
      }
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      if (this.items.length === 0) {
        alert('Por favor agrega al menos un producto a la anotación.');
        return;
      }

      this.setSubmitting(true);
      try {
        // Post each item to /anotados endpoint per API docs
        const promises = this.items.map(item => AnotadosService.create({
          clienteId: data.clienteId,
          productoId: item.id,
          cantidad: item.qty,
          precioUnitario: item.price,
          fechaAnotado: new Date().toISOString(),
          estado: 'PENDIENTE'
        }));

        await Promise.all(promises);
        alert(`Anotación de ${this.items.length} producto(s) guardada con éxito en la API.`);
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

    this.renderItems();
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
          // Asegurar que el producto esté en availableProducts para que addItem lo encuentre
          if (!this.availableProducts.some(ap => ap.productoId === p.productoId)) {
            this.availableProducts.push(p);
          }
        }
      }

      if (deduplicated.length === 0) {
        prodSelect.innerHTML = `<option value="">No se encontraron productos para "${trimmed}"</option>`;
      } else {
        prodSelect.innerHTML = `<option value="">-- Elegir producto del catálogo (${deduplicated.length}) --</option>` +
          deduplicated.map(p => `<option value="${p.productoId}">${p.nombre} [${p.categoria || 'Sin Cat.'}] - $${(p.precioVenta || 0).toLocaleString('es-AR')}</option>`).join('');
      }
    } catch (err) {
      console.warn('Error al buscar productos en backend:', err);
      prodSelect.innerHTML = `<option value="">Error al buscar productos</option>`;
    }
  }

  addItem() {
    const select = this.querySelector('#select-product');
    const qtyInput = this.querySelector('#input-qty');
    const productId = select.value;
    const qty = parseInt(qtyInput.value) || 1;

    if (!productId) {
      alert('Selecciona un producto de la lista.');
      return;
    }

    const prod = this.availableProducts.find(p => String(p.productoId) === String(productId));
    if (!prod) return;

    const price = prod.precioVenta || 0;
    const existingIndex = this.items.findIndex(item => String(item.id) === String(productId));
    if (existingIndex >= 0) {
      this.items[existingIndex].qty += qty;
    } else {
      this.items.push({ id: prod.productoId, name: prod.nombre, price, qty });
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
          No hay productos en la lista. Selecciona arriba para agregar.
        </div>
      `;
    } else {
      this.itemsContainer.innerHTML = this.items.map((item, idx) => `
        <div class="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors">
          <div>
            <p class="font-semibold text-on-surface text-sm">${item.name}</p>
            <p class="text-xs text-on-surface-variant">$${item.price.toLocaleString('es-AR')} x ${item.qty} un.</p>
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
