class AppLoader extends HTMLElement {
  static get observedAttributes() {
    return ['active', 'message'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const active = this.getAttribute('active') === 'true';
    const message = this.getAttribute('message') || 'Cargando...';

    if (!active) {
      this.innerHTML = '';
      this.classList.add('hidden');
      return;
    }

    this.classList.remove('hidden');
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8 gap-3 text-primary">
        <div class="w-8 h-8 border-4 border-primary-container border-t-primary rounded-full animate-spin"></div>
        <p class="font-data-table text-data-table text-on-surface-variant font-medium animate-pulse">${message}</p>
      </div>
    `;
  }
}

customElements.define('app-loader', AppLoader);
