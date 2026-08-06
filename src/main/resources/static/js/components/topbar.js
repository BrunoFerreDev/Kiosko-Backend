class AppTopbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="bg-surface sticky top-0 z-30 flex justify-between items-center h-14 px-4 border-b border-outline-variant/10 gap-2 md:hidden">
        <!-- Mobile Hamburger Button -->
        <button id="btn-toggle-menu" aria-label="Abrir Menú" class="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-variant rounded-full transition-colors shrink-0 cursor-pointer">
          <span class="material-symbols-outlined">menu</span>
        </button>

        <!-- Brand Title -->
        <div class="flex items-center gap-2">
          <span class="font-headline-md text-base font-bold text-primary">Los Pipitos</span>
        </div>

        <!-- Spacer to balance flex layout -->
        <div class="w-10 h-10"></div>
      </header>
    `;

    this.querySelector('#btn-toggle-menu')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
    });
  }
}

customElements.define('app-topbar', AppTopbar);
