package com.kiosco.controller;

import com.kiosco.dto.ProductoDTO;
import com.kiosco.record.ProductoR;
import com.kiosco.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @PostMapping
    public ResponseEntity<ProductoDTO> crear(@RequestBody ProductoR request) {
        return new ResponseEntity<>(productoService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ProductoDTO>> obtenerTodos(@ParameterObject @PageableDefault(size = 10, sort = "fechaRegistro", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(productoService.obtenerPaginado(pageable));
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<ProductoDTO>> buscar(@RequestParam(required = false) String nombre, @RequestParam(required = false) String marca, @RequestParam(required = false) String categoria, @RequestParam(required = false) BigDecimal precioMin, @RequestParam(required = false) BigDecimal precioMax, @ParameterObject @PageableDefault(page = 0, size = 10) Pageable pageable) {
        return ResponseEntity.ok(productoService.buscar(nombre, marca, categoria, precioMin, precioMax, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Long id, @RequestBody ProductoR request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

