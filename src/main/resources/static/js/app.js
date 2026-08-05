// Main JS entry point for Kiosko-front
console.log('Mi Kiosko - Web Components Initialized');

// Helper to open modals from anywhere in DOM
window.openClientModal = () => {
  document.querySelector('app-modal-client')?.open();
};

window.openAnnotationModal = (clienteId = null) => {
  document.querySelector('app-modal-annotation')?.open(clienteId);
};

window.openProductModal = (productData = null) => {
  document.querySelector('app-modal-product')?.open(productData);
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

setTodayDate();
