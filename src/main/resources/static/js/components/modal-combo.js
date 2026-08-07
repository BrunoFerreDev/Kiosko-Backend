import { CombosService, ProductosService } from '../services/api.js';

class AppModalCombo extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div id="modal-combo-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-2xl mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">lunch_dining</span>
              </div>
              <div>
                <h3 id="modal-combo-title" class="font-headline-sm text-headline-sm text-on-surface font-bold">Crear Combo Especial</h3>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Agrupar productos con precio especial</p>
              </div>
            </div>
            <button id="btn-close-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form id="form-combo" class="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            <input type="hidden" name="id" id="combo-id" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Nombre del Combo *</label>
                <input type="text" name="nombre" id="combo-nombre" required placeholder="Ej: Hamburguesa con Papas y Gaseosa" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>

              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Precio del Combo ($) *</label>
                <input type="number" name="precio" id="combo-precio" required placeholder="0.00" min="0" step="any" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">URL de la Imagen (opcional)</label>
                <input type="url" name="imgUrl" id="combo-imgurl" placeholder="https://ejemplo.com/imagen.jpg" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>

              <div class="flex items-center pt-6">
                <label class="inline-flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" name="activo" id="combo-activo" checked class="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" />
                  <span class="text-sm font-semibold text-on-surface">Combo Activo (disponible para venta)</span>
                </label>
              </div>
            </div>

            <!-- Search and Add Product Section -->
            <div class="flex flex-col gap-1.5 relative">
              <label class="block font-label-caps text-label-caps text-on-surface uppercase font-semibold">Buscar y Agregar Producto *</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input type="text" id="combo-search-products" placeholder="Escribí el nombre del producto para agregarlo..." class="w-full h-11 pl-9 pr-3 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
              <!-- Autocomplete Search Results -->
              <div id="combo-search-results" class="hidden absolute top-[62px] left-0 right-0 z-20 flex-col bg-surface border border-outline-variant/60 rounded-xl overflow-hidden divide-y divide-outline-variant/10 shadow-lg max-h-56 overflow-y-auto"></div>
            </div>

            <div class="flex flex-col gap-2 mt-2">
              <label class="block font-label-caps text-label-caps text-on-surface uppercase font-semibold">Productos del Combo</label>

              <!-- Combo items list -->
              <div id="combo-items-container" class="flex flex-col gap-3 min-h-[100px] border border-outline-variant/30 rounded-xl p-3 bg-surface/50">
                <p id="combo-items-empty" class="text-xs text-on-surface-variant italic py-4 text-center">No hay productos agregados a este combo.</p>
              </div>

              <!-- Sugerido summary -->
              <div class="flex justify-between items-center bg-surface-container-low px-4 py-3 rounded-xl border border-outline-variant/20 mt-1">
                <span class="text-xs text-on-surface-variant font-medium">Suma de precios unitarios del combo:</span>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-primary" id="combo-suggested-total">$0</span>
                  <button type="button" id="btn-apply-suggested" class="text-[11px] underline text-primary hover:text-primary-fixed-variant font-semibold cursor-pointer">Copiar al precio</button>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3 mt-4">
              <button type="button" id="btn-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" id="btn-submit-combo" class="h-11 px-6 bg-primary text-on-primary rounded-xl font-data-table font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">save</span>
                <span id="btn-submit-text">Guardar Combo</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    this.backdrop = this.querySelector('#modal-combo-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.form = this.querySelector('#form-combo');
    this.titleEl = this.querySelector('#modal-combo-title');
    this.submitBtn = this.querySelector('#btn-submit-combo');
    this.submitTextEl = this.querySelector('#btn-submit-text');
    this.itemsContainer = this.querySelector('#combo-items-container');
    this.suggestedTotalEl = this.querySelector('#combo-suggested-total');

    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Debounce Product Search
    let searchDebounce;
    const searchInput = this.querySelector('#combo-search-products');
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(searchDebounce);
      if (!query) {
        const resultsContainer = this.querySelector('#combo-search-results');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        return;
      }
      searchDebounce = setTimeout(async () => {
        try {
          const resp = await ProductosService.search({ nombre: query, size: 5 });
          const products = resp && resp.content ? resp.content : (Array.isArray(resp) ? resp : []);
          this.renderSearchResults(products);
        } catch (err) {
          console.warn('Error al buscar productos para combo:', err);
        }
      }, 300);
    });

    // Close search list on clicking outside
    document.addEventListener('click', (e) => {
      const resultsContainer = this.querySelector('#combo-search-results');
      const searchInp = this.querySelector('#combo-search-products');
      if (resultsContainer && !resultsContainer.contains(e.target) && e.target !== searchInp) {
        resultsContainer.classList.add('hidden');
      }
    });

    this.querySelector('#btn-apply-suggested')?.addEventListener('click', () => {
      const suggestedVal = parseFloat(this.suggestedTotalEl.textContent.replace('$', '').replace(/\./g, '').replace(',', '.'));
      if (!isNaN(suggestedVal) && suggestedVal > 0) {
        this.querySelector('#combo-precio').value = suggestedVal;
      }
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = this.querySelector('#combo-id').value;
      const nombre = this.querySelector('#combo-nombre').value;
      const precio = parseFloat(this.querySelector('#combo-precio').value);
      const activo = this.querySelector('#combo-activo').checked;
      const imgUrl = this.querySelector('#combo-imgurl').value || null;

      // Extract items from dynamic rows
      const itemsPayload = [];
      const itemRows = this.itemsContainer.querySelectorAll('.combo-item-row');
      let valid = true;

      itemRows.forEach(row => {
        const prodIdInput = row.querySelector('.item-product-id');
        const qtyInput = row.querySelector('.item-qty-input');
        const priceInput = row.querySelector('.item-price-input');

        const productoId = parseInt(prodIdInput.value, 10);
        const cantidad = parseInt(qtyInput.value, 10);
        const precioUnitario = parseFloat(priceInput.value);

        if (isNaN(productoId) || isNaN(cantidad) || cantidad <= 0 || isNaN(precioUnitario) || precioUnitario < 0) {
          valid = false;
          return;
        }

        itemsPayload.push({
          productoId,
          cantidad,
          precioUnitario
        });
      });

      if (!valid) {
        alert('Complete todos los productos del combo con cantidades mayores a 0 y precios válidos.');
        return;
      }

      if (itemsPayload.length === 0) {
        alert('Debe agregar al menos un producto al combo.');
        return;
      }

      const isEdit = !!id;
      const payload = {
        nombre,
        precio,
        activo,
        imgUrl,
        items: itemsPayload
      };

      this.setSubmitting(true);
      try {
        let response;
        if (isEdit) {
          response = await CombosService.update(id, payload);
          alert(`Combo "${nombre}" actualizado.`);
        } else {
          response = await CombosService.create(payload);
          alert(`Combo "${nombre}" creado exitosamente.`);
        }
        this.dispatchEvent(new CustomEvent(isEdit ? 'combo-updated' : 'combo-created', { detail: response, bubbles: true }));
        this.close();
      } catch (err) {
        alert(`Error al procesar combo: ${err.message}`);
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
    const resultsContainer = this.querySelector('#combo-search-results');
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
            <button type="button" data-id="${p.productoId}" data-name="${p.nombre}" data-price="${p.precioVenta}" class="btn-add-searched-product h-8 px-3 bg-primary/10 text-primary hover:bg-primary text-xs font-bold rounded-lg transition-all cursor-pointer hover:text-on-primary">
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
        const price = parseFloat(btn.dataset.price || 0);

        this.addItemRow({
          productoId: id,
          nombre: name,
          precioUnitario: price,
          cantidad: 1
        });
        resultsContainer.classList.add('hidden');
        const searchInp = this.querySelector('#combo-search-products');
        if (searchInp) searchInp.value = '';
      });
    });
  }

  addItemRow(itemData) {
    const emptyMsg = this.querySelector('#combo-items-empty');
    if (emptyMsg) emptyMsg.remove();

    const row = document.createElement('div');
    row.className = 'combo-item-row flex flex-col sm:flex-row gap-2.5 items-end sm:items-center bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl shadow-sm relative group';

    const prodId = itemData.productoId || itemData.producto?.productoId || '';
    const prodName = itemData.nombre || itemData.producto?.nombre || 'Producto';
    const qty = itemData.cantidad || 1;
    const price = itemData.precioUnitario || '';

    row.innerHTML = `
      <input type="hidden" class="item-product-id" value="${prodId}" />
      
      <!-- Product Name -->
      <div class="flex-1 w-full flex flex-col gap-1">
        <label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block sm:hidden">Producto</label>
        <span class="text-sm font-semibold text-on-surface py-2 truncate">${prodName}</span>
      </div>

      <!-- Quantity -->
      <div class="w-full sm:w-20 flex flex-col gap-1">
        <label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block sm:hidden">Cant</label>
        <input type="number" class="item-qty-input h-10 w-full px-3 bg-surface border border-outline-variant rounded-xl text-sm text-center focus:ring-2 focus:ring-primary outline-none" min="1" value="${qty}" />
      </div>

      <!-- Price Unit -->
      <div class="w-full sm:w-32 flex flex-col gap-1">
        <label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block sm:hidden">Unitario ($)</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-semibold">$</span>
          <input type="number" class="item-price-input h-10 w-full pl-6 pr-3 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" min="0" step="any" placeholder="0.00" value="${price}" />
        </div>
      </div>

      <!-- Actions -->
      <button type="button" class="btn-remove-item w-10 h-10 rounded-xl flex items-center justify-center text-error hover:bg-error-container/30 border border-outline-variant/30 cursor-pointer transition-colors shrink-0">
        <span class="material-symbols-outlined text-[20px]">delete</span>
      </button>
    `;

    this.itemsContainer.appendChild(row);

    const qtyInput = row.querySelector('.item-qty-input');
    const priceInput = row.querySelector('.item-price-input');
    const removeBtn = row.querySelector('.btn-remove-item');

    qtyInput.addEventListener('input', () => this.recalculateSuggestedTotal());
    priceInput.addEventListener('input', () => this.recalculateSuggestedTotal());

    removeBtn.addEventListener('click', () => {
      row.remove();
      this.recalculateSuggestedTotal();
      if (this.itemsContainer.querySelectorAll('.combo-item-row').length === 0) {
        this.itemsContainer.innerHTML = `<p id="combo-items-empty" class="text-xs text-on-surface-variant italic py-4 text-center">No hay productos agregados a este combo.</p>`;
      }
    });

    this.recalculateSuggestedTotal();
  }

  recalculateSuggestedTotal() {
    let sum = 0;
    const itemRows = this.itemsContainer.querySelectorAll('.combo-item-row');
    itemRows.forEach(row => {
      const qty = parseInt(row.querySelector('.item-qty-input').value, 10) || 0;
      const price = parseFloat(row.querySelector('.item-price-input').value) || 0;
      sum += qty * price;
    });
    this.suggestedTotalEl.textContent = `$${sum.toLocaleString('es-AR')}`;
  }

  setSubmitting(isSubmitting) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      this.submitTextEl.textContent = 'Procesando...';
      this.submitBtn.classList.add('opacity-75');
    } else {
      this.submitTextEl.textContent = 'Guardar Combo';
      this.submitBtn.classList.remove('opacity-75');
    }
  }

  async open(comboData = null) {
    this.form.reset();
    this.itemsContainer.innerHTML = '';
    this.suggestedTotalEl.textContent = '$0';
    const resultsContainer = this.querySelector('#combo-search-results');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    const searchInp = this.querySelector('#combo-search-products');
    if (searchInp) searchInp.value = '';

    if (comboData) {
      this.titleEl.textContent = 'Editar Combo';
      this.submitTextEl.textContent = 'Guardar Cambios';
      this.querySelector('#combo-id').value = comboData.id || comboData.comboId || '';
      this.querySelector('#combo-nombre').value = comboData.nombre || '';
      this.querySelector('#combo-precio').value = comboData.precio || '';
      this.querySelector('#combo-imgurl').value = comboData.imgUrl || '';
      this.querySelector('#combo-activo').checked = comboData.activo !== false;
    } else {
      this.titleEl.textContent = 'Crear Combo Especial';
      this.submitTextEl.textContent = 'Guardar Combo';
      this.querySelector('#combo-id').value = '';
      this.querySelector('#combo-activo').checked = true;
    }

    this.backdrop?.classList.remove('hidden');
    setTimeout(() => {
      this.modalContent?.classList.remove('scale-95', 'opacity-0');
      this.modalContent?.classList.add('scale-100', 'opacity-100');
    }, 10);

    if (comboData && comboData.items && comboData.items.length > 0) {
      comboData.items.forEach(item => {
        this.addItemRow(item);
      });
    } else {
      this.itemsContainer.innerHTML = `<p id="combo-items-empty" class="text-xs text-on-surface-variant italic py-4 text-center">No hay productos agregados a este combo.</p>`;
    }
  }

  close() {
    this.modalContent?.classList.remove('scale-100', 'opacity-100');
    this.modalContent?.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      this.backdrop?.classList.add('hidden');
    }, 150);
  }
}

customElements.define('app-modal-combo', AppModalCombo);
