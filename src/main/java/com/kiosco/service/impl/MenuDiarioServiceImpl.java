package com.kiosco.service.impl;

import com.kiosco.dto.MenuDiarioDTO;
import com.kiosco.model.MenuDiario;
import com.kiosco.model.MenuDiarioItem;
import com.kiosco.model.Producto;
import com.kiosco.record.MenuDiarioR;
import com.kiosco.repository.MenuDiarioItemRepo;
import com.kiosco.repository.MenuDiarioRepo;
import com.kiosco.repository.ProductoRepo;
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
    private final MenuDiarioItemRepo menuDiarioItemRepo;
    private final ProductoRepo productoRepo;

    @Override
    @Transactional
    public MenuDiarioDTO crear(MenuDiarioR request) {
        MenuDiario menuDiario = new MenuDiario();
        menuDiario.setFecha(request.fecha());
        menuDiario.setNombre(request.nombre());
        menuDiario.setPrecio(request.precio());
        MenuDiario guardado = menuDiarioRepo.save(menuDiario);

        if (request.productoIds() != null) {
            for (Long prodId : request.productoIds()) {
                Producto prod = productoRepo.findById(prodId)
                        .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + prodId));
                MenuDiarioItem item = new MenuDiarioItem();
                item.setMenuDiario(guardado);
                item.setProducto(prod);
                menuDiarioItemRepo.save(item);
                guardado.getMenuDiarioItems().add(item);
            }
        }

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

        if (request.productoIds() != null) {
            menuDiarioItemRepo.deleteByMenuDiarioMenuDiarioId(id);
            menuDiario.getMenuDiarioItems().clear();

            for (Long prodId : request.productoIds()) {
                Producto prod = productoRepo.findById(prodId)
                        .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + prodId));
                MenuDiarioItem item = new MenuDiarioItem();
                item.setMenuDiario(menuDiario);
                item.setProducto(prod);
                menuDiarioItemRepo.save(item);
                menuDiario.getMenuDiarioItems().add(item);
            }
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
