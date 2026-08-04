class AppTopbar extends HTMLElement {
  connectedCallback() {
    const placeholder = this.getAttribute('placeholder') || 'Buscar cliente o producto...';

    this.innerHTML = `
      <header class="bg-surface sticky top-0 z-30 flex justify-between items-center h-touch-target-min px-8 sm:px-container-padding shadow-sm gap-2">
        
        <!-- Mobile Hamburger Button -->
        <button id="btn-toggle-menu" aria-label="Abrir Menú" class="md:hidden w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-variant rounded-full transition-colors shrink-0 cursor-pointer">
          <span class="material-symbols-outlined">menu</span>
        </button>

        <!-- Search Bar -->
        <div class="flex-1 max-w-md">
          <div class="relative flex items-center h-full py-4">
            <span class="material-symbols-outlined absolute left-3 text-outline text-sm sm:text-base">search</span>
            <input 
              id="topbar-search-input"
              type="text" 
              class="w-full h-10 pl-9 sm:pl-10 pr-3 sm:pr-4 bg-surface-container-highest text-on-surface font-body-md text-xs sm:text-sm rounded-full border-none focus:ring-2 focus:ring-primary placeholder:text-outline outline-none transition-shadow"
              placeholder="${placeholder}"
            />
          </div>
        </div>

      </header>
    `;

    this.querySelector('#btn-toggle-menu')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
    });

    const searchInput = this.querySelector('#topbar-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.dispatchEvent(new CustomEvent('app-search', {
        detail: { query: e.target.value },
        bubbles: true
      }));
    });
  }
}

customElements.define('app-topbar', AppTopbar);
