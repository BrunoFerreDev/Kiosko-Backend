package com.kiosco.service.impl;

import com.kiosco.dto.ComboDTO;
import com.kiosco.model.Combo;
import com.kiosco.model.ComboItem;
import com.kiosco.model.Producto;
import com.kiosco.record.ComboR;
import com.kiosco.repository.ComboItemRepo;
import com.kiosco.repository.ComboRepo;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.service.ComboService;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComboServiceImpl implements ComboService {

    private final ComboRepo comboRepo;
    private final ComboItemRepo comboItemRepo;
    private final ProductoRepo productoRepo;

    @Override
    @Transactional
    public ComboDTO crear(ComboR request) {
        Combo combo = new Combo();
        combo.setNombre(request.nombre());
        combo.setPrecio(request.precio());
        combo.setActivo(request.activo() != null ? request.activo() : true);
        combo.setImgUrl("--");
        Combo guardado = comboRepo.save(combo);

        if (request.items() != null) {
            for (ComboR.ComboItemR itemR : request.items()) {
                Producto producto = productoRepo.findById(itemR.productoId())
                        .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + itemR.productoId()));
                ComboItem item = new ComboItem();
                item.setCombo(guardado);
                item.setProducto(producto);
                item.setCantidad(itemR.cantidad());
                item.setPrecioUnitario(itemR.precioUnitario());
                comboItemRepo.save(item);
            }
        }

        return new ComboDTO(comboRepo.findById(guardado.getComboId()).orElseThrow());
    }

    @Override
    public ComboDTO obtenerPorId(Long id) {
        Combo combo = comboRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Combo no encontrado con ID: " + id));
        return new ComboDTO(combo);
    }

    @Override
    public List<ComboDTO> obtenerTodos() {
        return comboRepo.findAll().stream().map(ComboDTO::new).toList();
    }

    @Override
    public List<ComboDTO> obtenerActivos() {
        return comboRepo.findByActivoTrue().stream().map(ComboDTO::new).toList();
    }

    @Override
    public Page<ComboDTO> obtenerPaginado(Pageable pageable) {
        return comboRepo.findAll(pageable).map(ComboDTO::new);
    }

    @Override
    @Transactional
    public ComboDTO actualizar(Long id, ComboR request) {
        Combo combo = comboRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Combo no encontrado con ID: " + id));

        if (request.nombre() != null) combo.setNombre(request.nombre());
        if (request.precio() != null) combo.setPrecio(request.precio());
        if (request.activo() != null) combo.setActivo(request.activo());
        if (request.imgUrl() != null) combo.setImgUrl(request.imgUrl());

        if (request.items() != null) {
            List<ComboItem> existentes = comboItemRepo.findByComboComboId(id);
            comboItemRepo.deleteAll(existentes);

            for (ComboR.ComboItemR itemR : request.items()) {
                Producto producto = productoRepo.findById(itemR.productoId())
                        .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + itemR.productoId()));
                ComboItem item = new ComboItem();
                item.setCombo(combo);
                item.setProducto(producto);
                item.setCantidad(itemR.cantidad());
                item.setPrecioUnitario(itemR.precioUnitario());
                comboItemRepo.save(item);
            }
        }

        return new ComboDTO(comboRepo.save(combo));
    }

    @Override
    public void eliminar(Long id) {
        if (!comboRepo.existsById(id)) {
            throw new NotFoundException("Combo no encontrado con ID: " + id);
        }
        comboRepo.deleteById(id);
    }
}
