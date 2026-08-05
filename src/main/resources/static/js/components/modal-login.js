import { AuthService } from '../services/api.js';

class AppModalLogin extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="modal-login-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop bg-on-background/40 backdrop-blur-sm transition-opacity duration-200">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200 relative">
          
          <!-- Decorative Top Accent -->
          <div class="h-2 bg-gradient-to-r from-primary via-secondary to-tertiary"></div>

          <!-- Modal Header -->
          <div class="px-6 pt-6 pb-4 flex justify-between items-start">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">lock_open</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Iniciar Sesión</h3>
                <p class="text-xs text-on-surface-variant font-medium">Ingresa tus credenciales para continuar</p>
              </div>
            </div>
            <button id="btn-close-login" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form id="form-login" class="p-6 pt-2 flex flex-col gap-4">
            
            <!-- Error Alert -->
            <div id="login-error-alert" class="hidden bg-error-container text-on-error-container p-3 rounded-xl border border-error-container flex items-start gap-2.5 text-sm">
              <span class="material-symbols-outlined text-base mt-0.5 text-error">error</span>
              <span id="login-error-message">Credenciales incorrectas.</span>
            </div>

            <!-- WhatsApp field -->
            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold text-xs">Teléfono / WhatsApp</label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-3.5 text-outline text-lg">call</span>
                <input type="tel" name="whatsapp" required placeholder="Ej: 1122334455" class="w-full h-11 pl-11 pr-4 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
              </div>
            </div>

            <!-- Password field -->
            <div>
              <label class="block font-label-caps text-label-caps text-on-surface uppercase mb-1 font-semibold text-xs">Contraseña</label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-3.5 text-outline text-lg">lock</span>
                <input id="input-password" type="password" name="contrasenia" required placeholder="••••••••" class="w-full h-11 pl-11 pr-11 bg-surface text-on-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-body-md" />
                <button type="button" id="btn-toggle-password" class="absolute right-3 w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface cursor-pointer">
                  <span id="password-visibility-icon" class="material-symbols-outlined text-lg">visibility</span>
                </button>
              </div>
            </div>

            <!-- Modal Footer / Actions -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3 mt-2">
              <button type="button" id="btn-login-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" id="btn-submit-login" class="h-11 px-6 bg-primary text-on-primary rounded-xl font-data-table font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">login</span>
                <span id="btn-login-label">Entrar</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    this.backdrop = this.querySelector('#modal-login-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.form = this.querySelector('#form-login');
    this.submitBtn = this.querySelector('#btn-submit-login');
    this.submitLabel = this.querySelector('#btn-login-label');
    this.errorAlert = this.querySelector('#login-error-alert');
    this.errorMessage = this.querySelector('#login-error-message');

    // Close listeners
    this.querySelector('#btn-close-login')?.addEventListener('click', () => this.close());
    this.querySelector('#btn-login-cancel')?.addEventListener('click', () => this.close());

    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Password visibility toggle
    const passwordInput = this.querySelector('#input-password');
    const togglePasswordBtn = this.querySelector('#btn-toggle-password');
    const visibilityIcon = this.querySelector('#password-visibility-icon');

    togglePasswordBtn?.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        visibilityIcon.textContent = 'visibility_off';
      } else {
        passwordInput.type = 'password';
        visibilityIcon.textContent = 'visibility';
      }
    });

    // Submit handler
    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.errorAlert.classList.add('hidden');

      const formData = new FormData(this.form);
      const whatsapp = formData.get('whatsapp');
      const contrasenia = formData.get('contrasenia');

      this.setSubmitting(true);
      try {
        const response = await AuthService.login(whatsapp, contrasenia);
        
        if (response && response.status === false) {
          throw new Error(response.message || 'Credenciales incorrectas');
        }

        this.form.reset();
        this.close();
      } catch (err) {
        console.error('Login error:', err);
        this.errorMessage.textContent = err.message || 'Error al iniciar sesión.';
        this.errorAlert.classList.remove('hidden');
      } finally {
        this.setSubmitting(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.backdrop?.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  setSubmitting(isSubmitting) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
      this.submitLabel.textContent = 'Iniciando...';
      this.submitBtn.classList.add('opacity-75');
    } else {
      this.submitLabel.textContent = 'Entrar';
      this.submitBtn.classList.remove('opacity-75');
    }
  }

  open() {
    this.errorAlert.classList.add('hidden');
    this.backdrop?.classList.remove('hidden');
    setTimeout(() => {
      this.modalContent?.classList.remove('scale-95', 'opacity-0');
      this.modalContent?.classList.add('scale-100', 'opacity-100');
    }, 10);
  }

  close() {
    this.modalContent?.classList.remove('scale-100', 'opacity-100');
    this.modalContent?.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      this.backdrop?.classList.add('hidden');
    }, 150);
  }
}

customElements.define('app-modal-login', AppModalLogin);

// Dynamically auto-inject the modal into document body if not present when module is loaded
const injectModal = () => {
  if (!document.querySelector('app-modal-login')) {
    const modalElement = document.createElement('app-modal-login');
    document.body.appendChild(modalElement);
  }
};

if (document.body) {
  injectModal();
} else {
  document.addEventListener('DOMContentLoaded', injectModal);
}
