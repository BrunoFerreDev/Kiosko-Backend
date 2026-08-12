package com.kiosco.service;

import com.kiosco.model.Marca;
import com.kiosco.record.MarcaR;
import com.kiosco.repository.MarcaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarcaService {
    private final MarcaRepo marcaRepo;

    public List<MarcaR> obtenerTodas() {
        return marcaRepo.findAll().stream()
                .map(m -> new MarcaR(m.getId(), m.getCodigo(), m.getNombre()))
                .collect(Collectors.toList());
    }

    public MarcaR obtenerPorId(Long id) {
        Marca m = marcaRepo.findById(id).orElseThrow(() -> new RuntimeException("Marca no encontrada"));
        return new MarcaR(m.getId(), m.getCodigo(), m.getNombre());
    }

    public MarcaR crearMarca(MarcaR request) {
        Marca m = new Marca();
        m.setCodigo(request.codigo());
        m.setNombre(request.nombre());
        m = marcaRepo.save(m);
        return new MarcaR(m.getId(), m.getCodigo(), m.getNombre());
    }

    public MarcaR actualizarMarca(Long id, MarcaR request) {
        Marca m = marcaRepo.findById(id).orElseThrow(() -> new RuntimeException("Marca no encontrada"));
        m.setCodigo(request.codigo());
        m.setNombre(request.nombre());
        m = marcaRepo.save(m);
        return new MarcaR(m.getId(), m.getCodigo(), m.getNombre());
    }

    public void eliminarMarca(Long id) {
        marcaRepo.deleteById(id);
    }
}
