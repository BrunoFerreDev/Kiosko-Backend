package com.kiosco.service;

import com.kiosco.model.Categoria;
import com.kiosco.record.CategoriaR;
import com.kiosco.repository.CategoriaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepo categoriaRepo;

    public List<CategoriaR> obtenerTodas() {
        return categoriaRepo.findAll().stream()
                .map(c -> new CategoriaR(c.getId(), c.getCodigo(), c.getNombre(), c.getDescripcion()))
                .collect(Collectors.toList());
    }

    public CategoriaR obtenerPorId(Long id) {
        Categoria c = categoriaRepo.findById(id).orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
        return new CategoriaR(c.getId(), c.getCodigo(), c.getNombre(), c.getDescripcion());
    }

    public CategoriaR crearCategoria(CategoriaR request) {
        Categoria c = new Categoria();
        c.setCodigo(request.codigo());
        c.setNombre(request.nombre());
        c.setDescripcion(request.descripcion());
        c = categoriaRepo.save(c);
        return new CategoriaR(c.getId(), c.getCodigo(), c.getNombre(), c.getDescripcion());
    }

    public CategoriaR actualizarCategoria(Long id, CategoriaR request) {
        Categoria c = categoriaRepo.findById(id).orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
        c.setCodigo(request.codigo());
        c.setNombre(request.nombre());
        c.setDescripcion(request.descripcion());
        c = categoriaRepo.save(c);
        return new CategoriaR(c.getId(), c.getCodigo(), c.getNombre(), c.getDescripcion());
    }

    public void eliminarCategoria(Long id) {
        categoriaRepo.deleteById(id);
    }
}
