import { MenuDiariosService } from '../services/api.js';

class AppModalMenuDiario extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div id="modal-menu-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200">
          
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
          <form id="form-menu" class="p-6 flex flex-col gap-4">
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

    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = this.querySelector('#menu-id').value;
      const nombre = this.querySelector('#menu-nombre').value;
      const precio = parseFloat(this.querySelector('#menu-precio').value);
      const fecha = this.querySelector('#menu-fecha').value;

      const isEdit = !!id;
      const payload = {
        nombre,
        precio,
        fecha
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
    } else {
      this.titleEl.textContent = 'Crear Menú Diario';
      this.submitTextEl.textContent = 'Guardar Menú';
      this.querySelector('#menu-id').value = '';
      
      const today = new Date().toISOString().substring(0, 10);
      this.querySelector('#menu-fecha').value = today;
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
