package com.kiosco.controller;

import com.kiosco.dto.AnotadoMenuDTO;
import com.kiosco.record.AnotadoMenuR;
import com.kiosco.service.AnotadoMenuService;
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
@RequestMapping("/anotados-menu")
@RequiredArgsConstructor
public class AnotadoMenuController {

    private final AnotadoMenuService anotadoMenuService;

    @PostMapping
    public ResponseEntity<AnotadoMenuDTO> crear(@RequestBody AnotadoMenuR request) {
        return new ResponseEntity<>(anotadoMenuService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<AnotadoMenuDTO>> obtenerTodos(
            @ParameterObject @PageableDefault(size = 10, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoMenuService.obtenerPaginado(pageable));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<Page<AnotadoMenuDTO>> obtenerPorCliente(
            @PathVariable Long clienteId,
            @ParameterObject
            @PageableDefault(page = 0, size = 15, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoMenuService.obtenerPorCliente(clienteId, pageable));
    }

    @GetMapping("/menu/{menuDiarioId}")
    public ResponseEntity<Page<AnotadoMenuDTO>> obtenerPorMenuDiario(
            @PathVariable Long menuDiarioId,
            @ParameterObject
            @PageableDefault(page = 0, size = 15, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoMenuService.obtenerPorMenuDiario(menuDiarioId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnotadoMenuDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(anotadoMenuService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnotadoMenuDTO> actualizar(@PathVariable Long id, @RequestBody AnotadoMenuR request) {
        return ResponseEntity.ok(anotadoMenuService.actualizar(id, request));
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<AnotadoMenuDTO> marcarComoPagado(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "EFECTIVO") String metodoPago) {
        return ResponseEntity.ok(anotadoMenuService.marcarComoPagado(id, metodoPago));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        anotadoMenuService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
