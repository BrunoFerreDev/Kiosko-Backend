import { ClientesService } from '../services/api.js';

class AppModalClient extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="modal-client-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200 relative">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">person_add</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Registrar Nuevo Cliente</h3>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Crea una ficha de cliente para fiado</p>
              </div>
            </div>
            <button id="btn-close-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form id="form-new-client" class="p-6 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Nombre *</label>
                <input type="text" name="nombre" required placeholder="Ej: Maria" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Apellido *</label>
                <input type="text" name="apellido" required placeholder="Ej: Rodriguez" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
            </div>

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Teléfono / WhatsApp *</label>
              <input type="tel" name="whatsApp" required placeholder="Ej: 1122334455" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
            </div>

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Saldo Pendiente ($)</label>
              <input type="number" name="saldoPendiente" placeholder="0.00" min="0" step="any" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3 mt-2">
              <button type="button" id="btn-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" id="btn-submit-client" class="h-11 px-6 bg-primary text-on-primary rounded-xl font-data-table font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">check</span>
                <span id="btn-client-label">Guardar Cliente</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    this.backdrop = this.querySelector('#modal-client-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.form = this.querySelector('#form-new-client');
    this.submitBtn = this.querySelector('#btn-submit-client');
    this.submitLabel = this.querySelector('#btn-client-label');

    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      this.setSubmitting(true);
      try {
        const response = await ClientesService.create(data);
        alert(`Cliente registrado exitosamente (ID: #${response.clienteId || 'OK'}).`);
        this.dispatchEvent(new CustomEvent('client-created', { detail: response, bubbles: true }));
        this.form.reset();
        this.close();
      } catch (err) {
        alert(`Error al registrar cliente: ${err.message}`);
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
      this.submitLabel.textContent = 'Guardando...';
      this.submitBtn.classList.add('opacity-75');
    } else {
      this.submitLabel.textContent = 'Guardar Cliente';
      this.submitBtn.classList.remove('opacity-75');
    }
  }

  open() {
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

customElements.define('app-modal-client', AppModalClient);
