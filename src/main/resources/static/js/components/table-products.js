import { ProductosService } from '../services/api.js';

class AppTableProducts extends HTMLElement {
  connectedCallback() {
    this.products = [];
    this.categories = [];
    this.brands = [];
    this.loading = true;
    this.page = 0;
    this.size = 10;
    this.totalPages = 1;
    this.totalElements = 0;

    // Filters state
    this.nombreFilter = '';
    this.marcaFilter = '';
    this.categoryFilter = '';
    this.precioMinFilter = '';
    this.precioMaxFilter = '';
    this.sortFilter = '';
    this.showFilters = false;

    // Listen for product creation or updates to reload list
    document.addEventListener('product-created', () => this.loadData());
    document.addEventListener('product-updated', () => this.loadData());
    document.addEventListener('brand-created', () => this.loadBrands().then(() => this.render()));
    document.addEventListener('category-created', () => this.loadCategories().then(() => this.render()));

    this.renderSkeleton();
    this.initFiltersAndLoad();
  }

  async initFiltersAndLoad() {
    await Promise.all([
      this.loadCategories(),
      this.loadBrands()
    ]);
    await this.loadData();
  }

  renderSkeleton() {
    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col relative">
        <div class="p-card-gap border-b border-outline-variant/30 flex justify-between items-center bg-surface/50">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">list</span>
            Lista de Productos
          </h3>
        </div>
        <app-loader active="true" message="Cargando productos del catálogo..."></app-loader>
      </div>
    `;
  }

  async loadCategories() {
    try {
      const resp = await ProductosService.getCategorias();
      this.categories = Array.isArray(resp)
        ? resp.map(cat => typeof cat === 'object' && cat !== null ? (cat.nombre || cat.codigo || '') : cat).filter(Boolean)
        : [];
    } catch (err) {
      console.warn('No se pudieron cargar categorías para el filtro:', err);
      this.categories = ['Bebidas', 'Almacén', 'Lácteos y Fiambres', 'Golosinas y Snacks'];
    }
  }

  async loadBrands() {
    try {
      const resp = await ProductosService.getMarcas();
      this.brands = Array.isArray(resp)
        ? resp.map(brand => typeof brand === 'object' && brand !== null ? (brand.nombre || brand.codigo || '') : brand).filter(Boolean)
        : [];
    } catch (err) {
      console.warn('No se pudieron cargar marcas para el filtro:', err);
      this.brands = [];
    }
  }

  async loadData() {
    this.loading = true;
    try {
      const filters = {
        page: this.page,
        size: this.size
      };
      if (this.nombreFilter.trim()) filters.nombre = this.nombreFilter.trim();
      if (this.marcaFilter) filters.marca = this.marcaFilter;
      if (this.categoryFilter) filters.categoria = this.categoryFilter;
      if (this.precioMinFilter !== '') filters.precioMin = parseFloat(this.precioMinFilter);
      if (this.precioMaxFilter !== '') filters.precioMax = parseFloat(this.precioMaxFilter);
      if (this.sortFilter) filters.sort = this.sortFilter;

      const hasSearchFilters = filters.nombre || filters.marca || filters.categoria ||
        filters.precioMin !== undefined || filters.precioMax !== undefined ||
        filters.sort;

      let response;
      if (hasSearchFilters) {
        response = await ProductosService.search(filters);
      } else {
        response = await ProductosService.getPaged(this.page, this.size);
      }

      if (response && response.content) {
        this.products = response.content;
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || this.products.length;
      } else {
        this.products = Array.isArray(response) ? response : [];
        this.totalPages = 1;
        this.totalElements = this.products.length;
      }
    } catch (err) {
      console.warn('API de productos no disponible o vacía:', err);
      this.products = [];
      this.totalPages = 1;
      this.totalElements = 0;
    } finally {
      this.loading = false;
      this.render();
      this.updateStatsCards();
    }
  }

  async updateStatsCards() {
    try {
      const cardTotal = document.querySelector('#kpi-total-products');
      if (cardTotal) {
        cardTotal.setAttribute('value', String(this.totalElements));
      }

      const cardValue = document.querySelector('#kpi-total-value');
      if (cardValue) {
        const allProducts = await ProductosService.getAll();
        const productList = Array.isArray(allProducts) ? allProducts : (allProducts.content || []);
        const totalValue = productList.reduce((sum, p) => sum + ((parseFloat(p.precioVenta) || 0) * (parseInt(p.stock) || 0)), 0);
        cardValue.setAttribute('value', totalValue.toLocaleString('es-AR'));
      }
    } catch (err) {
      console.warn('Error updating products stats cards:', err);
    }
  }

  async deleteProduct(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await ProductosService.delete(id);
      this.loadData();
    } catch (err) {
      alert('Error al eliminar producto: ' + err.message);
    }
  }

  hasActiveFilters() {
    return !!(this.marcaFilter || this.categoryFilter || this.precioMinFilter !== '' || this.precioMaxFilter !== '' || this.sortFilter);
  }

  render() {
    const showAdmin = window.KioskoAPI?.Auth?.isAdmin();
    const adminClass = showAdmin ? '' : 'hidden';

    const categoryOptionsHtml = `<option value="" ${this.categoryFilter === '' ? 'selected' : ''}>Todas las Categorías</option>` +
      this.categories.map(cat => `<option value="${cat}" ${this.categoryFilter === cat ? 'selected' : ''}>${cat}</option>`).join('');

    const brandOptionsHtml = `<option value="" ${this.marcaFilter === '' ? 'selected' : ''}>Todas las Marcas</option>` +
      this.brands.map(brand => `<option value="${brand}" ${this.marcaFilter === brand ? 'selected' : ''}>${brand}</option>`).join('');

    let rowsHtml = '';
    if (this.products.length === 0) {
      const isFiltered = this.hasActiveFilters() || this.nombreFilter.trim();
      const icon = isFiltered ? 'search_off' : 'inventory_2';
      const title = isFiltered ? 'No se encontraron productos' : 'No hay productos registrados';
      const subtitle = isFiltered ? 'Probá modificando o limpiando los filtros de búsqueda.' : 'Cargá nuevos productos para verlos en la lista.';

      rowsHtml = `
        <tr>
          <td colspan="6" class="px-4 sm:px-6 py-12 text-center text-on-surface-variant">
            <div class="flex flex-col items-center justify-center gap-3 py-6">
              <span class="material-symbols-outlined text-5xl text-outline-variant/70 animate-pulse">${icon}</span>
              <div>
                <p class="font-semibold text-on-surface text-base">${title}</p>
                <p class="text-sm text-on-surface-variant mt-1">${subtitle}</p>
              </div>
            </div>
          </td>
        </tr>
      `;
    } else {
      rowsHtml = this.products.map(prod => {
        const brandName = prod.marca
          ? (typeof prod.marca === 'object' ? prod.marca.nombre : prod.marca)
          : '';
        const catName = prod.categoria
          ? (typeof prod.categoria === 'object' ? prod.categoria.nombre : prod.categoria)
          : 'Sin Categoría';

        const getUnidadAbbr = (unidad) => {
          const u = String(unidad || '').toLowerCase();
          switch (u) {
            case 'kilogramo':
            case 'kg':
              return 'kg';
            case 'unidad': return 'unidad';
            case 'decena': return 'decena';
            case 'litro': return 'litro';
            case 'caja': return 'caja';
            default: return 'unidad';
          }
        };

        return `
        <tr class="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
          <td class="px-4 sm:px-6 py-4">
            <div class="font-semibold text-on-surface text-sm sm:text-base">${prod.nombre}</div>
            ${brandName ? `<div class="text-xs text-on-surface-variant">Marca: ${brandName}</div>` : ''}
          </td>
          <td class="px-4 sm:px-6 py-4">
            <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-semibold bg-primary-container/30 text-primary">${catName}</span>
          </td>
          <td class="px-4 sm:px-6 py-4 text-right font-bold text-on-surface text-sm sm:text-base">$${(prod.precioVenta || 0).toLocaleString('es-AR')}</td>
          <td class="px-4 sm:px-6 py-4 text-center">
            <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold ${prod.stock <= 5 ? 'bg-error-container text-error' : 'bg-emerald-100 text-emerald-800'}">
              ${prod.stock} ${getUnidadAbbr(prod.unidadMedida)}
            </span>
          </td>
          <td class="px-4 sm:px-6 py-4 text-right ${adminClass}">
            <div class="flex items-center justify-end gap-1.5 sm:gap-2">
              <button 
                data-edit-json='${JSON.stringify(prod)}' 
                title="Editar" 
                class="btn-edit-prod w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-sm">edit</span>
              </button>
              <button 
                data-delete-id="${prod.productoId}" 
                title="Eliminar" 
                class="btn-delete-prod w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container/30 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      }).join('');
    }

    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
        
        <!-- Header -->
        <div class="p-4 sm:p-card-gap border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/50">
          <div class="flex items-center gap-3 w-full md:w-auto">
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">list</span>
              Lista de Productos
            </h3>
          </div>

          <!-- Quick Search & Filter Toggle -->
          <div class="flex items-center gap-2.5 w-full md:w-auto">
            <div class="relative flex-1 md:w-64">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input 
                id="input-quick-search"
                type="text" 
                value="${this.nombreFilter}"
                class="w-full h-10 pl-9 pr-3 bg-surface border border-outline-variant rounded-xl text-on-surface font-body-md text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-outline/70 transition-all"
                placeholder="Buscar por nombre..."
              />
            </div>
            
            <button 
              id="btn-toggle-filters" 
              class="h-10 px-3 flex items-center gap-1.5 rounded-xl border font-semibold text-sm transition-all cursor-pointer select-none
                     ${this.showFilters
        ? 'bg-primary/10 border-primary text-primary'
        : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}"
            >
              <span class="material-symbols-outlined text-sm">tune</span>
              <span>Filtros</span>
              ${this.hasActiveFilters() ? `<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>` : ''}
            </button>
          </div>
        </div>

        <!-- Collapsible Filter Panel -->
        <div id="filter-panel" class="${this.showFilters ? 'block' : 'hidden'} border-b border-outline-variant/30 p-4 sm:p-6 bg-surface-container-low/30 transition-all">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <!-- Brand Filter -->
            <div class="flex flex-col gap-1.5">
              <label for="filter-brand" class="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Marca</label>
              <select id="filter-brand" class="h-10 px-3 bg-surface border border-outline-variant rounded-xl text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary">
                ${brandOptionsHtml}
              </select>
            </div>

            <!-- Category Filter -->
            <div class="flex flex-col gap-1.5">
              <label for="filter-category" class="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Categoría</label>
              <select id="filter-category" class="h-10 px-3 bg-surface border border-outline-variant rounded-xl text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary">
                ${categoryOptionsHtml}
              </select>
            </div>

            <!-- Min Price Filter -->
            <div class="flex flex-col gap-1.5">
              <label for="filter-price-min" class="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Precio Mínimo</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">$</span>
                <input 
                  id="filter-price-min" 
                  type="number" 
                  value="${this.precioMinFilter}" 
                  placeholder="Mín" 
                  class="w-full h-10 pl-7 pr-3 bg-surface border border-outline-variant rounded-xl text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <!-- Max Price Filter -->
            <div class="flex flex-col gap-1.5">
              <label for="filter-price-max" class="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Precio Máximo</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">$</span>
                <input 
                  id="filter-price-max" 
                  type="number" 
                  value="${this.precioMaxFilter}" 
                  placeholder="Máx" 
                  class="w-full h-10 pl-7 pr-3 bg-surface border border-outline-variant rounded-xl text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <!-- Sorting -->
            <div class="flex flex-col gap-1.5 col-span-1">
              <label for="filter-sort" class="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Ordenar Por</label>
              <select id="filter-sort" class="h-10 px-3 bg-surface border border-outline-variant rounded-xl text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary">
                <option value="" ${this.sortFilter === '' ? 'selected' : ''}>Sin Orden</option>
                <option value="nombre,asc" ${this.sortFilter === 'nombre,asc' ? 'selected' : ''}>Nombre (A-Z)</option>
                <option value="nombre,desc" ${this.sortFilter === 'nombre,desc' ? 'selected' : ''}>Nombre (Z-A)</option>
                <option value="precioVenta,asc" ${this.sortFilter === 'precioVenta,asc' ? 'selected' : ''}>Precio (Menor a Mayor)</option>
                <option value="precioVenta,desc" ${this.sortFilter === 'precioVenta,desc' ? 'selected' : ''}>Precio (Mayor a Menor)</option>
                <option value="stock,asc" ${this.sortFilter === 'stock,asc' ? 'selected' : ''}>Stock (Menor a Mayor)</option>
                <option value="stock,desc" ${this.sortFilter === 'stock,desc' ? 'selected' : ''}>Stock (Mayor a Menor)</option>
              </select>
            </div>

          </div>

          <!-- Filter Actions -->
          <div class="flex justify-end items-center gap-3 mt-5 pt-4 border-t border-outline-variant/20">
            <button 
              id="btn-clear-filters" 
              class="h-10 px-4 flex items-center justify-center gap-1.5 text-on-surface-variant hover:bg-surface-container-high font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Limpiar Filtros</span>
            </button>
            
            <button 
              id="btn-apply-filters" 
              class="h-10 px-6 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">done</span>
              <span>Aplicar Filtros</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant/20">
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Producto</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Categoría</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Precio Venta</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-center">Stock</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right ${adminClass}">Acciones</th>
              </tr>
            </thead>
            <tbody class="font-data-table text-data-table text-on-surface">
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Pagination Component -->
        <app-pagination 
          current-page="${this.page}" 
          total-pages="${this.totalPages}" 
          total-elements="${this.totalElements}" 
          page-size="${this.size}">
        </app-pagination>
      </div>
    `;

    // Bind Pagination
    this.querySelector('app-pagination')?.addEventListener('page-change', (e) => {
      this.page = e.detail.page;
      this.loadData();
    });

    // Bind Toggle Filters Panel
    this.querySelector('#btn-toggle-filters')?.addEventListener('click', () => {
      this.showFilters = !this.showFilters;
      this.render();
    });

    // Bind Quick Search (Nombre)
    const quickSearchInput = this.querySelector('#input-quick-search');
    quickSearchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.nombreFilter = e.target.value;
        this.page = 0;
        this.loadData();
      }
    });
    quickSearchInput?.addEventListener('blur', (e) => {
      if (this.nombreFilter !== e.target.value) {
        this.nombreFilter = e.target.value;
        this.page = 0;
        this.loadData();
      }
    });

    // Bind Apply Filters Button
    this.querySelector('#btn-apply-filters')?.addEventListener('click', () => {
      this.nombreFilter = this.querySelector('#input-quick-search')?.value || '';
      this.marcaFilter = this.querySelector('#filter-brand')?.value || '';
      this.categoryFilter = this.querySelector('#filter-category')?.value || '';
      this.precioMinFilter = this.querySelector('#filter-price-min')?.value || '';
      this.precioMaxFilter = this.querySelector('#filter-price-max')?.value || '';
      this.sortFilter = this.querySelector('#filter-sort')?.value || '';

      this.page = 0;
      this.loadData();
    });

    // Bind Clear Filters Button
    this.querySelector('#btn-clear-filters')?.addEventListener('click', () => {
      this.nombreFilter = '';
      this.marcaFilter = '';
      this.categoryFilter = '';
      this.precioMinFilter = '';
      this.precioMaxFilter = '';
      this.sortFilter = '';

      this.page = 0;
      this.loadData();
    });

    // Bind Edit and Delete Buttons
    this.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const jsonStr = e.currentTarget.getAttribute('data-edit-json');
        if (jsonStr && window.openProductModal) {
          const prod = JSON.parse(jsonStr);
          window.openProductModal({
            id: prod.productoId,
            name: prod.nombre,
            category: prod.categoria,
            brand: prod.marca,
            sellPrice: prod.precioVenta,
            stock: prod.stock,
            unidadMedida: prod.unidadMedida
          });
        }
      });
    });

    this.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-id');
        this.deleteProduct(id);
      });
    });
  }
}

customElements.define('app-table-products', AppTableProducts);
