package com.kiosco.service;

import com.kiosco.dto.MenuDiarioDTO;
import com.kiosco.record.MenuDiarioR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MenuDiarioService {
    MenuDiarioDTO crear(MenuDiarioR request);
    MenuDiarioDTO obtenerPorId(Long id);
    List<MenuDiarioDTO> obtenerTodos();
    Page<MenuDiarioDTO> obtenerPaginado(Pageable pageable);
    MenuDiarioDTO actualizar(Long id, MenuDiarioR request);
    void eliminar(Long id);
}
