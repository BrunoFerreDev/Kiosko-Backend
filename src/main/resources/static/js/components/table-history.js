import { AnotadosService, PagosService, ClientesService, AnotadosComboService, AnotadosMenuService } from '../services/api.js';

class AppTableHistory extends HTMLElement {
  connectedCallback() {
    this.movements = [];
    this.selectedItemIds = new Set();
    this.clientInfo = null;
    this.totalDebt = 0;
    this.loading = true;
    this.page = 0;
    this.size = 15;
    this.totalPages = 1;
    this.totalElements = 0;
    this.sortFilter = 'fecha,desc';

    // Listen for payment or annotation creation to refresh history
    document.addEventListener('payment-created', () => this.loadData());
    document.addEventListener('annotation-created', () => this.loadData());
    document.addEventListener('client-created', () => this.loadData());
    document.addEventListener('client-updated', () => this.loadData());

    this.renderSkeleton();
    this.loadData();
  }

  getClienteId() {
    const attrId = this.getAttribute('cliente-id');
    if (attrId) return attrId;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  renderSkeleton() {
    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden relative">
        <div class="px-6 py-4 border-b border-outline-variant/30 bg-surface/50 flex justify-between items-center">
          <h3 class="font-headline-sm text-headline-sm text-on-background font-bold">Historial de Movimientos</h3>
        </div>
        <app-loader active="true" message="Cargando anotaciones del cliente..."></app-loader>
      </div>
    `;
  }

  async loadData() {
    this.loading = true;
    this.selectedItemIds.clear();
    const clienteId = this.getClienteId();

    try {
      let rawAnotados = [];
      let rawCombos = [];
      let rawMenus = [];
      let totalElements = 0;
      let totalPages = 1;

      if (clienteId) {
        // Fetch all three lists for the client
        const [respProds, respCombos, respMenus] = await Promise.all([
          AnotadosService.getByCliente(clienteId, this.page, this.size, this.sortFilter || 'fecha,desc').catch(() => ({ content: [] })),
          AnotadosComboService.getByCliente(clienteId, 0, 100).catch(() => ({ content: [] })),
          AnotadosMenuService.getByCliente(clienteId, 0, 100).catch(() => ({ content: [] }))
        ]);

        if (respProds && respProds.content) {
          rawAnotados = respProds.content;
          totalElements = respProds.totalElements || rawAnotados.length;
          totalPages = respProds.totalPages || 1;
        } else {
          rawAnotados = Array.isArray(respProds) ? respProds : [];
          totalElements = rawAnotados.length;
          totalPages = 1;
        }

        rawCombos = respCombos && respCombos.content ? respCombos.content : (Array.isArray(respCombos) ? respCombos : []);
        rawMenus = respMenus && respMenus.content ? respMenus.content : (Array.isArray(respMenus) ? respMenus : []);

        try {
          this.clientInfo = await ClientesService.getById(clienteId);
        } catch (e) {
          if (rawAnotados.length > 0 && rawAnotados[0].cliente) {
            this.clientInfo = rawAnotados[0].cliente;
          }
        }
      } else {
        // Global history
        const [respProds, respCombos, respMenus] = await Promise.all([
          AnotadosService.getPaged(this.page, this.size).catch(() => ({ content: [] })),
          AnotadosComboService.getPaged(this.page, this.size).catch(() => ({ content: [] })),
          AnotadosMenuService.getPaged(this.page, this.size).catch(() => ({ content: [] }))
        ]);

        if (respProds && respProds.content) {
          rawAnotados = respProds.content;
          totalElements = respProds.totalElements || rawAnotados.length;
          totalPages = respProds.totalPages || 1;
        } else {
          rawAnotados = Array.isArray(respProds) ? respProds : [];
          totalElements = rawAnotados.length;
          totalPages = 1;
        }

        rawCombos = respCombos && respCombos.content ? respCombos.content : (Array.isArray(respCombos) ? respCombos : []);
        rawMenus = respMenus && respMenus.content ? respMenus.content : (Array.isArray(respMenus) ? respMenus : []);
      }

      const pagosResp = await PagosService.getAll().catch(() => []);

      const formattedAnotados = rawAnotados.map(a => {
        const prodName = a.producto?.nombre || 'Producto';
        const brandObj = a.producto?.marca;
        const brandName = brandObj ? (typeof brandObj === 'object' ? brandObj.nombre : brandObj) : '';
        const brand = brandName ? ` (${brandName})` : '';
        const unitPrice = a.precioUnitario || a.producto?.precioVenta || 0;
        const qty = a.cantidad || 1;
        const totalLine = unitPrice * qty;

        const catObj = a.producto?.categoria;
        const catName = catObj ? (typeof catObj === 'object' ? catObj.nombre : catObj) : 'General';

        return {
          type: 'anotado',
          id: a.anotadoId,
          uniqueId: `product-${a.anotadoId}`,
          date: a.fechaAnotado || new Date().toISOString(),
          desc: `${prodName}${brand} x${qty}`,
          sub: `Cat: ${catName} | Estado: ${a.estado || 'PENDIENTE'}`,
          monto: totalLine,
          isPago: false,
          rawItem: a
        };
      });

      const formattedCombos = rawCombos.map(ac => {
        const comboName = ac.combo?.nombre || 'Combo';
        const unitPrice = ac.precioUnitario || ac.combo?.precio || 0;
        const qty = ac.cantidad || 1;
        const totalLine = unitPrice * qty;

        return {
          type: 'combo',
          id: ac.anotadoComboId,
          uniqueId: `combo-${ac.anotadoComboId}`,
          date: ac.fechaAnotado || new Date().toISOString(),
          desc: `[Combo] ${comboName} x${qty}`,
          sub: `Combo Especial | Estado: ${ac.estado || 'PENDIENTE'}`,
          monto: totalLine,
          isPago: false,
          rawItem: ac
        };
      });

      const formattedMenus = rawMenus.map(am => {
        const menuName = am.menuDiario?.nombre || 'Menú';
        const unitPrice = am.precioUnitario || am.menuDiario?.precio || 0;
        const qty = am.cantidad || 1;
        const totalLine = unitPrice * qty;

        return {
          type: 'menu',
          id: am.anotadoMenuId,
          uniqueId: `menu-${am.anotadoMenuId}`,
          date: am.fechaAnotado || new Date().toISOString(),
          desc: `[Menú] ${menuName} x${qty}`,
          sub: `Menú Diario | Estado: ${am.estado || 'PENDIENTE'}`,
          monto: totalLine,
          isPago: false,
          rawItem: am
        };
      });

      // Sum all pending outstanding items for this client to get actual debt total
      const debtProds = formattedAnotados.filter(a => a.rawItem?.estado === 'PENDIENTE').reduce((sum, a) => sum + a.monto, 0);
      const debtCombos = formattedCombos.filter(c => c.rawItem?.estado === 'PENDIENTE').reduce((sum, c) => sum + c.monto, 0);
      const debtMenus = formattedMenus.filter(m => m.rawItem?.estado === 'PENDIENTE').reduce((sum, m) => sum + m.monto, 0);
      this.totalDebt = debtProds + debtCombos + debtMenus;

      if (!this.clientInfo && rawAnotados.length > 0 && rawAnotados[0].cliente) {
        this.clientInfo = rawAnotados[0].cliente;
      }

      if (this.clientInfo) {
        this.updateDOMClientCard(this.clientInfo, this.totalDebt);
      }

      const filteredPagos = (Array.isArray(pagosResp) ? pagosResp : []).filter(p =>
        !clienteId || String(p.cliente?.clienteId || p.clienteId) === String(clienteId)
      );

      const formattedPagos = filteredPagos.map(p => ({
        type: 'pago',
        id: p.pagoId,
        uniqueId: `pago-${p.pagoId}`,
        date: p.fechaPago || new Date().toISOString(),
        desc: `Pago a cuenta (${p.metodoPago || 'EFECTIVO'})`,
        sub: `Comprobante Pago #${p.pagoId}`,
        monto: -(p.montoAbonado || 0),
        isPago: true,
        rawItem: p
      }));

      const combinedAnotados = [...formattedAnotados, ...formattedCombos, ...formattedMenus];

      const filteredPagosForPage = formattedPagos.filter(p => {
        if (combinedAnotados.length === 0) return true;

        const dates = combinedAnotados.map(a => new Date(a.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const pTime = new Date(p.date).getTime();

        const isNewestPage = this.page === 0;
        const isOldestPage = this.page === totalPages - 1;

        if (isNewestPage && pTime > maxDate) return true;
        if (isOldestPage && pTime < minDate) return true;

        return pTime >= minDate && pTime <= maxDate;
      });

      const allSortedAsc = [...combinedAnotados, ...filteredPagosForPage].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      let runningBalance = 0;
      allSortedAsc.forEach(m => {
        runningBalance += m.monto;
        m.saldoAcumulado = runningBalance;
      });

      if (this.sortFilter && this.sortFilter.startsWith('precio')) {
        const isDesc = this.sortFilter.endsWith('desc');
        this.movements = allSortedAsc.sort((a, b) => isDesc ? b.monto - a.monto : a.monto - b.monto);
      } else {
        const isDesc = !this.sortFilter || this.sortFilter.endsWith('desc');
        this.movements = allSortedAsc.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return isDesc ? dateB - dateA : dateA - dateB;
        });
      }

      this.totalElements = totalElements;
      this.totalPages = totalPages;

    } catch (err) {
      console.warn('API de anotados por cliente no disponible, usando datos de prueba:', err);
      const mockData = [
        {
          anotadoId: 1,
          cantidad: 3,
          cliente: { clienteId: 8, estado: true, nombreCompleto: "Sofia Sanchez", whatsApp: "112233447" },
          estado: "PENDIENTE",
          fechaAnotado: "2026-08-03T20:07:32.964",
          precioUnitario: 700,
          producto: { productoId: 1, nombre: "Alfajor Bon o Bon", marca: "Arcor", categoria: "Golosinas", precioCosto: 450, precioVenta: 700, stock: 30, estado: true }
        }
      ];

      this.clientInfo = mockData[0].cliente;
      this.totalDebt = 2100;
      this.updateDOMClientCard(this.clientInfo, this.totalDebt);

      this.movements = mockData.map(a => ({
        type: 'anotado',
        id: a.anotadoId,
        date: a.fechaAnotado,
        desc: `${a.producto.nombre} (${a.producto.marca}) x${a.cantidad}`,
        sub: `Cat: ${a.producto.categoria} | Estado: ${a.estado}`,
        monto: a.cantidad * a.precioUnitario,
        isPago: false,
        saldoAcumulado: a.cantidad * a.precioUnitario,
        rawItem: a
      }));

      this.totalElements = 1;
      this.totalPages = 1;
    } finally {
      this.loading = false;
      this.render();
    }
  }

  updateDOMClientCard(cli, debtTotal) {
    const nameEl = document.querySelector('#client-card-name');
    if (nameEl) nameEl.textContent = cli.nombreCompleto || 'Cliente';

    const phoneEl = document.querySelector('#client-card-phone');
    if (phoneEl) {
      if (cli.whatsApp) {
        phoneEl.innerHTML = `
          <a href="https://wa.me/549${cli.whatsApp}" target="_blank" rel="noopener noreferrer" class="hover:text-primary hover:underline transition-colors inline-flex items-center gap-1">
            <span>+54 9 ${cli.whatsApp}</span>
            <span class="material-symbols-outlined text-[14px] text-[#25D366]">open_in_new</span>
          </a>
        `;
      } else {
        phoneEl.textContent = 'Sin teléfono';
      }
    }

    const debtEl = document.querySelector('#client-card-debt');
    if (debtEl) debtEl.textContent = `$ ${debtTotal.toLocaleString('es-AR')}.00`;
  }

  getSelectedTotal() {
    let total = 0;
    this.movements.forEach(m => {
      if (m.type !== 'pago' && this.selectedItemIds.has(m.uniqueId)) {
        total += m.monto;
      }
    });
    return total;
  }

  render() {
    const clienteId = this.getClienteId();
    const selectedTotal = this.getSelectedTotal();

    let rowsHtml = '';
    if (this.movements.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="6" class="px-4 sm:px-6 py-12 text-center text-on-surface-variant">
            <div class="flex flex-col items-center justify-center gap-3 py-6">
              <span class="material-symbols-outlined text-5xl text-outline-variant/70 animate-pulse">history</span>
              <div>
                <p class="font-semibold text-on-surface text-base">Sin movimientos registrados</p>
                <p class="text-sm text-on-surface-variant mt-1">Este cliente no registra compras ni pagos en su cuenta todavía.</p>
              </div>
            </div>
          </td>
        </tr>
      `;
    } else {
      rowsHtml = this.movements.map(m => {
        const dateObj = new Date(m.date);
        const dateShort = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        const dateFull = dateObj.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });

        const isPendingAnotado = m.type !== 'pago' && m.rawItem?.estado === 'PENDIENTE';
        const isChecked = this.selectedItemIds.has(m.uniqueId);

        const amountColor = m.isPago ? 'text-primary font-bold' : 'text-error font-bold';
        const amountPrefix = m.isPago ? '-$' : '+$';
        const absAmount = Math.abs(m.monto).toLocaleString('es-AR');

        return `
          <tr class="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
            <td class="px-2 sm:px-4 py-3 sm:py-4 text-center">
              ${isPendingAnotado ? `
                <input type="checkbox" data-unique-id="${m.uniqueId}" ${isChecked ? 'checked' : ''} class="chk-select-item w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer" />
              ` : ''}
            </td>
            
            <td class="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-on-surface-variant font-medium text-xs">
              <span class="sm:hidden font-semibold">${dateShort}</span>
              <span class="hidden sm:inline">${dateFull}</span>
            </td>

            <td class="px-3 sm:px-6 py-3 sm:py-4">
              <div class="font-semibold text-on-surface text-xs sm:text-base">${m.desc}</div>
              <div class="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">${m.sub}</div>
            </td>

            <td class="px-3 sm:px-6 py-3 sm:py-4 text-right ${amountColor} text-xs sm:text-base whitespace-nowrap">
              ${amountPrefix} ${absAmount}
            </td>

            <td class="hidden sm:table-cell px-6 py-4 text-right font-bold text-on-surface text-sm sm:text-base">
              $ ${m.saldoAcumulado.toLocaleString('es-AR')}
            </td>

            <td class="px-2 sm:px-4 py-3 sm:py-4 text-right">
              ${isPendingAnotado ? `
                <button data-pay-amount="${m.monto}" data-unique-id="${m.uniqueId}" class="btn-pay-single-item h-8 px-2.5 sm:px-3 bg-primary-container text-white hover:bg-primary-fixed rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">payments</span>
                  <span class="hidden sm:inline">Pagar</span>
                </button>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('');
    }

    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        
        <!-- Header Toolbar -->
        <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-outline-variant/30 bg-surface/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 class="font-headline-sm text-base sm:text-headline-sm text-on-background font-bold">
            Historial de Movimientos ${this.clientInfo ? `(${this.clientInfo.nombreCompleto})` : ''}
          </h3>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            ${this.selectedItemIds.size > 0 ? `
              <button id="btn-pay-selected" class="h-9 px-3 sm:px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-1 text-xs">
                <span class="material-symbols-outlined text-sm">payments</span>
                <span>Pagar (${this.selectedItemIds.size} = $${selectedTotal.toLocaleString('es-AR')})</span>
              </button>
            ` : ''}

            <!-- Selector Ordenar Por -->
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-on-surface-variant text-sm hidden sm:inline">tune</span>
              <select id="select-sort-history" class="h-9 px-3 bg-surface border border-outline-variant/60 rounded-xl text-on-surface-variant text-xs font-semibold outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                <option value="fecha,desc" ${this.sortFilter === 'fecha,desc' ? 'selected' : ''}>Fecha (Reciente)</option>
                <option value="fecha,asc" ${this.sortFilter === 'fecha,asc' ? 'selected' : ''}>Fecha (Antiguo)</option>
                <option value="precio,desc" ${this.sortFilter === 'precio,desc' ? 'selected' : ''}>Precio (Mayor a Menor)</option>
                <option value="precio,asc" ${this.sortFilter === 'precio,asc' ? 'selected' : ''}>Precio (Menor a Mayor)</option>
              </select>
            </div>

            <button id="btn-refresh-history" class="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-surface-container cursor-pointer">
              <span class="material-symbols-outlined text-sm">refresh</span>
              <span class="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant/20 text-xs">
                <th class="px-2 sm:px-4 py-3 text-center w-8 sm:w-10">Pagar</th>
                <th class="px-2 sm:px-4 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Fecha</th>
                <th class="px-3 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase">Producto / Detalle</th>
                <th class="px-3 sm:px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Monto ($)</th>
                <th class="hidden sm:table-cell px-6 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Saldo Acumulado</th>
                <th class="px-2 sm:px-4 py-3 font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase text-right">Acción</th>
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

    // Handle checkboxes
    this.querySelectorAll('.chk-select-item').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const uniqueId = e.target.getAttribute('data-unique-id');
        if (e.target.checked) {
          this.selectedItemIds.add(uniqueId);
        } else {
          this.selectedItemIds.delete(uniqueId);
        }
        this.render();
      });
    });

    // Handle pay selected button
    this.querySelector('#btn-pay-selected')?.addEventListener('click', () => {
      const total = this.getSelectedTotal();
      const itemsToPay = this.movements.filter(m => m.type !== 'pago' && this.selectedItemIds.has(m.uniqueId));
      if (window.openPaymentModal) {
        window.openPaymentModal(clienteId, total, itemsToPay);
      }
    });

    // Handle single item pay button
    this.querySelectorAll('.btn-pay-single-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uniqueId = btn.getAttribute('data-unique-id');
        const movement = this.movements.find(m => m.uniqueId === uniqueId);
        const amount = parseFloat(btn.getAttribute('data-pay-amount')) || 0;
        if (window.openPaymentModal && movement) {
          window.openPaymentModal(clienteId, amount, [movement]);
        }
      });
    });

    this.querySelector('app-pagination')?.addEventListener('page-change', (e) => {
      this.page = e.detail.page;
      this.loadData();
    });

    this.querySelector('#btn-refresh-history')?.addEventListener('click', () => this.loadData());

    this.querySelector('#select-sort-history')?.addEventListener('change', (e) => {
      this.sortFilter = e.target.value;
      this.page = 0;
      this.loadData();
    });
  }
}

customElements.define('app-table-history', AppTableHistory);
