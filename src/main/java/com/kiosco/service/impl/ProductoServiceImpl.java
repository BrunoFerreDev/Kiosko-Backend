package com.kiosco.service.impl;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import com.kiosco.UnidadMedida;
import com.kiosco.dto.ProductoDTO;
import com.kiosco.dto.PageDTO;
import com.kiosco.model.Producto;
import com.kiosco.record.CategoriaR;
import com.kiosco.record.MarcaR;
import com.kiosco.record.ProductoR;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.service.ProductoService;
import com.kiosco.utils.BadRequestException;
import com.kiosco.repository.CategoriaRepo;
import com.kiosco.repository.MarcaRepo;
import com.kiosco.model.Categoria;
import com.kiosco.model.Marca;
import com.kiosco.utils.NotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductoRepo productoRepo;
    private final MarcaRepo marcaRepo;
    private final CategoriaRepo categoriaRepo;

    @Override
    @CacheEvict(value = "productos", allEntries = true)
    public ProductoDTO crear(ProductoR request) {
        if (productoRepo.existsByNombreIgnoreCaseAndMarcaIdAndCategoriaIdAndEstadoTrue(request.nombre(), request.marca(), request.categoria())) {
            throw new BadRequestException("Ya existe un producto con el mismo nombre, marca y categoría.");
        }

        Producto producto = new Producto();
        Marca marca = marcaRepo.findById(request.marca())
                .orElseThrow(() -> new NotFoundException("Marca no encontrada con ID: " + request.marca()));
        Categoria categoria = categoriaRepo.findById(request.categoria())
                .orElseThrow(() -> new NotFoundException("Categoria no encontrada con ID: " + request.categoria()));

        producto.setNombre(request.nombre());
        producto.setMarca(marca);
        producto.setCategoria(categoria);
        producto.setPrecioVenta(request.precioVenta());
        producto.setStock(request.stock());
        producto.setUnidadMedida(UnidadMedida.fromString(request.unidadMedida()));
        producto.setFechaRegistro(LocalDate.now());
        producto.setEstado(request.estado() != null ? request.estado() : true);
        return toDTO(productoRepo.save(producto));
    }

    @Override
    @Cacheable("productos")
    public List<ProductoDTO> obtenerTodos() {
        return productoRepo.findByEstadoTrue().stream().map(this::toDTO).toList();
    }

    @Override
    @Cacheable(value = "productos", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public PageDTO<ProductoDTO> obtenerPaginado(Pageable pageable) {
        return new PageDTO<>(productoRepo.findByEstadoTrue(pageable).map(this::toDTO));
    }

    @Override
    public PageDTO<ProductoDTO> buscar(String nombre, String marca, String categoria, BigDecimal precioMin, BigDecimal precioMax, Pageable pageable) {
        Specification<Producto> spec = (root, query, cb) -> cb.equal(root.get("estado"), true);

        if (nombre != null && !nombre.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("nombre")), "%" + nombre.toLowerCase() + "%"));
        }
        if (marca != null && !marca.isBlank()) {
            List<Long> idsMarca = marcaRepo.findByNombreContainingIgnoreCase(marca).stream().map(Marca::getId).toList();
            if (idsMarca.isEmpty()) {
                return new PageDTO<>(Page.empty(pageable));
            }
            spec = spec.and((root, query, cb) -> root.get("marca").get("id").in(idsMarca));
        }
        if (categoria != null && !categoria.isBlank()) {
            List<Long> idsCategoria = categoriaRepo.findByNombreContainingIgnoreCase(categoria).stream().map(Categoria::getId).toList();
            if (idsCategoria.isEmpty()) {
                return new PageDTO<>(Page.empty(pageable));
            }
            spec = spec.and((root, query, cb) -> root.get("categoria").get("id").in(idsCategoria));
        }
        if (precioMin != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("precioVenta"), precioMin));
        }
        if (precioMax != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("precioVenta"), precioMax));
        }

        return new PageDTO<>(productoRepo.findAll(spec, pageable).map(this::toDTO));
    }

    @Override
    public ProductoDTO obtenerPorId(Long id) {
        Producto producto = productoRepo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));
        return toDTO(producto);
    }

    @Override
    @CacheEvict(value = "productos", allEntries = true)
    public ProductoDTO actualizar(Long id, ProductoR request) {
        Producto producto = productoRepo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));

        if (request.marca() != null) {
            Marca marca = marcaRepo.findById(request.marca()).orElseThrow(() -> new NotFoundException("Marca no encontrada con ID: " + request.marca()));
            producto.setMarca(marca);
        }

        if (request.categoria() != null) {
            Categoria categoria = categoriaRepo.findById(request.categoria()).orElseThrow(() -> new NotFoundException("Categoría no encontrada con ID: " + request.categoria()));
            producto.setCategoria(categoria);
        }

        // Validamos duplicados excluyendo el ID actual para todos los casos sin excepcion
        if (productoRepo.existsByNombreIgnoreCaseAndMarcaIdAndCategoriaIdAndEstadoTrueAndProductoIdNot(request.nombre(), request.marca(), request.categoria(), id)) {
            throw new BadRequestException("Ya existe otro producto con el mismo nombre, marca y categoría.");
        }

        // 3. Asignar atributos
        producto.setNombre(request.nombre());
        // marca y categoria seteados arriba si vinieron en el request
        producto.setPrecioVenta(request.precioVenta());
        producto.setStock(request.stock());
        producto.setUnidadMedida(UnidadMedida.fromString(request.unidadMedida()));
        if (request.estado() != null) {
            producto.setEstado(request.estado());
        }

        Producto productoGuardado = productoRepo.save(producto);
        return toDTO(productoGuardado);
    }

    @Override
    @CacheEvict(value = "productos", allEntries = true)
    public void eliminar(Long id) {
        if (!productoRepo.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        Producto producto = productoRepo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));
        if (producto.getStock() > 0) {
            throw new BadRequestException("No se puede eliminar el producto con ID: " + id + " porque tiene stock disponible.");
        }
        producto.setEstado(false);
        productoRepo.save(producto);
    }

    private ProductoDTO toDTO(Producto producto) {
        String nombreMarca = producto.getMarca() != null ? producto.getMarca().getNombre() : "Sin Marca";
        String nombreCategoria = producto.getCategoria() != null ? producto.getCategoria().getNombre() : "Sin Categoría";
        return new ProductoDTO(producto, nombreMarca, nombreCategoria);
    }

    /**
     * Specification que excluye productos con categoría "Caseros".
     * Los IDs se resuelven desde los JSON en memoria; si no existen devuelve predicado vacío.
     */
    private Specification<Producto> specExcluirCaseros() {
        List<Long> idsCategoriasExcluidas = categoriaRepo.findByNombreContainingIgnoreCase("Caseros").stream().map(Categoria::getId).toList();

        return (root, query, cb) -> {
            Predicate base = cb.conjunction();
            if (!idsCategoriasExcluidas.isEmpty()) {
                base = cb.and(base, cb.not(root.get("categoria").get("id").in(idsCategoriasExcluidas)));
            }
            return base;
        };
    }

    @Override
    public void saveProductsFromExcel(MultipartFile file) {
        try {
            List<Producto> products = new ArrayList<>();
            InputStream inputStream = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);

            DataFormatter formatter = new DataFormatter();

            for (Row row : sheet) {
                // Saltar la primera fila (encabezados)
                if (row.getRowNum() == 0) {
                    continue;
                }

                Producto product = new Producto();

                // --- COLUMNA A (Índice 0): Nombre ---
                Cell nombreCell = row.getCell(0);
                product.setNombre(formatter.formatCellValue(nombreCell));

                // Valores por defecto de configuración
                product.setUnidadMedida(UnidadMedida.UNIDAD);
                product.setEstado(true);

                // --- COLUMNA B (Índice 1): Precio Venta ---
                Cell precioCell = row.getCell(1);
                if (precioCell != null && precioCell.getCellType() == CellType.NUMERIC) {
                    product.setPrecioVenta(BigDecimal.valueOf(precioCell.getNumericCellValue()));
                } else if (precioCell != null) {
                    try {
                        String precioStr = formatter.formatCellValue(precioCell).replace(".", "");
                        product.setPrecioVenta(new BigDecimal(precioStr));
                    } catch (NumberFormatException e) {
                        product.setPrecioVenta(new BigDecimal("0.00"));
                    }
                } else {
                    product.setPrecioVenta(new BigDecimal("0.00"));
                }

                // --- COLUMNA C (Índice 2): Stock ---
                Cell stockCell = row.getCell(2);
                if (stockCell != null && stockCell.getCellType() == CellType.NUMERIC) {
                    product.setStock((int) stockCell.getNumericCellValue());
                } else if (stockCell != null) {
                    try {
                        String stockStr = formatter.formatCellValue(stockCell).replace(".", "");
                        product.setStock(Integer.parseInt(stockStr));
                    } catch (NumberFormatException e) {
                        product.setStock(0);
                    }
                } else {
                    product.setStock(0);
                }

                // --- COLUMNA D (Índice 3): Marca ID ---
                Cell marcaCell = row.getCell(3);
                String marcaStr = formatter.formatCellValue(marcaCell).trim();
                if (marcaStr.isEmpty()) {
                    product.setMarca(null);
                } else {
                    try {
                        Long mId = Long.parseLong(marcaStr.replace(".", "").replace(",", ""));
                        marcaRepo.findById(mId).ifPresent(product::setMarca);
                    } catch (NumberFormatException e) {
                        product.setMarca(null);
                    }
                }

                // --- COLUMNA E (Índice 4): Categoría ID ---
                Cell categoriaCell = row.getCell(4);
                String categoriaStr = formatter.formatCellValue(categoriaCell).trim();
                if (categoriaStr.isEmpty()) {
                    product.setCategoria(null);
                } else {
                    try {
                        Long cId = Long.parseLong(categoriaStr.replace(".", "").replace(",", ""));
                        categoriaRepo.findById(cId).ifPresent(product::setCategoria);
                    } catch (NumberFormatException e) {
                        product.setCategoria(null);
                    }
                }

                // Solo agregar a la lista si el nombre existe y no está en blanco
                if (product.getNombre() != null && !product.getNombre().trim().isEmpty()) {
                    products.add(product);
                }
            }

            workbook.close();

            // Guardar en la base de datos
            productoRepo.saveAll(products);

        } catch (Exception e) {
            throw new RuntimeException("Error al procesar el archivo Excel: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportProductsToExcel() {
        List<Producto> productos = productoRepo.findAll();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Productos");

            // 1. Crear el estilo para el encabezado
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // 2. Crear la fila de encabezados (Fila 0)
            Row headerRow = sheet.createRow(0);

            // Columna A (Índice 0) -> Nombre
            Cell cellNombre = headerRow.createCell(0);
            cellNombre.setCellValue("Nombre");
            cellNombre.setCellStyle(headerStyle);

            // Columna B (Índice 1) -> Precio Venta
            Cell cellPrecio = headerRow.createCell(1);
            cellPrecio.setCellValue("Precio Venta");
            cellPrecio.setCellStyle(headerStyle);

            // Columna C (Índice 2) -> Stock
            Cell cellStock = headerRow.createCell(2);
            cellStock.setCellValue("Stock");
            cellStock.setCellStyle(headerStyle);

            // Columna D (Índice 3) -> Marca
            Cell cellMarca = headerRow.createCell(3);
            cellMarca.setCellValue("Marca");
            cellMarca.setCellStyle(headerStyle);

            // Columna E (Índice 4) -> Categoría
            Cell cellCategoria = headerRow.createCell(4);
            cellCategoria.setCellValue("Categoría");
            cellCategoria.setCellStyle(headerStyle);

            // 3. Llenar los datos de los productos
            int rowIdx = 1;
            for (Producto producto : productos) {
                Row row = sheet.createRow(rowIdx++);

                // Columna A (0): Nombre
                row.createCell(0).setCellValue(producto.getNombre());

                // Columna B (1): Precio Venta
                if (producto.getPrecioVenta() != null) {
                    row.createCell(1).setCellValue(producto.getPrecioVenta().doubleValue());
                } else {
                    row.createCell(1).setCellValue(0.0);
                }

                // Columna C (2): Stock
                row.createCell(2).setCellValue(producto.getStock());

                // Columna D (3): Marca ID
                if (producto.getMarca() != null) {
                    row.createCell(3).setCellValue(producto.getMarca().getId());
                } else {
                    row.createCell(3).setCellValue(0);
                }

                // Columna E (4): Categoría ID
                if (producto.getCategoria() != null) {
                    row.createCell(4).setCellValue(producto.getCategoria().getId());
                } else {
                    row.createCell(4).setCellValue(0);
                }
            }

            // 4. Ajustar el ancho de las columnas automáticamente (0 al 4)
            for (int i = 0; i <= 4; i++) {
                sheet.autoSizeColumn(i);
            }

            // 5. Escribir y retornar
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error al exportar los datos a Excel: " + e.getMessage());
        }
    }
}

