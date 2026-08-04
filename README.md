# Kiosco - Sistema de Gestión y Control de Cuentas Corrientes

Sistema backend desarrollado en **Spring Boot** para la gestión de productos, clientes, fiados ("anotados") y pagos en
un kiosco.

---

## 🚀 Tecnologías y Dependencias Clave

- **Lenguaje / Framework**: Java (Spring Boot)
- **Capa Web**: `spring-boot-starter-webmvc` (REST APIs con soporte MVC)
- **Persistencia**: `spring-boot-starter-data-jpa` (Spring Data JPA / Hibernate)
- **Base de Datos**: `sqlite-jdbc` + `hibernate-community-dialects` (Modo WAL habilitado)
- **Documentación API**: `springdoc-openapi-starter-webmvc-ui` (Swagger UI)
- **Utilidades**: `lombok` (generación de getters/setters/constructores), `spring-boot-starter-actuator`

---

## 🔄 Arquitectura y Flujo de Datos

```
[ Cliente Front-End ]
        │
        ▼ (JSON Request Payload usando Java Records)
[ Controller Layer ] (@RestController)
        │
        ▼
[ Service Layer ] (@Service + @Transactional)
        │  ├── Lógica de negocio (Distribución de pagos FIFO, cálculo de saldo)
        │  └── Transformación Entity <-> DTO / Record
        ▼
[ Repository Layer ] (Spring Data JpaRepository + JpaSpecificationExecutor)
        │
        ▼
[ Base de Datos SQLite ] (kiosco.db - WAL Mode)
        │
        ▼ (JSON Response mediante DTOs)
[ Cliente Front-End ]
```

### Principios del Flujo de Datos:

1. **Entrada de Datos (`Records`)**: Las peticiones `POST` y `PUT` utilizan **Java Records** (`ClienteR`, `ProductoR`,
   `AnotadoR`, `PagoR`) como DTOs inmutables de entrada (`@RequestBody`).
2. **Salida de Datos (`DTOs`)**: Los endpoints responden exclusivamente con objetos **DTO** (`ClienteDTO`,
   `ProductoDTO`, `AnotadoDTO`, `PagoDTO`, `ActividadRecienteDTO`).
3. **Persistencia (`Entities`)**: Las entidades JPA (`Cliente`, `Producto`, `Anotado`, `Pago`, `DetallePago`) manejan el
   mapeo relacional en SQLite.

---

## ⚙️ Reglas de Negocio Principales

### 1. Gestión de Productos

- **Filtrado por Estado Activo**: Los endpoints de consulta (`GET /productos`, `/productos/paginado`,
  `/productos/buscar`) retornan únicamente los productos con `estado = true`.
- **Eliminación Lógica (Soft Delete)**: La eliminación de un producto verifica primero que no posea stock. Si el stock
  es 0, marca `estado = false` en lugar de borrar el registro físico.
- **Búsqueda Multicriterio**: `GET /productos/buscar` permite filtrar combinando `nombre`, `marca`, `categoria`,
  `precioMin` y `precioMax` de forma dinámica mediante `Specification`.

### 2. Saldo de Cliente

- Cada `ClienteDTO` calcula automáticamente su `saldoPendiente` sumando las deudas no saldadas de sus productos anotados
  (`PENDIENTE` o `PARCIAL`). Si el cliente no posee deudas, el saldo retorna `0.00`.

### 3. Distribución Automática de Pagos (FIFO)

- Al enviar un pago mediante `POST /pagos`, el sistema aplica el monto abonado entre los anotados del cliente con estado
  `PENDIENTE` o `PARCIAL` en orden de antigüedad (**FIFO**).
- Si el monto cubre la totalidad del anotado, su estado cambia a `PAGADO`. Si cubre una fracción, pasa a `PARCIAL`.
- Cada abono genera registros en la tabla relacional `tbl_detalles_pagos`.

### 4. Pago Directo por Anotado

- `PUT /anotados/{id}/pagar` permite saldar la totalidad de un producto anotado específico, generando automáticamente su
  registro de pago asociado.

### 5. Actividad Reciente Consolidada

- `GET /anotados/actividad-reciente?limite=10` devuelve una vista simplificada de los movimientos recientes. Agrupa los
  productos anotados por cliente y entrega el nombre del cliente, lista de productos concatenados, monto total acumulado
  y fecha.

---

## 🗄️ Base de Datos y Concurrencia (SQLite WAL)

La conexión SQLite está configurada en `application.yaml` con parámetros para evitar bloqueos de concurrencia
(`SQLITE_BUSY`):

```yaml
spring:
  datasource:
    url: ${DBURL}WAL&busy_timeout=5000
    hikari:
      maximum-pool-size: 1
```

---

## 📦 Carga Inicial de Datos (`DataLoader`)

Al iniciar la aplicación por primera vez, el componente `DataLoader` detecta si la base de datos está vacía e inserta
automáticamente:

- **10 Clientes** de prueba.
- **50 Productos reales de kiosco** (Coca-Cola, Papas Lays, Chocolinas, KitKat, Cindor, etc.) divididos equitativamente
  en 5 marcas y 5 categorías.

---

## 📄 Documentación Interactiva con Swagger UI / OpenAPI

El proyecto integra **SpringDoc OpenAPI** (`springdoc-openapi-starter-webmvc-ui`), permitiendo explorar, probar y
documentar la API REST de forma interactiva desde el navegador.

- **URL Swagger UI (Interfaz
  Web)**: [/swagger-ui/index.html](http://localhost:8083/swagger-ui/index.html)
  o [/swagger-ui.html](http://localhost:8083/swagger-ui.html)
- **Especificación OpenAPI (JSON Raw)**: [/v3/api-docs](http://localhost:8083/v3/api-docs)

Desde Swagger UI se puede:

1. Probar todos los endpoints REST (`/clientes`, `/productos`, `/anotados`, `/pagos`).
2. Enviar cuerpos de petición formateados según los `Records` requeridos (`ClienteR`, `ProductoR`, `AnotadoR`, `PagoR`).
3. Probar la paginación (`page`, `size`, `sort`) y los filtros de búsqueda dinámicos.
4. Inspeccionar los esquemas de respuestas `DTO` en tiempo real.

---
