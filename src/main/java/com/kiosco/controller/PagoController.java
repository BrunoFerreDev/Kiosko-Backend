package com.kiosco.controller;

import com.kiosco.dto.PagoDTO;
import com.kiosco.record.PagoR;
import com.kiosco.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @PostMapping
    public ResponseEntity<PagoDTO> crear(@RequestBody PagoR request) {
        return new ResponseEntity<>(pagoService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PagoDTO>> obtenerTodos() {
        return ResponseEntity.ok(pagoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PagoDTO> actualizar(@PathVariable Long id, @RequestBody PagoR request) {
        return ResponseEntity.ok(pagoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pagoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

