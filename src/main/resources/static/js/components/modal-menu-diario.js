import { MenuDiariosService, ProductosService } from '../services/api.js';

class AppModalMenuDiario extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div id="modal-menu-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">restaurant_menu</span>
              </div>
              <div>
                <h3 id="modal-menu-title" class="font-headline-sm text-headline-sm text-on-surface font-bold">Crear Menú Diario</h3>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Establecer plato especial del día</p>
              </div>
            </div>
            <button id="btn-close-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form id="form-menu" class="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            <input type="hidden" name="id" id="menu-id" />

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Nombre del Menú *</label>
              <input type="text" name="nombre" id="menu-nombre" required placeholder="Ej: Tallarines con salsa bolognesa" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Precio ($) *</label>
                <input type="number" name="precio" id="menu-precio" required placeholder="0.00" min="0" step="any" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
              
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Fecha del Menú *</label>
                <input type="date" name="fecha" id="menu-fecha" required class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
            </div>

            <!-- Search and Add Product Section -->
            <div class="flex flex-col gap-1.5 relative">
              <label class="block font-label-caps text-label-caps text-on-surface uppercase font-semibold font-semibold">Buscar y Agregar Producto *</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input type="text" id="menu-search-products" placeholder="Escribí el nombre del producto para agregarlo..." class="w-full h-11 pl-9 pr-3 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
              <!-- Autocomplete Search Results -->
              <div id="menu-search-results" class="hidden absolute top-[62px] left-0 right-0 z-20 flex-col bg-surface border border-outline-variant/60 rounded-xl overflow-hidden divide-y divide-outline-variant/10 shadow-lg max-h-56 overflow-y-auto"></div>
            </div>

            <div class="flex flex-col gap-2 mt-2">
              <label class="block font-label-caps text-label-caps text-on-surface uppercase font-semibold">Productos del Menú *</label>

              <!-- Daily Menu items list -->
              <div id="menu-items-container" class="flex flex-col gap-2.5 min-h-[100px] border border-outline-variant/30 rounded-xl p-3 bg-surface/50">
                <p id="menu-items-empty" class="text-xs text-on-surface-variant italic py-4 text-center">No hay productos agregados a este menú diario.</p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3 mt-2">
              <button type="button" id="btn-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" id="btn-submit-menu" class="h-11 px-6 bg-primary text-on-primary rounded-xl font-data-table font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">save</span>
                <span id="btn-submit-text">Guardar Menú</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    this.backdrop = this.querySelector('#modal-menu-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.form = this.querySelector('#form-menu');
    this.titleEl = this.querySelector('#modal-menu-title');
    this.submitBtn = this.querySelector('#btn-submit-menu');
    this.submitTextEl = this.querySelector('#btn-submit-text');
    this.itemsContainer = this.querySelector('#menu-items-container');

    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Debounce Product Search
    let searchDebounce;
    const searchInput = this.querySelector('#menu-search-products');
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(searchDebounce);
      if (!query) {
        const resultsContainer = this.querySelector('#menu-search-results');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        return;
      }
      searchDebounce = setTimeout(async () => {
        try {
          const resp = await ProductosService.search({ nombre: query, size: 5 });
          const products = resp && resp.content ? resp.content : (Array.isArray(resp) ? resp : []);
          this.renderSearchResults(products);
        } catch (err) {
          console.warn('Error al buscar productos para menú diario:', err);
        }
      }, 300);
    });

    // Close search list on clicking outside
    document.addEventListener('click', (e) => {
      const resultsContainer = this.querySelector('#menu-search-results');
      const searchInp = this.querySelector('#menu-search-products');
      if (resultsContainer && !resultsContainer.contains(e.target) && e.target !== searchInp) {
        resultsContainer.classList.add('hidden');
      }
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = this.querySelector('#menu-id').value;
      const nombre = this.querySelector('#menu-nombre').value;
      const precio = parseFloat(this.querySelector('#menu-precio').value);
      const fecha = this.querySelector('#menu-fecha').value;

      // Extract products
      const itemRows = this.itemsContainer.querySelectorAll('.menu-item-row');
      const productoIds = [];
      itemRows.forEach(row => {
        const prodIdInput = row.querySelector('.item-product-id');
        const productoId = parseInt(prodIdInput.value, 10);
        if (!isNaN(productoId)) {
          productoIds.push(productoId);
        }
      });

      if (productoIds.length === 0) {
        alert('Debe agregar al menos un producto al menú diario.');
        return;
      }

      const isEdit = !!id;
      const payload = {
        nombre,
        precio,
        fecha,
        productoIds
      };

      this.setSubmitting(true);
      try {
        let response;
        if (isEdit) {
          response = await MenuDiariosService.update(id, payload);
          alert(`Menú del día actualizado.`);
        } else {
          response = await MenuDiariosService.create(payload);
          alert(`Menú del día creado exitosamente.`);
        }
        this.dispatchEvent(new CustomEvent(isEdit ? 'menu-updated' : 'menu-created', { detail: response, bubbles: true }));
        this.close();
      } catch (err) {
        alert(`Error al procesar menú diario: ${err.message}`);
      } finally {
        this.setSubmitting(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.backdrop?.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  renderSearchResults(products) {
    const resultsContainer = this.querySelector('#menu-search-results');
    if (!resultsContainer) return;

    if (!products || products.length === 0) {
      resultsContainer.innerHTML = `<div class="p-4 text-xs text-on-surface-variant italic text-center">No se encontraron productos</div>`;
      resultsContainer.classList.remove('hidden');
      return;
    }

    resultsContainer.innerHTML = products.map(p => {
      const cat = p.categoria ? (typeof p.categoria === 'object' ? p.categoria.nombre : p.categoria) : 'General';
      const brand = p.marca ? (typeof p.marca === 'object' ? p.marca.nombre : p.marca) : '';
      const brandText = brand ? ` • ${brand}` : '';
      return `
        <div class="flex items-center justify-between p-3 hover:bg-surface-container-high/40 transition-colors select-none">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-on-surface truncate">${p.nombre}</p>
            <p class="text-xs text-on-surface-variant font-medium capitalize">${cat}${brandText} <span class="ml-2 font-normal">(Stock: ${p.stock})</span></p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-primary">$${Number(p.precioVenta).toLocaleString('es-AR')}</span>
            <button type="button" data-id="${p.productoId}" data-name="${p.nombre}" class="btn-add-searched-product h-8 px-3 bg-primary/10 text-primary hover:bg-primary text-xs font-bold rounded-lg transition-all cursor-pointer hover:text-on-primary">
              Agregar
            </button>
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.classList.remove('hidden');

    resultsContainer.querySelectorAll('.btn-add-searched-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;

        // Check if already exists
        const existing = this.itemsContainer.querySelector(`.item-product-id[value="${id}"]`);
        if (existing) {
          alert('Este producto ya está agregado al menú diario.');
          return;
        }

        this.addItemRow({
          productoId: id,
          nombre: name
        });
        resultsContainer.classList.add('hidden');
        const searchInp = this.querySelector('#menu-search-products');
        if (searchInp) searchInp.value = '';
      });
    });
  }

  addItemRow(itemData) {
    const emptyMsg = this.querySelector('#menu-items-empty');
    if (emptyMsg) emptyMsg.remove();

    const row = document.createElement('div');
    row.className = 'menu-item-row flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 px-3 py-2.5 rounded-xl shadow-sm relative group';

    const prodId = itemData.productoId || itemData.id || '';
    const prodName = itemData.nombre || 'Producto';

    row.innerHTML = `
      <input type="hidden" class="item-product-id" value="${prodId}" />
      
      <!-- Product Name -->
      <div class="flex-1 min-w-0 pr-3">
        <span class="text-sm font-semibold text-on-surface truncate">${prodName}</span>
      </div>

      <!-- Actions -->
      <button type="button" class="btn-remove-item w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/30 border border-outline-variant/30 cursor-pointer transition-colors shrink-0">
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    `;

    this.itemsContainer.appendChild(row);

    const removeBtn = row.querySelector('.btn-remove-item');
    removeBtn.addEventListener('click', () => {
      row.remove();
      if (this.itemsContainer.querySelectorAll('.menu-item-row').length === 0) {
        this.itemsContainer.innerHTML = `<p id="menu-items-empty" class="text-xs text-on-surface-variant italic py-4 text-center">No hay productos agregados a este menú diario.</p>`;
      }
    });
  }

  setSubmitting(isSubmitting) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      this.submitTextEl.textContent = 'Procesando...';
      this.submitBtn.classList.add('opacity-75');
    } else {
      this.submitTextEl.textContent = 'Guardar Menú';
      this.submitBtn.classList.remove('opacity-75');
    }
  }

  async open(menuData = null) {
    this.form.reset();
    this.itemsContainer.innerHTML = '';
    const resultsContainer = this.querySelector('#menu-search-results');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    const searchInp = this.querySelector('#menu-search-products');
    if (searchInp) searchInp.value = '';

    if (menuData) {
      this.titleEl.textContent = 'Editar Menú Diario';
      this.submitTextEl.textContent = 'Guardar Cambios';
      this.querySelector('#menu-id').value = menuData.id || menuData.menuDiarioId || '';
      this.querySelector('#menu-nombre').value = menuData.nombre || '';
      this.querySelector('#menu-precio').value = menuData.precio || '';

      let dateVal = '';
      if (menuData.fecha) {
        dateVal = menuData.fecha.substring(0, 10);
      }
      this.querySelector('#menu-fecha').value = dateVal;

      // Populate selected products
      if (menuData.productos && menuData.productos.length > 0) {
        menuData.productos.forEach(prod => {
          this.addItemRow({
            productoId: prod.productoId || prod.id,
            nombre: prod.nombre
          });
        });
      } else if (menuData.productoIds && menuData.productoIds.length > 0) {
        // If we only have IDs, load details for each product
        for (const prodId of menuData.productoIds) {
          try {
            const prod = await ProductosService.getById(prodId);
            this.addItemRow({
              productoId: prod.productoId || prod.id,
              nombre: prod.nombre
            });
          } catch (err) {
            console.warn(`Error loading details for product ${prodId}:`, err);
            this.addItemRow({
              productoId: prodId,
              nombre: `Producto ID: ${prodId}`
            });
          }
        }
      } else {
        this.itemsContainer.innerHTML = `<p id="menu-items-empty" class="text-xs text-on-surface-variant italic py-4 text-center">No hay productos agregados a este menú diario.</p>`;
      }
    } else {
      this.titleEl.textContent = 'Crear Menú Diario';
      this.submitTextEl.textContent = 'Guardar Menú';
      this.querySelector('#menu-id').value = '';

      const today = new Date().toISOString().substring(0, 10);
      this.querySelector('#menu-fecha').value = today;
      this.itemsContainer.innerHTML = `<p id="menu-items-empty" class="text-xs text-on-surface-variant italic py-4 text-center">No hay productos agregados a este menú diario.</p>`;
    }

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

customElements.define('app-modal-menu-diario', AppModalMenuDiario);
