class AppPagination extends HTMLElement {
  static get observedAttributes() {
    return ['total-pages', 'current-page', 'total-elements', 'page-size'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const totalPages = parseInt(this.getAttribute('total-pages') || '1', 10);
    const currentPage = parseInt(this.getAttribute('current-page') || '0', 10);
    const totalElements = parseInt(this.getAttribute('total-elements') || '0', 10);
    const pageSize = 10; // Fixed size per user specification

    if (totalPages <= 1 && totalElements === 0) {
      this.innerHTML = '';
      return;
    }

    const startItem = totalElements === 0 ? 0 : (currentPage * pageSize) + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    this.innerHTML = `
      <div class="px-4 sm:px-6 py-3 sm:py-4 bg-surface-container-low/60 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div class="font-data-table text-xs text-on-surface-variant font-medium">
          Mostrando <span class="font-bold text-on-surface">${startItem}</span> a <span class="font-bold text-on-surface">${endItem}</span> de <span class="font-bold text-on-surface">${totalElements}</span> resultados
        </div>

        <div class="flex items-center gap-2">
          <button 
            id="btn-prev-page" 
            ${currentPage <= 0 ? 'disabled' : ''} 
            class="h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer">
            <span class="material-symbols-outlined text-sm">chevron_left</span>
            Anterior
          </button>

          <span class="px-3 text-xs font-bold text-on-surface bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
            ${currentPage + 1} / ${Math.max(totalPages, 1)}
          </span>

          <button 
            id="btn-next-page" 
            ${currentPage >= totalPages - 1 ? 'disabled' : ''} 
            class="h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer">
            Siguiente
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    `;

    this.querySelector('#btn-prev-page')?.addEventListener('click', () => {
      if (currentPage > 0) {
        this.scrollToTop();
        this.dispatchEvent(new CustomEvent('page-change', {
          detail: { page: currentPage - 1 },
          bubbles: true
        }));
      }
    });

    this.querySelector('#btn-next-page')?.addEventListener('click', () => {
      if (currentPage < totalPages - 1) {
        this.scrollToTop();
        this.dispatchEvent(new CustomEvent('page-change', {
          detail: { page: currentPage + 1 },
          bubbles: true
        }));
      }
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainCanvas = document.querySelector('main > div, main');
    if (mainCanvas) {
      mainCanvas.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

customElements.define('app-pagination', AppPagination);
