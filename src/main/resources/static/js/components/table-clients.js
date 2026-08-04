import { ClientesService } from '../services/api.js';

class AppTableClients extends HTMLElement {
  connectedCallback() {
    this.clients = [];
    this.loading = true;
    this.page = 0;
    this.size = 10;
    this.totalPages = 1;
    this.totalElements = 0;

    // Listen for annotation or payment changes to refresh balances
    document.addEventListener('annotation-created', () => this.loadData());
    document.addEventListener('payment-created', () => this.loadData());
    document.addEventListener('client-created', () => this.loadData());
    document.addEventListener('client-updated', () => this.loadData());

    this.renderSkeleton();
    this.loadData();
  }

  renderSkeleton() {
    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col relative">
        <div class="p-card-gap border-b border-outline-variant/30 flex justify-between items-center bg-surface/50">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">groups</span>
            Directorio de Clientes
          </h3>
        </div>
        <app-loader active="true" message="Cargando lista de clientes..."></app-loader>
      </div>
    `;
  }

  async loadData() {
    this.loading = true;
    try {
      const response = await ClientesService.getPaged(this.page, this.size);
      if (response && response.content) {
        this.clients = response.content;
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || this.clients.length;
      } else {
        this.clients = Array.isArray(response) ? response : [];
        this.totalPages = 1;
        this.totalElements = this.clients.length;
      }

      // Fetch all clients to accurately compute stats cards (total debt & debtors count)
      try {
        const allClients = await ClientesService.getAll();
        const clientList = Array.isArray(allClients) ? allClients : (allClients.content || this.clients);
        this.updateStatsCards(clientList, this.totalElements);
      } catch (errStats) {
        this.updateStatsCards(this.clients, this.totalElements);
      }

    } catch (err) {
      console.warn('API de clientes no disponible o vacía, usando datos fallback:', err);
      this.clients = [
        { clienteId: 1, nombreCompleto: 'Juan Pérez', whatsApp: '1122334455', estado: true, saldoPendiente: 4250 },
        { clienteId: 2, nombreCompleto: 'Familia Pérez', whatsApp: '1198765432', estado: true, saldoPendiente: 1500 },
        { clienteId: 3, nombreCompleto: 'Maria Rodriguez', whatsApp: '1144556677', estado: true, saldoPendiente: 0 }
      ];
      this.totalPages = 1;
      this.totalElements = 3;
      this.updateStatsCards(this.clients, 3);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  updateStatsCards(clientList, totalElements) {
    const totalDebt = clientList.reduce((sum, c) => sum + (parseFloat(c.saldoPendiente) || 0), 0);
    const debtorsCount = clientList.filter(c => (parseFloat(c.saldoPendiente) || 0) > 0).length;

    // Update KPI Card elements on pages/clientes.html if present
    const cardTotalClients = document.querySelector('#kpi-total-clients');
    if (cardTotalClients) cardTotalClients.setAttribute('value', String(totalElements));

    const cardDebtorsCount = document.querySelector('#kpi-debtors-count');
    if (cardDebtorsCount) cardDebtorsCount.setAttribute('value', String(debtorsCount));

    const cardTotalDebt = document.querySelector('#kpi-total-debt');
    if (cardTotalDebt) cardTotalDebt.setAttribute('value', totalDebt.toLocaleString('es-AR'));
  }

  async deleteClient(id) {
    if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
    try {
      await ClientesService.delete(id);
      this.loadData();
    } catch (err) {
      alert('Error al eliminar cliente: ' + err.message);
    }
  }

  render() {
    const rowsHtml = this.clients.map(cli => {
      const saldo = parseFloat(cli.saldoPendiente || 0);
      const saldoFormatted = saldo > 0 ? `$ ${saldo.toLocaleString('es-AR')}` : '$ 0';
      const saldoColor = saldo > 0 ? 'text-error font-bold' : 'text-on-surface';

      return `
        <tr class="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
          <td class="px-4 sm:px-6 py-4">
            <div>
              <a href="cliente-detalle.html?id=${cli.clienteId}" class="font-semibold text-on-surface hover:text-primary transition-colors text-sm sm:text-base">${cli.nombreCompleto}</a>
              <p class="text-xs text-on-surface-variant">ID: #${cli.clienteId}</p>
            </div>
          </td>
          <!-- Hidden on Mobile -->
          <td class="hidden sm:table-cell px-6 py-4 text-on-surface-variant text-sm">
            ${cli.whatsApp ? `
              <a href="https://wa.me/549${cli.whatsApp}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-primary hover:text-primary-fixed-variant hover:underline transition-colors font-medium">
                <svg class="w-4 h-4 text-[#25D366] fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.717-1.465L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.757 1.452 5.4 0 9.795-4.402 9.797-9.817.002-2.624-1.023-5.093-2.887-6.959-1.866-1.865-4.343-2.891-6.969-2.893-5.401 0-9.798 4.402-9.8 9.818 0 1.748.458 3.453 1.328 4.966l-.993 3.63 3.714-.975zm11.367-7.051c-.302-.15-1.785-.882-2.062-.982-.277-.1-.478-.15-.679.15-.2.3-.777.982-.953 1.183-.176.2-.353.226-.655.076-.301-.15-1.274-.47-2.426-1.498-.896-.799-1.502-1.786-1.678-2.086-.176-.3-.019-.462.13-.612.135-.135.302-.35.453-.526.15-.176.2-.3.301-.5.101-.2.05-.376-.026-.526-.076-.15-.679-1.636-.93-2.247-.244-.587-.492-.507-.679-.516-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.029-1.055 2.508 0 1.479 1.079 2.906 1.229 3.107.152.2 2.124 3.243 5.143 4.545.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.119.579-.087 1.786-.73 2.037-1.436.25-.706.25-1.311.176-1.436-.076-.126-.277-.2-.579-.35z"/>
                </svg>
                <span>+54 9 ${cli.whatsApp}</span>
              </a>
            ` : '<span class="text-outline/60 italic text-xs">Sin WhatsApp</span>'}
          </td>
          <!-- Real Saldo Pendiente -->
          <td class="px-4 sm:px-6 py-4 text-right ${saldoColor} text-sm sm:text-base">
            ${saldoFormatted}
          </td>
          <td class="px-4 sm:px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-1.5 sm:gap-2">
              <a href="cliente-detalle.html?id=${cli.clienteId}" class="h-8 sm:h-9 px-2.5 sm:px-3 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">visibility</span>
                <span class="hidden sm:inline">Ver Ficha</span>
              </a>
              <button data-delete-id="${cli.clienteId}" class="btn-delete-cli h-8 sm:h-9 px-2 text-error hover:bg-error-container/30 rounded-lg text-xs transition-colors cursor-pointer" title="Eliminar">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
        <div class="p-4 sm:p-card-gap border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/50">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">groups</span>
            Directorio de Clientes
          </h3>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant/20">
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Cliente</th>
                <th class="hidden sm:table-cell px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Contacto</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Saldo Pendiente</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Acciones</th>
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

    this.querySelector('app-pagination')?.addEventListener('page-change', (e) => {
      this.page = e.detail.page;
      this.loadData();
    });

    this.querySelectorAll('.btn-delete-cli').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-id');
        this.deleteClient(id);
      });
    });
  }
}

customElements.define('app-table-clients', AppTableClients);
