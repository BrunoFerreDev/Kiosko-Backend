// Main JS entry point for Kiosko-front
import './components/modal-login.js';
import './components/modal-upload.js';

console.log('Mi Kiosko - Web Components Initialized');

// Helper to open modals from anywhere in DOM
window.openLoginModal = () => {
  document.querySelector('app-modal-login')?.open();
};

window.openClientModal = () => {
  document.querySelector('app-modal-client')?.open();
};

window.openAnnotationModal = (clienteId = null) => {
  document.querySelector('app-modal-annotation')?.open(clienteId);
};

window.openProductModal = (productData = null) => {
  document.querySelector('app-modal-product')?.open(productData);
};

window.openUploadModal = () => {
  document.querySelector('app-modal-upload')?.open();
};

window.openBrandModal = () => {
  document.querySelector('app-modal-brand')?.open();
};

window.openCategoryModal = () => {
  document.querySelector('app-modal-category')?.open();
};

window.openPaymentModal = (clienteId = null, amount = 0) => {
  document.querySelector('app-modal-payment')?.open(clienteId, amount);
};

window.setTodayDate = () => {
  const dateElement = document.getElementById('date');
  if (dateElement) {
    const today = new Date();
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    dateElement.textContent = today.toLocaleDateString('es-ES', options);
  }
};

window.updateActionVisibility = () => {
  const isAdmin = window.KioskoAPI?.Auth?.isAdmin();
  document.querySelectorAll('.admin-only').forEach(el => {
    if (isAdmin) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
};

document.addEventListener('auth-change', () => {
  window.updateActionVisibility();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.updateActionVisibility();
  });
} else {
  setTimeout(() => {
    window.updateActionVisibility();
  }, 0);
}

setTodayDate();
