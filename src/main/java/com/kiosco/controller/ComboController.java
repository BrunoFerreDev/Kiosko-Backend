package com.kiosco.controller;

import com.kiosco.dto.ComboDTO;
import com.kiosco.record.ComboR;
import com.kiosco.service.ComboService;
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
@RequestMapping("/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @PostMapping
    public ResponseEntity<ComboDTO> crear(@RequestBody ComboR request) {
        return new ResponseEntity<>(comboService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ComboDTO>> obtenerTodos(
            @ParameterObject @PageableDefault(size = 10, sort = "precio", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(comboService.obtenerPaginado(pageable));
    }

    @GetMapping("/activos")
    public ResponseEntity<List<ComboDTO>> obtenerActivos() {
        return ResponseEntity.ok(comboService.obtenerActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComboDTO> actualizar(@PathVariable Long id, @RequestBody ComboR request) {
        return ResponseEntity.ok(comboService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        comboService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
