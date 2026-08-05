package com.kiosco.controller;

import com.kiosco.record.MarcaR;
import com.kiosco.utils.MarcaFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/marcas")
@RequiredArgsConstructor
public class MarcaController {

    private final MarcaFileService marcaService;

    @GetMapping
    public ResponseEntity<List<MarcaR>> listarTodas() {
        return ResponseEntity.ok(marcaService.obtenerTodas());
    }

    @PostMapping
    public ResponseEntity<MarcaR> crear(@RequestBody MarcaR request) {
        MarcaR creada = marcaService.crearMarca(
                request.codigo(),
                request.nombre()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }
}