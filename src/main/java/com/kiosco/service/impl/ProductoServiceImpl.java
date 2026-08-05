package com.kiosco.service.impl;

import com.kiosco.UnidadMedida;
import com.kiosco.dto.ProductoDTO;
import com.kiosco.model.Producto;
import com.kiosco.record.CategoriaR;
import com.kiosco.record.MarcaR;
import com.kiosco.record.ProductoR;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.service.ProductoService;
import com.kiosco.utils.BadRequestException;
import com.kiosco.utils.CategoriaFileService;
import com.kiosco.utils.MarcaFileService;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductoRepo productoRepo;
    private final MarcaFileService marcaFileService;
    private final CategoriaFileService categoriaFileService;

    @Override
    public ProductoDTO crear(ProductoR request) {
        Producto producto = new Producto();
        producto.setNombre(request.nombre());
        producto.setMarcaId(request.marca());
        producto.setCategoriaId(request.categoria());
        producto.setPrecioCosto(request.precioCosto());
        producto.setPrecioVenta(request.precioVenta());
        producto.setStock(request.stock());
        producto.setUnidadMedida(UnidadMedida.fromString(request.unidadMedida()));
        producto.setFechaRegistro(LocalDate.now());
        producto.setEstado(request.estado() != null ? request.estado() : true);
        return toDTO(productoRepo.save(producto));
    }

    @Override
    public List<ProductoDTO> obtenerTodos() {
        return productoRepo.findByEstadoTrue().stream().map(this::toDTO).toList();
    }

    @Override
    public Page<ProductoDTO> obtenerPaginado(Pageable pageable) {
        return productoRepo.findByEstadoTrue(pageable).map(this::toDTO);
    }

    @Override
    public Page<ProductoDTO> buscar(String nombre, String marca, String categoria, BigDecimal precioMin, BigDecimal precioMax, Pageable pageable) {
        Specification<Producto> spec = (root, query, cb) -> cb.equal(root.get("estado"), true);

        if (nombre != null && !nombre.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("nombre")), "%" + nombre.toLowerCase() + "%"));
        }
        if (marca != null && !marca.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("marca")), "%" + marca.toLowerCase() + "%"));
        }
        if (categoria != null && !categoria.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("categoria")), "%" + categoria.toLowerCase() + "%"));
        }
        if (precioMin != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("precioVenta"), precioMin));
        }
        if (precioMax != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("precioVenta"), precioMax));
        }

        return productoRepo.findAll(spec, pageable).map(this::toDTO);
    }

    @Override
    public ProductoDTO obtenerPorId(Long id) {
        Producto producto = productoRepo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));
        return toDTO(producto);
    }

    @Override
    public ProductoDTO actualizar(Long id, ProductoR request) {
        Producto producto = productoRepo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));

        // 1. Validar que la marca exista en marcas.json
        if (request.marca() != null) {
            marcaFileService.buscarPorId(request.marca()).orElseThrow(() -> new NotFoundException("Marca no encontrada con ID: " + request.marca()));
        }

        // 2. Validar que la categoría exista en categorias.json
        if (request.categoria() != null) {
            categoriaFileService.buscarPorId(request.categoria()).orElseThrow(() -> new NotFoundException("Categoría no encontrada con ID: " + request.categoria()));
        }

        // 3. Asignar atributos
        producto.setNombre(request.nombre());
        producto.setMarcaId(request.marca());
        producto.setCategoriaId(request.categoria());
        producto.setPrecioCosto(request.precioCosto());
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
        String nombreMarca = marcaFileService.buscarPorId(producto.getMarcaId()).map(MarcaR::nombre).orElse("Sin Marca");

        String nombreCategoria = categoriaFileService.buscarPorId(producto.getCategoriaId()).map(CategoriaR::nombre).orElse("Sin Categoría");

        return new ProductoDTO(producto, nombreMarca, nombreCategoria);
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

                // --- COLUMNA B (Índice 1): Nombre ---
                Cell nombreCell = row.getCell(1);
                product.setNombre(formatter.formatCellValue(nombreCell));

                // Valores por defecto
                product.setMarcaId(0L);
                product.setCategoriaId(0L);
                product.setUnidadMedida(UnidadMedida.UNIDAD);
                product.setEstado(true);
                product.setPrecioCosto(new BigDecimal("0.00"));

                // --- COLUMNA D (Índice 3): Precio Venta ---
                Cell precioCell = row.getCell(3);
                if (precioCell != null && precioCell.getCellType() == CellType.NUMERIC) {
                    product.setPrecioVenta(BigDecimal.valueOf(precioCell.getNumericCellValue()));
                } else if (precioCell != null) {
                    // Fallback: Si se lee como texto "4.000", quitamos el punto de los miles antes de convertir a BigDecimal
                    try {
                        String precioStr = formatter.formatCellValue(precioCell).replace(".", "");
                        // Si hubiera decimales con coma, puedes encadenar un .replace(",", ".")
                        product.setPrecioVenta(new BigDecimal(precioStr));
                    } catch (NumberFormatException e) {
                        product.setPrecioVenta(new BigDecimal("0.00"));
                    }
                } else {
                    product.setPrecioVenta(new BigDecimal("0.00"));
                }

                // --- COLUMNA E (Índice 4): Stock ---
                Cell stockCell = row.getCell(4);
                if (stockCell != null && stockCell.getCellType() == CellType.NUMERIC) {
                    product.setStock((int) stockCell.getNumericCellValue());
                } else if (stockCell != null) {
                    try {
                        // Limpiamos también posibles puntos en el texto del stock
                        String stockStr = formatter.formatCellValue(stockCell).replace(".", "");
                        product.setStock(Integer.parseInt(stockStr));
                    } catch (NumberFormatException e) {
                        product.setStock(0);
                    }
                } else {
                    product.setStock(0);
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
}

