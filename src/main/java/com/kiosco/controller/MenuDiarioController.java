package com.kiosco.controller;

import com.kiosco.dto.MenuDiarioDTO;
import com.kiosco.record.MenuDiarioR;
import com.kiosco.service.MenuDiarioService;
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
@RequestMapping("/menus-diarios")
@RequiredArgsConstructor
public class MenuDiarioController {

    private final MenuDiarioService menuDiarioService;

    @PostMapping
    public ResponseEntity<MenuDiarioDTO> crear(@RequestBody MenuDiarioR request) {
        return new ResponseEntity<>(menuDiarioService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<MenuDiarioDTO>> obtenerTodos(
            @ParameterObject @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(menuDiarioService.obtenerPaginado(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuDiarioDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(menuDiarioService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuDiarioDTO> actualizar(@PathVariable Long id, @RequestBody MenuDiarioR request) {
        return ResponseEntity.ok(menuDiarioService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        menuDiarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
