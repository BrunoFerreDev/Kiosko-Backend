package com.kiosco.controller;

import com.kiosco.dto.AnotadoProductoDTO;
import com.kiosco.record.AnotadoProductoR;
import com.kiosco.service.AnotadoProductoService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/anotados-producto")
@RequiredArgsConstructor
public class AnotadoProductoController {

    private final AnotadoProductoService anotadoProductoService;

    @PostMapping
    public ResponseEntity<AnotadoProductoDTO> crear(@RequestBody AnotadoProductoR request) {
        return new ResponseEntity<>(anotadoProductoService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<AnotadoProductoDTO>> obtenerTodos(
            @ParameterObject @PageableDefault(size = 10, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoProductoService.obtenerPaginado(pageable));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<Page<AnotadoProductoDTO>> obtenerPorCliente(
            @PathVariable Long clienteId,
            @ParameterObject
            @PageableDefault(page = 0, size = 15, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoProductoService.obtenerPorCliente(clienteId, pageable));
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<Page<AnotadoProductoDTO>> obtenerPorProducto(
            @PathVariable Long productoId,
            @ParameterObject
            @PageableDefault(page = 0, size = 15, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoProductoService.obtenerPorProducto(productoId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnotadoProductoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(anotadoProductoService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnotadoProductoDTO> actualizar(@PathVariable Long id, @RequestBody AnotadoProductoR request) {
        return ResponseEntity.ok(anotadoProductoService.actualizar(id, request));
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<AnotadoProductoDTO> marcarComoPagado(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "EFECTIVO") String metodoPago) {
        return ResponseEntity.ok(anotadoProductoService.marcarComoPagado(id, metodoPago));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        anotadoProductoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
