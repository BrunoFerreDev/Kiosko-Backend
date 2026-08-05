# Mi Kiosko - Frontend

Este es el cliente frontend de **Mi Kiosko**, una aplicación web moderna, limpia y responsiva diseñada para la gestión de clientes, productos, cuentas corrientes (deudas/anotados) y pagos en un comercio local.

El desarrollo está basado puramente en tecnologías web nativas y modernas, utilizando el paradigma de **Web Components (Custom Elements)**, JavaScript modular (ES Modules) y Tailwind CSS.

---

## 🛠️ Tecnologías Utilizadas

*   **HTML5 Semántico**: Para estructurar el esqueleto de la aplicación.
*   **JavaScript (ES6+ ES Modules)**: Para la lógica modular sin necesidad de compiladores o empaquetadores como Webpack o Vite.
*   **Web Components (Nativos)**: Estructuración de la interfaz mediante Custom Elements (`class MyComponent extends HTMLElement`).
*   **Tailwind CSS (CDN)**: Estilado dinámico y responsivo del sitio web, con una configuración avanzada de diseño.
*   **Google Fonts**: Tipografías *Plus Jakarta Sans* (para títulos destacados) e *Inter* (para tablas y lecturas cómodas).
*   **Material Symbols Outlined**: Para un set consistente de iconos modernos.

---

## 📁 Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```text
kiosko-front/
├── index.html                  # Dashboard principal (Resumen General)
├── API_DOCS.md                 # Documentación de referencia para la API REST del Backend
├── css/
│   └── styles.css              # Estilos personalizados y animaciones de transición
├── js/
│   ├── app.js                  # Inicializador global y manejadores de ventanas modales
│   ├── config/
│   │   └── tailwind.config.js  # Configuración personalizada del tema y colores de Tailwind
│   ├── services/
│   │   └── api.js              # Cliente de API REST (Servicio Fetch)
│   └── components/             # Catálogo de Web Components interactivos
│       ├── kpi-card.js         # Tarjeta de métrica clave (KPI)
│       ├── list-debtors.js     # Lista resumida de clientes deudores
│       ├── loader.js           # Animación de carga para peticiones asíncronas
│       ├── modal-annotation.js # Modal para registrar nuevas deudas (anotaciones)
│       ├── modal-client.js     # Modal para crear y editar clientes
│       ├── modal-payment.js    # Modal para registrar abonos/pagos
│       ├── modal-product.js    # Modal para crear y editar productos
│       ├── pagination.js       # Control de navegación para tablas paginadas
│       ├── sidebar.js          # Menú lateral de navegación responsivo
│       ├── table-activity.js   # Tabla de actividad reciente en el Dashboard
│       ├── table-clients.js    # Tabla interactiva en la sección de Clientes
│       ├── table-history.js    # Historial detallado de compras/pagos en la ficha del cliente
│       ├── table-products.js   # Tabla con buscador en la sección de Productos
│       └── topbar.js           # Barra superior con buscador y perfil
└── pages/
    ├── clientes.html           # Vista de gestión de clientes
    ├── productos.html          # Vista de catálogo y stock de productos
    └── cliente-detalle.html    # Ficha técnica del cliente y su balance de cuenta
```

---

## ⚙️ Componentes del Sistema

### 1. Vistas y Páginas (`/` y `/pages/`)
*   **Dashboard (`index.html`)**: Muestra un balance general con tres métricas clave (Total a cobrar, Clientes con deuda y Anotaciones realizadas hoy) junto a una tabla con las últimas actividades.
*   **Clientes (`pages/clientes.html`)**: Permite visualizar y paginar la lista de clientes registrados, filtrar su estado y añadir/editar su información personal.
*   **Productos (`pages/productos.html`)**: Permite la gestión del inventario, con buscadores por nombre, marca, categoría y rangos de precio.
*   **Detalle del Cliente (`pages/cliente-detalle.html`)**: Ficha detallada para un cliente específico. Muestra su deuda consolidada, permite registrar pagos rápidos, e incluye un historial completo de sus anotaciones y abonos.

### 2. Servicios de API (`js/services/api.js`)
Centraliza todas las llamadas HTTP utilizando la API `fetch` nativa del navegador. El servicio gestiona automáticamente las cabeceras JSON y procesa las respuestas del backend.
La URL base del backend está definida en la constante:
```javascript
const API_BASE_URL = 'http://localhost:8083';
```
*(Puedes cambiar este puerto si tu API de backend corre en uno diferente).*

Mapea cuatro servicios principales:
1.  `ClientesService`: ABM (Alta, Baja, Modificación) y paginación de clientes.
2.  `ProductosService`: ABM, paginación, filtros de búsqueda y categorizaciones de productos.
3.  `AnotadosService`: Registro y consulta de deudas pendientes/pagadas.
4.  `PagosService`: Gestión de abonos/pagos realizados por los clientes.

### 3. Web Components (`js/components/`)
La UI está construida encapsulando la estructura y comportamiento de cada elemento en un Web Component nativo. Por ejemplo, al declarar `<app-sidebar active="products"></app-sidebar>` en cualquier archivo HTML, el navegador renderiza la barra de navegación lateral y resalta la pestaña de "Productos".

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

Debido a que el proyecto utiliza **ES Modules** (`<script type="module">`), los navegadores restringen las peticiones a archivos locales (`file:///`) por políticas de seguridad (CORS). Por lo tanto, **es obligatorio ejecutar el frontend a través de un servidor HTTP local**.

### Opción 1: Con Python (Instalado por defecto en la mayoría de sistemas)
Abre una terminal en el directorio raíz del proyecto y ejecuta:
```bash
python3 -m http.server 8000
```
Luego, accede a [http://localhost:8000](http://localhost:8000) en tu navegador.

### Opción 2: Con Node.js (npx)
Si tienes Node.js instalado, puedes usar el paquete `serve` de forma rápida sin instalarlo globalmente:
```bash
npx serve .
```
Esto levantará un servidor local (típicamente en [http://localhost:3000](http://localhost:3000)).

### Opción 3: Extensión de Editor (VS Code)
Si utilizas Visual Studio Code, puedes instalar la extensión **Live Server**, abrir el proyecto, y hacer clic en el botón **"Go Live"** de la barra de estado inferior.

---

## 🎨 Personalización del Diseño

El diseño visual está alineado con la filosofía de Material Design 3, ofreciendo bordes redondeados amplios (`rounded-xl`), efectos de elevación dinámicos (`shadow-card`) y microinteracciones en botones y enlaces.

Si deseas modificar los colores principales, fuentes, espaciados o sombras, puedes hacerlo en [js/config/tailwind.config.js](file:///home/bdev/proyectos/kiosko-front/js/config/tailwind.config.js) bajo el objeto `extend`. Las clases de Tailwind se adaptarán automáticamente a tus cambios en la próxima recarga del navegador.
