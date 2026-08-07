class AppSidebar extends HTMLElement {
  connectedCallback() {
    const activeTab = this.getAttribute('active') || 'dashboard';
    const isSubfolder = window.location.pathname.includes('/pages/');

    const basePath = isSubfolder ? '../' : './';
    const pagesPath = isSubfolder ? './' : './pages/';

    const isAuthenticated = !!localStorage.getItem('jwt');
    const links = [];
    if (isAuthenticated) {
      links.push({ id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: `${basePath}index.html` });
      links.push({ id: 'clients', label: 'Clientes', icon: 'people', href: `${pagesPath}clientes.html` });
    }
    links.push(
      { id: 'products', label: 'Productos', icon: 'inventory_2', href: `${pagesPath}productos.html` },
      { id: 'comidas', label: 'Comidas Caseras', icon: 'restaurant_menu', href: `${pagesPath}comidas-caseras.html` }
    );

    const navLinksHtml = links.map(link => {
      const isActive = link.id === activeTab;
      const activeClasses = isActive
        ? 'text-primary bg-primary-fixed font-bold'
        : 'text-on-surface-variant hover:bg-surface-container-high font-medium';
      const fillClass = isActive ? 'fill' : '';

      return `
        <a href="${link.href}" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 active:scale-95 ${activeClasses}">
          <span class="material-symbols-outlined ${fillClass}">${link.icon}</span>
          <span class="font-data-table text-data-table">${link.label}</span>
        </a>
      `;
    }).join('');

    this.innerHTML = `
      <!-- Mobile Backdrop Overlay -->
      <div id="sidebar-backdrop" class="fixed inset-0 bg-on-background/40 backdrop-blur-sm z-40 hidden md:hidden transition-opacity duration-200"></div>

      <!-- Navigation Drawer Container -->
      <nav id="sidebar-drawer" class="bg-surface-container-low shadow-sm h-full w-64 fixed left-0 top-0 flex flex-col py-gutter px-4 z-50 transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-in-out border-r border-outline-variant/20">
        <!-- Brand Logo & Close Button Container -->
        <div class="relative w-full flex items-center justify-center mb-6 mt-2 shrink-0">
          <img src="${basePath}css/pipitos.webp" alt="Los Pipitos" class="max-h-24 w-auto object-contain" />
          <button id="btn-close-sidebar" class="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant cursor-pointer absolute right-0 top-0">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Primary Actions -->
        <div id="sidebar-primary-actions" class="flex flex-col gap-2 mb-6">
          <button id="btn-sidebar-annotation" class="w-full flex items-center justify-center gap-2 h-touch-target-min bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
            <span class="material-symbols-outlined">edit_document</span>
            <span class="font-data-table text-data-table font-semibold">Nueva Anotación</span>
          </button>

          <button id="btn-sidebar-client" class="w-full flex items-center justify-center gap-2 h-touch-target-min bg-surface-container-highest text-primary rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer">
            <span class="material-symbols-outlined">person_add</span>
            <span class="font-data-table text-data-table font-semibold">Nuevo Cliente</span>
          </button>
        </div>

        <!-- Navigation Links -->
        <div class="flex flex-col gap-1 flex-1 overflow-y-auto">
          ${navLinksHtml}
        </div>

        <!-- Footer Links -->
        <div id="sidebar-footer-auth" class="flex flex-col gap-1 mt-auto pt-4 border-t border-outline-variant/30">
        </div>
      </nav>
    `;

    this.backdrop = this.querySelector('#sidebar-backdrop');
    this.drawer = this.querySelector('#sidebar-drawer');

    this.backdrop?.addEventListener('click', () => this.closeMobile());
    this.querySelector('#btn-close-sidebar')?.addEventListener('click', () => this.closeMobile());

    // Prevent reloading when clicking the link for the current active page
    const normalizePath = (path) => {
      let p = path.replace(/^\/|\/$/g, '');
      return p === 'index.html' ? '' : p;
    };

    const navLinks = this.querySelectorAll('#sidebar-drawer div.overflow-y-auto a');
    navLinks.forEach(anchor => {
      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentPath = normalizePath(window.location.pathname);
        const targetPath = normalizePath(targetUrl.pathname);

        if (currentPath === targetPath) {
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeMobile();
          });
        }
      } catch (err) {
        // Ignore parsing errors
      }
    });

    this.querySelector('#btn-sidebar-annotation')?.addEventListener('click', () => {
      this.closeMobile();
      document.querySelector('app-modal-annotation')?.open();
    });

    this.querySelector('#btn-sidebar-client')?.addEventListener('click', () => {
      this.closeMobile();
      document.querySelector('app-modal-client')?.open();
    });

    document.addEventListener('toggle-mobile-sidebar', () => this.toggleMobile());

    this.updateAuthFooter();
    this.authListener = () => this.updateAuthFooter();
    document.addEventListener('auth-change', this.authListener);
  }

  disconnectedCallback() {
    if (this.authListener) {
      document.removeEventListener('auth-change', this.authListener);
    }
  }

  updateAuthFooter() {
    const footer = this.querySelector('#sidebar-footer-auth');
    if (!footer) return;

    // Show/hide primary actions based on admin status
    const primaryActions = this.querySelector('#sidebar-primary-actions');
    const isAdmin = window.KioskoAPI?.Auth?.isAdmin();
    if (primaryActions) {
      if (isAdmin) {
        primaryActions.classList.remove('hidden');
      } else {
        primaryActions.classList.add('hidden');
      }
    }

    const jwt = localStorage.getItem('jwt');
    const nombre = localStorage.getItem('nombre') || '';
    const apellido = localStorage.getItem('apellido') || '';
    const fullName = `${nombre} ${apellido}`.trim() || 'Usuario';

    if (jwt) {
      footer.innerHTML = `
        <div class="px-4 py-1.5 text-xs text-on-surface-variant/70 font-semibold truncate flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>Sesión: ${fullName}</span>
        </div>
        <button id="btn-auth-logout" class="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 rounded-lg transition-colors font-medium cursor-pointer text-left">
          <span class="material-symbols-outlined">logout</span>
          <span class="font-data-table text-data-table">Cerrar Sesión</span>
        </button>
      `;
      footer.querySelector('#btn-auth-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.KioskoAPI.Auth.logout();
      });
    } else {
      footer.innerHTML = `
        <button id="btn-auth-login" class="w-full flex items-center gap-3 px-4 py-3 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium cursor-pointer text-left">
          <span class="material-symbols-outlined">login</span>
          <span class="font-data-table text-data-table">Iniciar Sesión</span>
        </button>
      `;
      footer.querySelector('#btn-auth-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMobile();
        document.querySelector('app-modal-login')?.open();
      });
    }
  }

  toggleMobile() {
    if (this.drawer?.classList.contains('-translate-x-full')) {
      this.openMobile();
    } else {
      this.closeMobile();
    }
  }

  openMobile() {
    this.backdrop?.classList.remove('hidden');
    this.drawer?.classList.remove('-translate-x-full');
  }

  closeMobile() {
    this.backdrop?.classList.add('hidden');
    this.drawer?.classList.add('-translate-x-full');
  }
}

customElements.define('app-sidebar', AppSidebar);
