package com.kiosco.controller;

import com.kiosco.record.MarcaR;
import com.kiosco.service.MarcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/marcas")
@RequiredArgsConstructor
public class MarcaController {

    private final MarcaService marcaService;

    @GetMapping
    public ResponseEntity<List<MarcaR>> listarTodas() {
        return ResponseEntity.ok(marcaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarcaR> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(marcaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<MarcaR> crear(@RequestBody MarcaR request) {
        MarcaR creada = marcaService.crearMarca(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarcaR> actualizar(@PathVariable Long id, @RequestBody MarcaR request) {
        return ResponseEntity.ok(marcaService.actualizarMarca(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        marcaService.eliminarMarca(id);
        return ResponseEntity.noContent().build();
    }
}