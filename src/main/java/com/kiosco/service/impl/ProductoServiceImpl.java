package com.kiosco.service.impl;

import com.kiosco.dto.ProductoDTO;
import com.kiosco.model.Producto;
import com.kiosco.record.ProductoR;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.service.ProductoService;
import com.kiosco.utils.BadRequestException;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductoRepo productoRepo;

    @Override
    public ProductoDTO crear(ProductoR request) {
        Producto producto = new Producto();
        producto.setNombre(request.nombre());
        producto.setMarca(request.marca());
        producto.setCategoria(request.categoria());
        producto.setPrecioCosto(request.precioCosto());
        producto.setPrecioVenta(request.precioVenta());
        producto.setStock(request.stock());
        producto.setEstado(request.estado() != null ? request.estado() : true);
        return new ProductoDTO(productoRepo.save(producto));
    }

    @Override
    public List<ProductoDTO> obtenerTodos() {
        return productoRepo.findByEstadoTrue().stream().map(ProductoDTO::new).toList();
    }

    @Override
    public Page<ProductoDTO> obtenerPaginado(Pageable pageable) {
        return productoRepo.findByEstadoTrue(pageable).map(ProductoDTO::new);
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

        return productoRepo.findAll(spec, pageable).map(ProductoDTO::new);
    }

    @Override
    public ProductoDTO obtenerPorId(Long id) {
        Producto producto = productoRepo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));
        return new ProductoDTO(producto);
    }

    @Override
    public ProductoDTO actualizar(Long id, ProductoR request) {
        Producto producto = productoRepo.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));
        producto.setNombre(request.nombre());
        producto.setMarca(request.marca());
        producto.setCategoria(request.categoria());
        producto.setPrecioCosto(request.precioCosto());
        producto.setPrecioVenta(request.precioVenta());
        producto.setStock(request.stock());
        if (request.estado() != null) {
            producto.setEstado(request.estado());
        }
        return new ProductoDTO(productoRepo.save(producto));
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

    @Override
    public List<String> obtenerCategorias() {
        return productoRepo.findCategoriasUnicas();
    }

    @Override
    public List<String> obtenerMarcas() {
        return productoRepo.findMarcasUnicas();
    }
}

