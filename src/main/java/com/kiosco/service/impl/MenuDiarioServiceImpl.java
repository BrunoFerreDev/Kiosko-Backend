package com.kiosco.service.impl;

import com.kiosco.dto.MenuDiarioDTO;
import com.kiosco.model.MenuDiario;
import com.kiosco.record.MenuDiarioR;
import com.kiosco.repository.MenuDiarioRepo;
import com.kiosco.service.MenuDiarioService;
import com.kiosco.utils.BadRequestException;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuDiarioServiceImpl implements MenuDiarioService {

    private final MenuDiarioRepo menuDiarioRepo;

    @Override
    @Transactional
    public MenuDiarioDTO crear(MenuDiarioR request) {
        LocalDate fecha = request.fecha() != null ? request.fecha() : LocalDate.now();
        if (menuDiarioRepo.existsByFecha(fecha)) {
            throw new BadRequestException("Ya existe un menú diario para la fecha: " + fecha);
        }

        MenuDiario menuDiario = new MenuDiario();
        menuDiario.setFecha(fecha);
        menuDiario.setNombre(request.nombre());
        menuDiario.setPrecio(request.precio());

        MenuDiario guardado = menuDiarioRepo.save(menuDiario);
        return new MenuDiarioDTO(guardado);
    }

    @Override
    public MenuDiarioDTO obtenerPorId(Long id) {
        MenuDiario menuDiario = menuDiarioRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Menú diario no encontrado con ID: " + id));
        return new MenuDiarioDTO(menuDiario);
    }

    @Override
    public List<MenuDiarioDTO> obtenerTodos() {
        return menuDiarioRepo.findAll().stream()
                .map(MenuDiarioDTO::new)
                .toList();
    }

    @Override
    public Page<MenuDiarioDTO> obtenerPaginado(Pageable pageable) {
        return menuDiarioRepo.findAll(pageable).map(MenuDiarioDTO::new);
    }

    @Override
    @Transactional
    public MenuDiarioDTO actualizar(Long id, MenuDiarioR request) {
        MenuDiario menuDiario = menuDiarioRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Menú diario no encontrado con ID: " + id));

        if (request.fecha() != null) {
            menuDiario.setFecha(request.fecha());
        }
        if (request.nombre() != null) {
            menuDiario.setNombre(request.nombre());
        }
        if (request.precio() != null) {
            menuDiario.setPrecio(request.precio());
        }

        return new MenuDiarioDTO(menuDiarioRepo.save(menuDiario));
    }

    @Override
    public void eliminar(Long id) {
        if (!menuDiarioRepo.existsById(id)) {
            throw new NotFoundException("Menú diario no encontrado con ID: " + id);
        }
        menuDiarioRepo.deleteById(id);
    }
}
