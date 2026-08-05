import { ProductosService } from '../services/api.js';

class AppModalProduct extends HTMLElement {
  connectedCallback() {
    this.categories = [];
    this.brands = [];

    // Auto-reload dropdown lists when a new brand or category is created
    document.addEventListener('brand-created', () => this.loadBrands());
    document.addEventListener('category-created', () => this.loadCategories());

    this.render();
  }

  async loadDropdowns() {
    await Promise.all([
      this.loadCategories(),
      this.loadBrands()
    ]);
  }

  async loadCategories() {
    try {
      const resp = await ProductosService.getCategorias();
      this.categories = Array.isArray(resp) ? resp : [];
    } catch (err) {
      console.warn('No se pudieron cargar categorías de la API, usando por defecto:', err);
      this.categories = ['Bebidas', 'Almacén', 'Lácteos y Fiambres', 'Golosinas y Snacks', 'Cigarrillos', 'Otros'].map((name, i) => ({
        id: i + 1,
        nombre: name,
        codigo: name.toLowerCase().replace(/\s+/g, '-')
      }));
    }
    this.updateCategoryOptions();
  }

  async loadBrands() {
    try {
      const resp = await ProductosService.getMarcas();
      this.brands = Array.isArray(resp) ? resp : [];
    } catch (err) {
      console.warn('No se pudieron cargar marcas de la API, usando por defecto:', err);
      this.brands = [];
    }
    this.updateBrandOptions();
  }

  updateCategoryOptions() {
    const select = this.querySelector('#prod-category');
    if (!select) return;

    if (this.categories.length === 0) {
      select.innerHTML = '<option value="">Sin Categorías</option>';
    } else {
      select.innerHTML = this.categories.map(cat => {
        const id = typeof cat === 'object' && cat !== null ? cat.id : cat;
        const nombre = typeof cat === 'object' && cat !== null ? cat.nombre : cat;
        return `<option value="${id}">${nombre}</option>`;
      }).join('');
    }
  }

  updateBrandOptions() {
    const select = this.querySelector('#prod-brand');
    if (!select) return;

    if (this.brands.length === 0) {
      select.innerHTML = '<option value="">Sin Marcas disponible</option>';
    } else {
      select.innerHTML = `<option value="">Seleccionar Marca</option>` + this.brands.map(brand => {
        const id = typeof brand === 'object' && brand !== null ? brand.id : brand;
        const nombre = typeof brand === 'object' && brand !== null ? brand.nombre : brand;
        return `<option value="${id}">${nombre}</option>`;
      }).join('');
    }
  }

  resolveCategoryId(categoryField) {
    if (!categoryField) return '';
    if (typeof categoryField === 'object') return categoryField.id || '';
    if (!isNaN(categoryField) && categoryField !== '') return String(categoryField);
    const found = this.categories.find(c => c.nombre === categoryField || c.codigo === categoryField);
    return found ? String(found.id) : '';
  }

  resolveBrandId(brandField) {
    if (!brandField) return '';
    if (typeof brandField === 'object') return brandField.id || '';
    if (!isNaN(brandField) && brandField !== '') return String(brandField);
    const found = this.brands.find(b => b.nombre === brandField || b.codigo === brandField);
    return found ? String(found.id) : '';
  }

  render() {
    this.innerHTML = `
      <div id="modal-product-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <h3 id="modal-product-title" class="font-headline-sm text-headline-sm text-on-surface font-bold">Registrar Producto</h3>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Gestión de inventario y precios</p>
              </div>
            </div>
            <button id="btn-close-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form id="form-product" class="p-6 flex flex-col gap-4">
            <input type="hidden" name="id" id="prod-id" />

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Nombre del Producto *</label>
              <input type="text" name="nombre" id="prod-name" required placeholder="Ej: Coca Cola 2.25L" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
            </div>

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Marca</label>
              <div class="flex gap-2">
                <select name="marca" id="prod-brand" class="flex-1 h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md">
                  <option value="">Cargando marcas...</option>
                </select>
                <button type="button" onclick="openBrandModal()" title="Nueva Marca" class="w-11 h-11 rounded-xl border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-high cursor-pointer transition-colors">
                  <span class="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Categoría *</label>
              <div class="flex gap-2">
                <select name="categoria" id="prod-category" required class="flex-1 h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md">
                  <option value="">Cargando categorías...</option>
                </select>
                <button type="button" onclick="openCategoryModal()" title="Nueva Categoría" class="w-11 h-11 rounded-xl border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-high cursor-pointer transition-colors">
                  <span class="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Precio Costo ($)</label>
                <input type="number" name="precioCosto" id="prod-cost" placeholder="0.00" min="0" step="any" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Precio Venta ($) *</label>
                <input type="number" name="precioVenta" id="prod-price" required placeholder="0.00" min="0" step="any" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Stock Actual *</label>
                <input type="number" name="stock" id="prod-stock" required placeholder="0" min="0" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Unidad de Medida *</label>
                <select name="unidadMedida" id="prod-unit" required class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md">
                  <option value="unidad">Unidad (unidad)</option>
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="decena">Decena (decena)</option>
                  <option value="litro">Litro (litro)</option>
                  <option value="caja">Caja (caja)</option>
                </select>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3 mt-2">
              <button type="button" id="btn-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" id="btn-submit-product" class="h-11 px-6 bg-primary text-on-primary rounded-xl font-data-table font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">save</span>
                <span id="btn-submit-text">Guardar Producto</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    this.backdrop = this.querySelector('#modal-product-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.form = this.querySelector('#form-product');
    this.titleEl = this.querySelector('#modal-product-title');
    this.submitBtn = this.querySelector('#btn-submit-product');
    this.submitTextEl = this.querySelector('#btn-submit-text');

    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());
      const isEdit = !!data.id;

      this.setSubmitting(true);
      try {
        let response;
        if (isEdit) {
          response = await ProductosService.update(data.id, data);
          alert(`Producto "${data.nombre}" actualizado.`);
        } else {
          response = await ProductosService.create(data);
          alert(`Producto "${data.nombre}" creado exitosamente.`);
        }
        this.dispatchEvent(new CustomEvent(isEdit ? 'product-updated' : 'product-created', { detail: response, bubbles: true }));
        this.form.reset();
        this.close();
      } catch (err) {
        alert(`Error al procesar producto: ${err.message}`);
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

  setSubmitting(isSubmitting) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      this.submitTextEl.textContent = 'Procesando...';
      this.submitBtn.classList.add('opacity-75');
    } else {
      this.submitTextEl.textContent = 'Guardar Producto';
      this.submitBtn.classList.remove('opacity-75');
    }
  }

  async open(productData = null) {
    this.form.reset();
    
    // Set loading options text in select controls before load finishes
    const selectCat = this.querySelector('#prod-category');
    if (selectCat) selectCat.innerHTML = '<option value="">Cargando categorías...</option>';
    const selectBrand = this.querySelector('#prod-brand');
    if (selectBrand) selectBrand.innerHTML = '<option value="">Cargando marcas...</option>';

    if (productData) {
      this.titleEl.textContent = 'Editar Producto';
      this.submitTextEl.textContent = 'Guardar Cambios';
      this.querySelector('#prod-id').value = productData.id || productData.productoId || '';
      this.querySelector('#prod-name').value = productData.nombre || productData.name || '';
      this.querySelector('#prod-cost').value = productData.precioCosto || productData.costPrice || '';
      this.querySelector('#prod-price').value = productData.precioVenta || productData.sellPrice || '';
      this.querySelector('#prod-stock').value = productData.stock || '0';
      this.querySelector('#prod-unit').value = productData.unidadMedida || 'unidad';
    } else {
      this.titleEl.textContent = 'Registrar Producto';
      this.submitTextEl.textContent = 'Guardar Producto';
      this.querySelector('#prod-id').value = '';
      this.querySelector('#prod-unit').value = 'unidad';
    }

    this.backdrop?.classList.remove('hidden');
    setTimeout(() => {
      this.modalContent?.classList.remove('scale-95', 'opacity-0');
      this.modalContent?.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Wait for dropdowns to be populated
    await this.loadDropdowns();

    if (productData) {
      const catId = this.resolveCategoryId(productData.categoria || productData.category);
      const brandId = this.resolveBrandId(productData.marca || productData.brand || productData.marcaId);

      if (selectCat) selectCat.value = catId;
      if (selectBrand) selectBrand.value = brandId;
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

customElements.define('app-modal-product', AppModalProduct);
