const API_BASE_URL = '';
const DEFAULT_PAGE_SIZE = 10;

class ApiService {
  static async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 204) {
        return { success: true };
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error on [${config.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  }
}

// 1. Clientes Service
export const ClientesService = {
  getAll: () => ApiService.request('/clientes'),

  getPaged: (page = 0, size = DEFAULT_PAGE_SIZE, sort = '') => {
    const params = new URLSearchParams({ page, size: DEFAULT_PAGE_SIZE });
    if (sort) params.append('sort', sort);
    return ApiService.request(`/clientes?${params.toString()}`);
  },

  getById: (id) => ApiService.request(`/clientes/${id}`),

  create: (data) => ApiService.request('/clientes', {
    method: 'POST',
    body: {
      nombre: data.nombre || data.name || '',
      apellido: data.apellido || '',
      whatsApp: data.whatsApp || data.phone || '',
      estado: data.estado !== undefined ? data.estado : true,
      saldoPendiente: parseFloat(data.saldoPendiente || 0)
    }
  }),

  update: (id, data) => ApiService.request(`/clientes/${id}`, {
    method: 'PUT',
    body: {
      nombre: data.nombre || data.name || '',
      apellido: data.apellido || '',
      whatsApp: data.whatsApp || data.phone || '',
      estado: data.estado !== undefined ? data.estado : true,
      saldoPendiente: parseFloat(data.saldoPendiente || 0)
    }
  }),

  delete: (id) => ApiService.request(`/clientes/${id}`, { method: 'DELETE' })
};

// 2. Productos Service
export const ProductosService = {
  getAll: () => ApiService.request('/productos'),

  getPaged: (page = 0, size = DEFAULT_PAGE_SIZE, sort = '') => {
    const params = new URLSearchParams({ page, size: DEFAULT_PAGE_SIZE });
    if (sort) params.append('sort', sort);
    return ApiService.request(`/productos?${params.toString()}`);
  },

  search: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.marca) params.append('marca', filters.marca);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.precioMin) params.append('precioMin', filters.precioMin);
    if (filters.precioMax) params.append('precioMax', filters.precioMax);
    params.append('page', filters.page !== undefined ? filters.page : 0);
    params.append('size', filters.size || DEFAULT_PAGE_SIZE);
    if (filters.sort) {
      if (Array.isArray(filters.sort)) {
        filters.sort.forEach(s => params.append('sort', s));
      } else {
        params.append('sort', filters.sort);
      }
    }
    return ApiService.request(`/productos/buscar?${params.toString()}`);
  },

  getCategorias: () => ApiService.request('/productos/categorias'),

  getMarcas: () => ApiService.request('/productos/marcas'),

  getById: (id) => ApiService.request(`/productos/${id}`),

  create: (data) => ApiService.request('/productos', {
    method: 'POST',
    body: {
      nombre: data.nombre || data.name || '',
      marca: data.marca || '',
      categoria: data.categoria || data.category || 'Otros',
      precioCosto: parseFloat(data.precioCosto || data.costPrice || 0),
      precioVenta: parseFloat(data.precioVenta || data.sellPrice || 0),
      stock: parseInt(data.stock || 0, 10),
      estado: data.estado !== undefined ? data.estado : true
    }
  }),

  update: (id, data) => ApiService.request(`/productos/${id}`, {
    method: 'PUT',
    body: {
      nombre: data.nombre || data.name || '',
      marca: data.marca || '',
      categoria: data.categoria || data.category || 'Otros',
      precioCosto: parseFloat(data.precioCosto || data.costPrice || 0),
      precioVenta: parseFloat(data.precioVenta || data.sellPrice || 0),
      stock: parseInt(data.stock || 0, 10),
      estado: data.estado !== undefined ? data.estado : true
    }
  }),

  delete: (id) => ApiService.request(`/productos/${id}`, { method: 'DELETE' })
};

// 3. Anotados Service
export const AnotadosService = {
  getAll: () => ApiService.request('/anotados'),

  getPaged: (page = 0, size = DEFAULT_PAGE_SIZE) => ApiService.request(`/anotados/paginado?page=${page}&size=${DEFAULT_PAGE_SIZE}`),

  getByCliente: (clienteId, page = 0, size = 15, sort = '') => {
    const params = new URLSearchParams({ page, size });
    if (sort) params.append('sort', sort);
    return ApiService.request(`/anotados/cliente/${clienteId}?${params.toString()}`);
  },

  getActividadReciente: (limite = 10) => ApiService.request(`/anotados/actividad-reciente?limite=${limite}`),

  getById: (id) => ApiService.request(`/anotados/${id}`),

  create: (data) => ApiService.request('/anotados', {
    method: 'POST',
    body: {
      cantidad: parseInt(data.cantidad || data.qty || 1, 10),
      precioUnitario: parseFloat(data.precioUnitario || data.price || 0),
      fechaAnotado: data.fechaAnotado || new Date().toISOString(),
      estado: data.estado || 'PENDIENTE',
      clienteId: parseInt(data.clienteId, 10),
      productoId: parseInt(data.productoId, 10)
    }
  }),

  update: (id, data) => ApiService.request(`/anotados/${id}`, {
    method: 'PUT',
    body: data
  }),

  delete: (id) => ApiService.request(`/anotados/${id}`, { method: 'DELETE' })
};

// 4. Pagos Service
export const PagosService = {
  getAll: () => ApiService.request('/pagos'),

  getById: (id) => ApiService.request(`/pagos/${id}`),

  create: (data) => ApiService.request('/pagos', {
    method: 'POST',
    body: {
      metodoPago: data.metodoPago || 'EFECTIVO',
      fechaPago: data.fechaPago || new Date().toISOString(),
      montoAbonado: parseFloat(data.montoAbonado || data.amount || 0),
      clienteId: parseInt(data.clienteId, 10)
    }
  }),

  update: (id, data) => ApiService.request(`/pagos/${id}`, {
    method: 'PUT',
    body: data
  }),

  delete: (id) => ApiService.request(`/pagos/${id}`, { method: 'DELETE' })
};

// Global export for non-module usage if needed
window.KioskoAPI = {
  Clientes: ClientesService,
  Productos: ProductosService,
  Anotados: AnotadosService,
  Pagos: PagosService
};
