import { ProductosService } from '../services/api.js';

class AppModalUpload extends HTMLElement {
  connectedCallback() {
    this.selectedFile = null;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div id="modal-upload-backdrop" class="fixed inset-0 z-50 flex items-center justify-center hidden modal-backdrop">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md mx-4 border border-outline-variant/30 overflow-hidden modal-content transform scale-95 opacity-0 transition-all duration-200 relative">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">upload_file</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Importar Excel</h3>
                <p class="font-label-caps text-label-caps text-on-surface-variant">Cargar inventario desde archivo XLSX</p>
              </div>
            </div>
            <button id="btn-close-modal" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 flex flex-col gap-4">
            <!-- Alert/Feedback Container -->
            <div id="upload-feedback" class="hidden p-4 rounded-xl text-sm border"></div>

            <!-- Drag and Drop Zone -->
            <div id="dropzone" class="border-2 border-dashed border-outline-variant/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <span class="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span>
              <div class="text-center">
                <p class="font-semibold text-on-surface">Arrastra tu archivo Excel aquí</p>
                <p class="text-sm text-on-surface-variant">o haz clic para buscar en tu dispositivo</p>
              </div>
              <p class="text-xs text-on-surface-variant">Solo formatos .xlsx o .xls</p>
              <input type="file" id="file-input" accept=".xlsx, .xls" class="hidden" />
            </div>

            <!-- Selected File Badge -->
            <div id="file-details" class="hidden border border-outline-variant/30 rounded-2xl p-4 bg-surface-container-low flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-2xl">description</span>
                </div>
                <div class="overflow-hidden">
                  <p id="file-name" class="font-semibold text-on-surface text-sm truncate max-w-[220px]"></p>
                  <p id="file-size" class="text-xs text-on-surface-variant"></p>
                </div>
              </div>
              <button type="button" id="btn-remove-file" class="w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error/10 transition-colors cursor-pointer" title="Remover archivo">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>

            <!-- Loading Spinner -->
            <div id="upload-loading" class="hidden flex flex-col items-center justify-center py-6 gap-3">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p class="text-sm font-semibold text-on-surface">Subiendo y procesando inventario...</p>
            </div>

            <!-- Modal Footer Buttons -->
            <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3 mt-2">
              <button type="button" id="btn-cancel" class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface font-data-table font-semibold hover:bg-surface-container-high transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="button" id="btn-submit" disabled class="h-11 px-6 bg-primary text-on-primary rounded-xl font-data-table font-semibold hover:bg-primary-fixed-variant transition-colors shadow-sm cursor-not-allowed opacity-50 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">cloud_upload</span>
                <span id="btn-submit-label">Subir Archivo</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // DOM References
    this.backdrop = this.querySelector('#modal-upload-backdrop');
    this.modalContent = this.querySelector('.modal-content');
    this.dropzone = this.querySelector('#dropzone');
    this.fileInput = this.querySelector('#file-input');
    this.fileDetails = this.querySelector('#file-details');
    this.fileNameEl = this.querySelector('#file-name');
    this.fileSizeEl = this.querySelector('#file-size');
    this.btnRemove = this.querySelector('#btn-remove-file');
    this.loadingEl = this.querySelector('#upload-loading');
    this.feedbackEl = this.querySelector('#upload-feedback');
    this.submitBtn = this.querySelector('#btn-submit');
    this.submitLabel = this.querySelector('#btn-submit-label');
    this.btnCancel = this.querySelector('#btn-cancel');
    this.btnClose = this.querySelector('#btn-close-modal');

    // Event Listeners
    this.btnClose?.addEventListener('click', () => this.close());
    this.btnCancel?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // File selection trigger
    this.dropzone?.addEventListener('click', () => this.fileInput?.click());

    this.fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileSelected(e.target.files[0]);
      }
    });

    // Drag and drop event listeners
    this.dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('border-primary', 'bg-primary/5');
    });

    this.dropzone?.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('border-primary', 'bg-primary/5');
    });

    this.dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('border-primary', 'bg-primary/5');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    // Remove file
    this.btnRemove?.addEventListener('click', () => {
      this.clearFile();
    });

    // Submit handler
    this.submitBtn?.addEventListener('click', async () => {
      if (!this.selectedFile) return;
      this.setLoadingState(true);
      try {
        const response = await ProductosService.uploadExcel(this.selectedFile);
        
        // Show success feedback
        const msg = response?.message || 'Archivo Excel procesado e importado con éxito.';
        this.showFeedback(msg, 'success');

        // Dispatch product-created event to reload product tables & stats
        this.dispatchEvent(new CustomEvent('product-created', { bubbles: true }));

        // Clear and close modal after 1.5s
        setTimeout(() => {
          this.close();
        }, 1500);
      } catch (err) {
        this.showFeedback(`Error al subir archivo: ${err.message}`, 'error');
        this.setLoadingState(false);
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.backdrop?.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  handleFileSelected(file) {
    // Validate extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      this.showFeedback('Formato inválido. Por favor selecciona un archivo de Excel (.xlsx, .xls).', 'error');
      this.clearFile();
      return;
    }

    this.selectedFile = file;
    
    // Hide feedback alert if showing
    this.feedbackEl.classList.add('hidden');

    // Update details UI
    if (this.fileNameEl) this.fileNameEl.textContent = file.name;
    if (this.fileSizeEl) this.fileSizeEl.textContent = this.formatBytes(file.size);

    // Toggle containers
    this.dropzone.classList.add('hidden');
    this.fileDetails.classList.remove('hidden');

    // Enable submit button
    this.submitBtn.disabled = false;
    this.submitBtn.classList.remove('cursor-not-allowed', 'opacity-50');
    this.submitBtn.classList.add('cursor-pointer');
  }

  clearFile() {
    this.selectedFile = null;
    if (this.fileInput) this.fileInput.value = '';
    this.fileDetails.classList.add('hidden');
    this.dropzone.classList.remove('hidden');
    
    this.submitBtn.disabled = true;
    this.submitBtn.classList.add('cursor-not-allowed', 'opacity-50');
    this.submitBtn.classList.remove('cursor-pointer');
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.dropzone.classList.add('hidden');
      this.fileDetails.classList.add('hidden');
      this.loadingEl.classList.remove('hidden');
      this.submitBtn.disabled = true;
      this.submitBtn.classList.add('opacity-75');
      this.submitLabel.textContent = 'Procesando...';
      this.btnCancel.disabled = true;
      this.btnCancel.classList.add('opacity-50', 'cursor-not-allowed');
      this.btnClose.disabled = true;
      this.btnClose.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      this.loadingEl.classList.add('hidden');
      if (this.selectedFile) {
        this.fileDetails.classList.remove('hidden');
      } else {
        this.dropzone.classList.remove('hidden');
      }
      this.submitBtn.disabled = !this.selectedFile;
      this.submitBtn.classList.remove('opacity-75');
      this.submitLabel.textContent = 'Subir Archivo';
      this.btnCancel.disabled = false;
      this.btnCancel.classList.remove('opacity-50', 'cursor-not-allowed');
      this.btnClose.disabled = false;
      this.btnClose.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  showFeedback(message, type) {
    if (!this.feedbackEl) return;
    this.feedbackEl.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-700', 'border-emerald-500/20', 'bg-error/10', 'text-error', 'border-error/20');
    
    this.feedbackEl.textContent = message;
    if (type === 'success') {
      this.feedbackEl.classList.add('bg-emerald-500/10', 'text-emerald-700', 'border-emerald-500/20');
    } else {
      this.feedbackEl.classList.add('bg-error/10', 'text-error', 'border-error/20');
    }
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  open() {
    this.clearFile();
    this.feedbackEl.classList.add('hidden');
    this.setLoadingState(false);

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

customElements.define('app-modal-upload', AppModalUpload);
