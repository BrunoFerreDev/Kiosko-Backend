import { AnotadosService, ClientesService } from '../services/api.js';

class AppTableActivity extends HTMLElement {
  connectedCallback() {
    this.activities = [];
    this.loading = true;
    // Listen for annotation or payment changes to refresh dashboard activity
    document.addEventListener('annotation-created', () => this.loadData());
    document.addEventListener('payment-created', () => this.loadData());
    document.addEventListener('client-created', () => this.loadData());
    document.addEventListener('client-updated', () => this.loadData());
    document.addEventListener('product-created', () => this.loadData());
    document.addEventListener('product-updated', () => this.loadData());

    this.renderSkeleton();
    this.loadData();
  }

  renderSkeleton() {
    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col relative">
        <div class="p-4 sm:p-card-gap border-b border-outline-variant/30 flex justify-between items-center bg-surface/50">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Actividad Reciente</h3>
        </div>
        <app-loader active="true" message="Cargando actividad reciente..."></app-loader>
      </div>
    `;
  }

  async loadData() {
    this.loading = true;
    try {
      const response = await AnotadosService.getPaged(0, 10);
      let rawList = [];
      if (response && response.content) {
        rawList = response.content;
      } else if (Array.isArray(response)) {
        rawList = response;
      }

      this.activities = rawList.map(a => ({
        id: a.anotadoId,
        date: a.fechaAnotado || new Date().toISOString(),
        client: a.cliente?.nombreCompleto || `Cliente #${a.clienteId || '1'}`,
        clientId: a.cliente?.clienteId || a.clienteId || 1,
        detail: `${a.producto?.nombre || 'Producto'} (x${a.cantidad})`,
        amount: (a.precioUnitario || a.producto?.precioVenta || 0) * (a.cantidad || 1),
        status: a.estado || 'PENDIENTE'
      }));

      // Calculate Dashboard KPI stats
      this.updateDashboardStats(this.activities.length);

    } catch (err) {
      console.warn('API de anotados no disponible, usando datos de actividad fallback:', err);
      this.activities = [
        { id: 1, date: '2026-08-03T10:30:00', client: 'Maria Rodriguez', clientId: 3, detail: 'Coca Cola 2.25L (x2)', amount: 2800, status: 'PENDIENTE' },
        { id: 2, date: '2026-08-03T09:15:00', client: 'Juan Pérez', clientId: 1, detail: 'Pago a cuenta', amount: 1500, status: 'COMPLETADO' },
        { id: 3, date: '2026-08-02T18:40:00', client: 'Familia Pérez', clientId: 2, detail: 'Leche Entera 1L (x3)', amount: 1350, status: 'PENDIENTE' }
      ];
      this.updateDashboardStats(3);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async updateDashboardStats(todayCount) {
    try {
      const clientsResp = await ClientesService.getAll();
      const clientList = Array.isArray(clientsResp) ? clientsResp : (clientsResp.content || []);

      const totalDebt = clientList.reduce((sum, c) => sum + (parseFloat(c.saldoPendiente) || 0), 0);
      const debtorsCount = clientList.filter(c => (parseFloat(c.saldoPendiente) || 0) > 0).length;

      const cardDebt = document.querySelector('#dash-kpi-total-debt');
      if (cardDebt) cardDebt.setAttribute('value', totalDebt.toLocaleString('es-AR'));

      const cardDebtors = document.querySelector('#dash-kpi-debtors-count');
      if (cardDebtors) cardDebtors.setAttribute('value', String(debtorsCount));

      const cardToday = document.querySelector('#dash-kpi-today-count');
      if (cardToday) cardToday.setAttribute('value', String(todayCount));
    } catch (e) {
      console.warn('Error actualizando estadísticas del dashboard:', e);
    }
  }

  render() {
    const rowsHtml = this.activities.map(act => {
      const dateObj = new Date(act.date);
      const dateShort = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
      const dateFull = dateObj.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });

      return `
        <tr class="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
          <td class="px-4 sm:px-6 py-4">
            <a href="pages/cliente-detalle.html?id=${act.clientId}" class="font-semibold text-on-surface hover:text-primary transition-colors text-sm sm:text-base">${act.client}</a>
          </td>
          <td class="px-4 sm:px-6 py-4 text-on-surface-variant text-xs sm:text-sm">${act.detail}</td>
          <td class="px-4 sm:px-6 py-4 text-right font-bold ${act.status === 'COMPLETADO' ? 'text-primary' : 'text-error'} text-sm sm:text-base">
            ${act.status === 'COMPLETADO' ? '-$' : '+$'} ${act.amount.toLocaleString('es-AR')}
          </td>
          <td class="px-4 sm:px-6 py-4 text-right whitespace-nowrap text-on-surface-variant text-xs">
            <span class="sm:hidden font-semibold">${dateShort}</span>
            <span class="hidden sm:inline">${dateFull}</span>
          </td>
        </tr>
      `;
    }).join('');

    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
        <div class="p-4 sm:p-card-gap border-b border-outline-variant/30 flex justify-between items-center bg-surface/50">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">schedule</span>
            Actividad Reciente
          </h3>
          <a href="pages/clientes.html" class="text-xs sm:text-sm font-semibold text-primary hover:text-primary-fixed-variant transition-colors">Ver Todo</a>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant/20 text-xs">
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Cliente</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Detalle</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Monto</th>
                <th class="px-4 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Fecha</th>
              </tr>
            </thead>
            <tbody class="font-data-table text-data-table text-on-surface">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

customElements.define('app-table-activity', AppTableActivity);
