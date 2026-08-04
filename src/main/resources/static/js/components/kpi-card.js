class AppKpiCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'value', 'prefix', 'suffix', 'tag', 'icon', 'trend', 'trend-type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.innerHTML) {
      this.connectedCallback();
    }
  }

  connectedCallback() {
    const title = this.getAttribute('title') || '';
    const value = this.getAttribute('value') || '0';
    const prefix = this.getAttribute('prefix') || '';
    const suffix = this.getAttribute('suffix') || '';
    const tag = this.getAttribute('tag') || '';
    const icon = this.getAttribute('icon') || 'equalizer';
    const trend = this.getAttribute('trend') || '';
    const trendType = this.getAttribute('trend-type') || 'neutral'; // error, success, neutral

    let iconBg = 'bg-primary-container/30 text-primary';
    if (trendType === 'error') {
      iconBg = 'bg-error-container/50 text-error';
    } else if (trendType === 'warning') {
      iconBg = 'bg-secondary-container/30 text-secondary';
    }

    let trendHtml = '';
    if (trend) {
      let trendColor = 'text-on-surface-variant';
      let trendIcon = '';
      if (trendType === 'error') {
        trendColor = 'text-error';
        trendIcon = '<span class="material-symbols-outlined text-sm">trending_up</span>';
      } else if (trendType === 'success') {
        trendColor = 'text-primary';
        trendIcon = '<span class="material-symbols-outlined text-sm">trending_down</span>';
      }
      trendHtml = `<p class="font-body-md text-body-md ${trendColor} mt-1 flex items-center gap-1">${trendIcon} ${trend}</p>`;
    }

    this.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl p-card-gap shadow-sm border border-outline-variant/20 flex flex-col justify-between h-full">
        <div class="flex justify-between items-start mb-4">
          <div class="w-10 h-10 rounded-full ${iconBg} flex items-center justify-center">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          ${tag ? `<span class="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">${tag}</span>` : ''}
        </div>
        <div>
          <p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">${title}</p>
          <h2 class="font-display-lg text-display-lg text-on-surface flex items-baseline gap-1">
            ${prefix ? `<span class="text-headline-md text-outline">${prefix}</span>` : ''}
            ${value}
            ${suffix ? `<span class="text-headline-sm text-outline">${suffix}</span>` : ''}
          </h2>
          ${trendHtml}
        </div>
      </div>
    `;
  }
}

customElements.define('app-kpi-card', AppKpiCard);
