package com.kiosco.controller;

import com.kiosco.dto.ActividadRecienteDTO;
import com.kiosco.dto.AnotadoDTO;
import com.kiosco.record.AnotadoR;
import com.kiosco.service.AnotadoService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/anotados")
@RequiredArgsConstructor
public class AnotadoController {

    private final AnotadoService anotadoService;

    @PostMapping
    public ResponseEntity<AnotadoDTO> crear(@RequestBody AnotadoR request) {
        return new ResponseEntity<>(anotadoService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AnotadoDTO>> obtenerTodos() {
        return ResponseEntity.ok(anotadoService.obtenerTodos());
    }

    @GetMapping("/actividad-reciente")
    public ResponseEntity<List<ActividadRecienteDTO>> obtenerActividadReciente(
            @RequestParam(required = false, defaultValue = "10") int limite) {
        return ResponseEntity.ok(anotadoService.obtenerActividadReciente(limite));
    }

    @GetMapping("/paginado")
    public ResponseEntity<Page<AnotadoDTO>> obtenerPaginado(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(anotadoService.obtenerPaginado(pageable));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<Page<AnotadoDTO>> obtenerPorCliente(
            @PathVariable Long clienteId,
            @ParameterObject
            @PageableDefault(page = 0, size = 15, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anotadoService.obtenerPorCliente(clienteId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnotadoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(anotadoService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnotadoDTO> actualizar(@PathVariable Long id, @RequestBody AnotadoR request) {
        return ResponseEntity.ok(anotadoService.actualizar(id, request));
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<AnotadoDTO> marcarComoPagado(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "EFECTIVO") String metodoPago) {
        return ResponseEntity.ok(anotadoService.marcarComoPagado(id, metodoPago));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        anotadoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

