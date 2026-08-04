class AppListDebtors extends HTMLElement {
  connectedCallback() {
    const isSubfolder = window.location.pathname.includes('/pages/');
    const clientesPath = isSubfolder ? './clientes.html' : 'pages/clientes.html';

    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col overflow-hidden">
        <div class="p-card-gap border-b border-outline-variant/30 flex justify-between items-center bg-surface/50">
          <h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-bold">
            <span class="material-symbols-outlined text-error">warning</span>
            Mayor Deuda
          </h3>
        </div>
        <div class="p-card-gap flex flex-col gap-4 overflow-auto">
          <!-- Debtor Item -->
          <div class="flex justify-between items-center p-3 rounded-lg bg-error-container/20 border border-error-container/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface text-on-surface flex items-center justify-center font-bold">FP</div>
              <div>
                <p class="font-data-table text-data-table font-semibold text-on-surface">Familia Perez</p>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Hace 15 días</p>
              </div>
            </div>
            <span class="font-headline-sm text-headline-sm text-error font-bold">$3,450</span>
          </div>
          <!-- Debtor Item -->
          <div class="flex justify-between items-center p-3 rounded-lg hover:bg-surface-container-low transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold">LT</div>
              <div>
                <p class="font-data-table text-data-table font-semibold text-on-surface">Luis Torres</p>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Hace 8 días</p>
              </div>
            </div>
            <span class="font-data-table text-data-table text-on-surface font-semibold">$1,200</span>
          </div>
          <!-- Debtor Item -->
          <div class="flex justify-between items-center p-3 rounded-lg hover:bg-surface-container-low transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold">RG</div>
              <div>
                <p class="font-data-table text-data-table font-semibold text-on-surface">Rosa Garcia</p>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Hace 3 días</p>
              </div>
            </div>
            <span class="font-data-table text-data-table text-on-surface font-semibold">$890</span>
          </div>
          <a href="${clientesPath}" class="mt-2 w-full h-10 rounded-lg border border-outline-variant text-on-surface font-data-table text-data-table hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 font-semibold">
            <span class="material-symbols-outlined text-sm">visibility</span>
            Ver reporte completo
          </a>
        </div>
      </div>
    `;
  }
}

customElements.define('app-list-debtors', AppListDebtors);
