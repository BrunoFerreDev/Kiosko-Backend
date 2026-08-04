import { PagosService } from '../services/api.js';

class AppModalPayment extends HTMLElement {
  connectedCallback() {
    this.clienteId = null;
    this.monto = 0;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div id="modal-payment-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Registrar Pago de Cliente</h3>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Ingresar monto o pago de ítems seleccionados</p>
              </div>
            </div>
            <button id="btn-close-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Form -->
          <form id="form-payment" class="p-6 flex flex-col gap-4">
            <input type="hidden" name="clienteId" id="pay-client-id" />

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Monto a Abonar ($) *</label>
              <input type="number" name="montoAbonado" id="pay-amount" required placeholder="0.00" min="1" step="any" class="w-full h-12 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-headline-sm text-primary" />
            </div>

            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Método de Pago *</label>
              <select name="metodoPago" id="pay-method" required class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia bancaria</option>
                <option value="AMBAS">Ambas juntas (Efectivo + Transferencia)</option>
              </select>
            </div>

            <!-- Contenedor para pago mixto -->
            <div id="mixed-payment-fields" class="hidden border border-outline-variant/30 p-4 rounded-xl flex flex-col gap-4 bg-surface-container-low">
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Monto en Efectivo ($) *</label>
                <input type="number" id="pay-amount-cash" placeholder="0.00" min="0" step="any" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-primary" />
              </div>
              <div>
                <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold">Monto en Transferencia ($) *</label>
                <input type="number" id="pay-amount-transfer" placeholder="0.00" min="0" step="any" class="w-full h-11 px-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-primary" />
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3 mt-2">
              <button type="button" id="btn-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" id="btn-submit-payment" class="h-11 px-6 bg-primary text-on-primary rounded-xl font-data-table font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                <span id="btn-pay-label">Confirmar Pago</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    this.backdrop = this.querySelector('#modal-payment-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.form = this.querySelector('#form-payment');
    this.submitBtn = this.querySelector('#btn-submit-payment');
    this.submitLabel = this.querySelector('#btn-pay-label');
    this.payMethod = this.querySelector('#pay-method');
    this.payAmount = this.querySelector('#pay-amount');
    this.mixedFields = this.querySelector('#mixed-payment-fields');
    this.payAmountCash = this.querySelector('#pay-amount-cash');
    this.payAmountTransfer = this.querySelector('#pay-amount-transfer');

    this.querySelector('#btn-close-modal')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    this.payMethod?.addEventListener('change', () => this.handleMethodChange());
    this.payAmountCash?.addEventListener('input', () => this.calculateMixedTotal());
    this.payAmountTransfer?.addEventListener('input', () => this.calculateMixedTotal());

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      this.setSubmitting(true);
      try {
        const metodoPago = data.metodoPago;
        const clienteId = parseInt(data.clienteId, 10);
        let response;

        if (metodoPago === 'AMBAS') {
          const cashAmount = parseFloat(this.payAmountCash.value) || 0;
          const transferAmount = parseFloat(this.payAmountTransfer.value) || 0;

          if (cashAmount <= 0 && transferAmount <= 0) {
            throw new Error('Debe ingresar un monto mayor a cero en efectivo o transferencia.');
          }

          const promises = [];
          if (cashAmount > 0) {
            promises.push(PagosService.create({
              clienteId,
              montoAbonado: cashAmount,
              metodoPago: 'EFECTIVO',
              fechaPago: new Date().toISOString()
            }));
          }
          if (transferAmount > 0) {
            promises.push(PagosService.create({
              clienteId,
              montoAbonado: transferAmount,
              metodoPago: 'TRANSFERENCIA',
              fechaPago: new Date().toISOString()
            }));
          }

          const responses = await Promise.all(promises);
          response = responses[0];

          alert(`Pagos registrados exitosamente: Efectivo: $${cashAmount.toLocaleString('es-AR')}, Transferencia: $${transferAmount.toLocaleString('es-AR')}.`);
        } else {
          const montoAbonado = parseFloat(data.montoAbonado) || 0;
          response = await PagosService.create({
            clienteId,
            montoAbonado,
            metodoPago,
            fechaPago: new Date().toISOString()
          });

          alert(`Pago registrado exitosamente ($${montoAbonado.toLocaleString('es-AR')}).`);
        }

        this.dispatchEvent(new CustomEvent('payment-created', { detail: response, bubbles: true }));
        this.form.reset();
        this.handleMethodChange();
        this.close();
      } catch (err) {
        alert(`Error al registrar pago: ${err.message}`);
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

  handleMethodChange() {
    const method = this.payMethod?.value;
    if (method === 'AMBAS') {
      this.mixedFields?.classList.remove('hidden');
      this.payAmount.readOnly = true;
      this.payAmountCash.required = true;
      this.payAmountTransfer.required = true;
      
      const currentAmount = parseFloat(this.payAmount.value) || 0;
      this.payAmountCash.value = currentAmount > 0 ? currentAmount : '';
      this.payAmountTransfer.value = '';
      this.calculateMixedTotal();
    } else {
      this.mixedFields?.classList.add('hidden');
      this.payAmount.readOnly = false;
      this.payAmountCash.required = false;
      this.payAmountTransfer.required = false;
      this.payAmountCash.value = '';
      this.payAmountTransfer.value = '';
    }
  }

  calculateMixedTotal() {
    const cash = parseFloat(this.payAmountCash.value) || 0;
    const transfer = parseFloat(this.payAmountTransfer.value) || 0;
    this.payAmount.value = cash + transfer > 0 ? cash + transfer : '';
  }

  setSubmitting(isSubmitting) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      this.submitLabel.textContent = 'Procesando...';
      this.submitBtn.classList.add('opacity-75');
    } else {
      this.submitLabel.textContent = 'Confirmar Pago';
      this.submitBtn.classList.remove('opacity-75');
    }
  }

  open(clienteId = null, monto = 0) {
    this.clienteId = clienteId || new URLSearchParams(window.location.search).get('id') || 1;
    this.querySelector('#pay-client-id').value = this.clienteId;
    
    if (this.payMethod) {
      this.payMethod.value = 'EFECTIVO';
    }
    this.handleMethodChange();
    
    this.querySelector('#pay-amount').value = monto > 0 ? monto : '';
    
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

customElements.define('app-modal-payment', AppModalPayment);
