package com.kiosco.service;

import com.kiosco.dto.ProductoDTO;
import com.kiosco.record.ProductoR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface ProductoService {
    ProductoDTO crear(ProductoR request);
    List<ProductoDTO> obtenerTodos();
    Page<ProductoDTO> obtenerPaginado(Pageable pageable);
    Page<ProductoDTO> buscar(String nombre, String marca, String categoria, BigDecimal precioMin, BigDecimal precioMax, Pageable pageable);
    ProductoDTO obtenerPorId(Long id);
    ProductoDTO actualizar(Long id, ProductoR request);
    void eliminar(Long id);

    void saveProductsFromExcel(MultipartFile file);

   /* List<String> obtenerCategorias();

    List<String> obtenerMarcas();*/
}


