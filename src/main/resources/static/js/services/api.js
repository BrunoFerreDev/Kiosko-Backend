const DEFAULT_PAGE_SIZE = 10;
const API_BASE_URL = '';

class ApiService {
  static async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...options.headers,
    };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    const config = {
      headers,
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !isFormData) {
      config.body = JSON.stringify(config.body);
    }

    const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${API_BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return { success: true };
      }

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          localStorage.removeItem('jwt');
          localStorage.removeItem('nombre');
          localStorage.removeItem('apellido');
          localStorage.removeItem('isAdmin');
          window.dispatchEvent(new CustomEvent('auth-change'));
        }
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return { success: true, message: text };
        }
      }
    } catch (error) {
      console.error(`API Error on [${config.method || 'GET'}] ${url}:`, error);
      throw error;
    }
  }
}

// 1. Clientes Service
export const ClientesService = {
  getAll: () => ApiService.request(`${API_BASE_URL}/clientes`),

  getPaged: (page = 0, size = DEFAULT_PAGE_SIZE, sort = '') => {
    const params = new URLSearchParams({ page, size: DEFAULT_PAGE_SIZE });
    if (sort) params.append('sort', sort);
    return ApiService.request(`${API_BASE_URL}/clientes?${params.toString()}`);
  },

  getById: (id) => ApiService.request(`${API_BASE_URL}/clientes/${id}`),

  create: (data) => ApiService.request(`${API_BASE_URL}/clientes`, {
    method: 'POST',
    body: {
      nombre: data.nombre || data.name || '',
      apellido: data.apellido || '',
      whatsApp: data.whatsApp || data.phone || '',
      estado: data.estado !== undefined ? data.estado : true,
      saldoPendiente: parseFloat(data.saldoPendiente || 0)
    }
  }),

  update: (id, data) => ApiService.request(`${API_BASE_URL}/clientes/${id}`, {
    method: 'PUT',
    body: {
      nombre: data.nombre || data.name || '',
      apellido: data.apellido || '',
      whatsApp: data.whatsApp || data.phone || '',
      estado: data.estado !== undefined ? data.estado : true,
      saldoPendiente: parseFloat(data.saldoPendiente || 0)
    }
  }),

  delete: (id) => ApiService.request(`${API_BASE_URL}/clientes/${id}`, { method: 'DELETE' })
};

// 2. Productos Service
export const ProductosService = {
  getAll: () => ApiService.request(`${API_BASE_URL}/productos`),

  getPaged: (page = 0, size = DEFAULT_PAGE_SIZE, sort = '') => {
    const params = new URLSearchParams({ page, size: DEFAULT_PAGE_SIZE });
    if (sort) params.append('sort', sort);
    return ApiService.request(`${API_BASE_URL}/productos?${params.toString()}`);
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
    return ApiService.request(`${API_BASE_URL}/productos/buscar?${params.toString()}`);
  },

  getCategorias: () => ApiService.request(`${API_BASE_URL}/categorias`),

  getMarcas: () => ApiService.request(`${API_BASE_URL}/marcas`),

  createCategory: (data) => ApiService.request(`${API_BASE_URL}/categorias`, {
    method: 'POST',
    body: {
      id: null,
      codigo: data.codigo || '',
      nombre: data.nombre || '',
      descripcion: data.descripcion || ''
    }
  }),

  createBrand: (data) => ApiService.request(`${API_BASE_URL}/marcas`, {
    method: 'POST',
    body: {
      id: null,
      codigo: data.codigo || '',
      nombre: data.nombre || ''
    }
  }),

  getById: (id) => ApiService.request(`${API_BASE_URL}/productos/${id}`),

  create: (data) => ApiService.request(`${API_BASE_URL}/productos`, {
    method: 'POST',
    body: {
      nombre: data.nombre || data.name || '',
      marca: data.marca ? parseInt(data.marca, 10) : null,
      categoria: data.categoria ? parseInt(data.categoria, 10) : null,
      precioCosto: parseFloat(data.precioCosto || data.costPrice || 0),
      precioVenta: parseFloat(data.precioVenta || data.sellPrice || 0),
      stock: parseInt(data.stock || 0, 10),
      estado: data.estado !== undefined ? data.estado : true,
      unidadMedida: data.unidadMedida || 'unidad'
    }
  }),

  update: (id, data) => ApiService.request(`${API_BASE_URL}/productos/${id}`, {
    method: 'PUT',
    body: {
      nombre: data.nombre || data.name || '',
      marca: data.marca ? parseInt(data.marca, 10) : null,
      categoria: data.categoria ? parseInt(data.categoria, 10) : null,
      precioCosto: parseFloat(data.precioCosto || data.costPrice || 0),
      precioVenta: parseFloat(data.precioVenta || data.sellPrice || 0),
      stock: parseInt(data.stock || 0, 10),
      estado: data.estado !== undefined ? data.estado : true,
      unidadMedida: data.unidadMedida || 'unidad'
    }
  }),

  delete: (id) => ApiService.request(`${API_BASE_URL}/productos/${id}`, { method: 'DELETE' }),

  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return ApiService.request(`${API_BASE_URL}/productos/upload`, {
      method: 'POST',
      body: formData
    });
  },

  exportExcel: async () => {
    const headers = {};
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }
    const response = await fetch(`${API_BASE_URL}/productos/export`, {
      method: 'GET',
      headers
    });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.blob();
  }
};

// 3. Anotados Service
export const AnotadosService = {
  getAll: () => ApiService.request(`${API_BASE_URL}/anotados`),

  getPaged: (page = 0, size = DEFAULT_PAGE_SIZE) => ApiService.request(`${API_BASE_URL}/anotados?page=${page}&size=${size}`),

  getByCliente: (clienteId, page = 0, size = 15, sort = '') => {
    const params = new URLSearchParams({ page, size });
    if (sort) params.append('sort', sort);
    return ApiService.request(`${API_BASE_URL}/anotados/cliente/${clienteId}?${params.toString()}`);
  },

  getActividadReciente: (limite = 10) => ApiService.request(`${API_BASE_URL}/anotados/actividad-reciente?limite=${limite}`),

  getById: (id) => ApiService.request(`${API_BASE_URL}/anotados/${id}`),

  create: (data) => ApiService.request(`${API_BASE_URL}/anotados`, {
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

  update: (id, data) => ApiService.request(`${API_BASE_URL}/anotados/${id}`, {
    method: 'PUT',
    body: data
  }),

  delete: (id) => ApiService.request(`${API_BASE_URL}/anotados/${id}`, { method: 'DELETE' })
};

// 4. Pagos Service
export const PagosService = {
  getAll: () => ApiService.request(`${API_BASE_URL}/pagos`),

  getById: (id) => ApiService.request(`${API_BASE_URL}/pagos/${id}`),

  create: (data) => ApiService.request(`${API_BASE_URL}/pagos`, {
    method: 'POST',
    body: {
      metodoPago: data.metodoPago || 'EFECTIVO',
      fechaPago: data.fechaPago || new Date().toISOString(),
      montoAbonado: parseFloat(data.montoAbonado || data.amount || 0),
      clienteId: parseInt(data.clienteId, 10)
    }
  }),

  update: (id, data) => ApiService.request(`${API_BASE_URL}/pagos/${id}`, {
    method: 'PUT',
    body: data
  }),

  delete: (id) => ApiService.request(`${API_BASE_URL}/pagos/${id}`, { method: 'DELETE' })
};

// 5. Combos Service
export const CombosService = {
  getPaged: (params = {}) => {
    const urlParams = new URLSearchParams();
    urlParams.append('page', params.page !== undefined ? params.page : 0);
    urlParams.append('size', params.size || 9);
    return ApiService.request(`${API_BASE_URL}/combos?${urlParams.toString()}`);
  },

  getAll: () => ApiService.request(`${API_BASE_URL}/combos`), 

  getActivos: () => ApiService.request(`${API_BASE_URL}/combos/activos`),

  getById: (id) => ApiService.request(`${API_BASE_URL}/combos/${id}`),

  create: (data) => ApiService.request(`${API_BASE_URL}/combos`, {
    method: 'POST',
    body: data
  }),

  update: (id, data) => ApiService.request(`${API_BASE_URL}/combos/${id}`, {
    method: 'PUT',
    body: data
  }),

  delete: (id) => ApiService.request(`${API_BASE_URL}/combos/${id}`, { method: 'DELETE' })
};

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// 6. Auth Service
export const AuthService = {
  login: async (whatsapp, contrasenia) => {
    const response = await ApiService.request(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        whatsapp: whatsapp,
        contrasenia: contrasenia
      }
    });
    if (response && response.jwt) {
      localStorage.setItem('jwt', response.jwt);
      if (response.nombre) {
        localStorage.setItem('nombre', response.nombre);
      }
      if (response.apellido) {
        localStorage.setItem('apellido', response.apellido);
      }
      
      // Check if user is admin
      let isAdmin = false;
      const decoded = decodeJwt(response.jwt);
      if (
        (response.role && response.role.toUpperCase().includes('ADMIN')) ||
        (response.rol && response.rol.toUpperCase().includes('ADMIN')) ||
        response.admin === true ||
        response.isAdmin === true
      ) {
        isAdmin = true;
      } else if (decoded) {
        const roles = decoded.roles || decoded.role || decoded.authorities || decoded.authority || [];
        const rolesArr = Array.isArray(roles) ? roles : [roles];
        const scope = decoded.scope || decoded.scp || '';
        const scopeArr = typeof scope === 'string' ? scope.split(' ') : [];
        const allRoles = [...rolesArr, ...scopeArr];
        if (allRoles.some(r => typeof r === 'string' && r.toUpperCase().includes('ADMIN'))) {
          isAdmin = true;
        }
      }
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
      
      window.dispatchEvent(new CustomEvent('auth-change'));
    }
    window.location.reload();
    return response;
  },
  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    localStorage.removeItem('isAdmin');
    window.dispatchEvent(new CustomEvent('auth-change'));
    window.location.reload();
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('jwt');
  },
  getUsername: () => {
    const nombre = localStorage.getItem('nombre') || '';
    const apellido = localStorage.getItem('apellido') || '';
    return `${nombre} ${apellido}`.trim();
  },
  isAdmin: () => {
    if (!AuthService.isAuthenticated()) return false;
    
    let isAdminStr = localStorage.getItem('isAdmin');
    if (isAdminStr === null) {
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        const decoded = decodeJwt(jwt);
        if (decoded) {
          const roles = decoded.roles || decoded.role || decoded.authorities || decoded.authority || [];
          const rolesArr = Array.isArray(roles) ? roles : [roles];
          const scope = decoded.scope || decoded.scp || '';
          const scopeArr = typeof scope === 'string' ? scope.split(' ') : [];
          const allRoles = [...rolesArr, ...scopeArr];
          const isAdmin = allRoles.some(r => typeof r === 'string' && r.toUpperCase().includes('ADMIN'));
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
          return isAdmin;
        }
      }
      return false;
    }
    return isAdminStr === 'true';
  }
};

// 7. AnotadosCombo Service
export const AnotadosComboService = {
  create: (data) => ApiService.request(`${API_BASE_URL}/anotados-combo`, {
    method: 'POST',
    body: {
      cantidad: parseInt(data.cantidad || 1, 10),
      precioUnitario: parseFloat(data.precioUnitario || 0),
      fechaAnotado: data.fechaAnotado || new Date().toISOString(),
      estado: data.estado || 'PENDIENTE',
      clienteId: parseInt(data.clienteId, 10),
      comboId: parseInt(data.comboId, 10)
    }
  }),
  getPaged: (page = 0, size = DEFAULT_PAGE_SIZE) => ApiService.request(`${API_BASE_URL}/anotados-combo?page=${page}&size=${size}`),
  getByCliente: (clienteId, page = 0, size = 15) => ApiService.request(`${API_BASE_URL}/anotados-combo/cliente/${clienteId}?page=${page}&size=${size}`),
  delete: (id) => ApiService.request(`${API_BASE_URL}/anotados-combo/${id}`, { method: 'DELETE' }),
  marcarComoPagado: (id, metodoPago = 'EFECTIVO') => ApiService.request(`${API_BASE_URL}/anotados-combo/${id}/pagar?metodoPago=${metodoPago}`, { method: 'PUT' })
};

// Global export for non-module usage if needed
window.KioskoAPI = {
  Clientes: ClientesService,
  Productos: ProductosService,
  Anotados: AnotadosService,
  Pagos: PagosService,
  Auth: AuthService,
  Combos: CombosService,
  AnotadosCombo: AnotadosComboService
};
