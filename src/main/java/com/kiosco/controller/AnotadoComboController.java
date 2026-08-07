package com.kiosco.controller;

import com.kiosco.dto.AnotadoComboDTO;
import com.kiosco.record.AnotadoComboR;
import com.kiosco.service.AnotadoComboService;
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
@RequestMapping("/anotados-combo")
@RequiredArgsConstructor
public class AnotadoComboController {

    private final AnotadoComboService anotadoComboService;

    @PostMapping
    public ResponseEntity<AnotadoComboDTO> crear(@RequestBody AnotadoComboR request) {
        return new ResponseEntity<>(anotadoComboService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<AnotadoComboDTO>> obtenerTodos(
            @ParameterObject @PageableDefault(size = 10, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoComboService.obtenerPaginado(pageable));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<Page<AnotadoComboDTO>> obtenerPorCliente(
            @PathVariable Long clienteId,
            @ParameterObject
            @PageableDefault(page = 0, size = 15, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoComboService.obtenerPorCliente(clienteId, pageable));
    }

    @GetMapping("/combo/{comboId}")
    public ResponseEntity<Page<AnotadoComboDTO>> obtenerPorCombo(
            @PathVariable Long comboId,
            @ParameterObject
            @PageableDefault(page = 0, size = 15, sort = "fechaAnotado", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoComboService.obtenerPorCombo(comboId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnotadoComboDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(anotadoComboService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnotadoComboDTO> actualizar(@PathVariable Long id, @RequestBody AnotadoComboR request) {
        return ResponseEntity.ok(anotadoComboService.actualizar(id, request));
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<AnotadoComboDTO> marcarComoPagado(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "EFECTIVO") String metodoPago) {
        return ResponseEntity.ok(anotadoComboService.marcarComoPagado(id, metodoPago));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        anotadoComboService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
