package com.kiosco.controller;

import com.kiosco.record.CategoriaR;
import com.kiosco.utils.CategoriaFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaFileService categoriaFileService;

    @GetMapping
    public ResponseEntity<List<CategoriaR>> listaCategorias() {
        return ResponseEntity.ok(categoriaFileService.obtenerTodas());
    }

    @PostMapping
    public ResponseEntity<CategoriaR> crear(@RequestBody CategoriaR request) {
        CategoriaR creada = categoriaFileService.crearCategoria(
                request.codigo(),
                request.nombre(),
                request.descripcion()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }
}
