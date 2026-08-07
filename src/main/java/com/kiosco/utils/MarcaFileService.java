package com.kiosco.utils;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiosco.record.MarcaR;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class MarcaFileService {

    private final ObjectMapper objectMapper;

    @Value("${app.storage.marcas-path:./data/marcas.json}")
    private String filePath;

    private final List<MarcaR> marcas = new CopyOnWriteArrayList<>();

    public MarcaFileService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        cargarDesdeArchivo();
    }

    private synchronized void cargarDesdeArchivo() {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                if (file.getParentFile() != null) file.getParentFile().mkdirs();
                guardarEnDisco(new ArrayList<>());
            } else {
                List<MarcaR> data = objectMapper.readValue(file, new TypeReference<List<MarcaR>>() {
                });
                marcas.clear();
                marcas.addAll(data);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al cargar marcas desde JSON", e);
        }
    }

    private synchronized void guardarEnDisco(List<MarcaR> data) throws IOException {
        File file = new File(filePath);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, data);
    }

    public List<MarcaR> obtenerTodas() {
        return List.copyOf(marcas);
    }

    public Optional<MarcaR> buscarPorId(Long id) {
        return marcas.stream().filter(m -> m.id().equals(id)).findFirst();
    }

    public List<Long> buscarIdsPorNombre(String nombre) {
        String lower = nombre.toLowerCase();
        return marcas.stream()
                .filter(m -> m.nombre() != null && m.nombre().toLowerCase().contains(lower))
                .map(MarcaR::id)
                .toList();
    }

    public synchronized MarcaR crearMarca(String codigo, String nombre) {
        Long nuevoId = marcas.stream().mapToLong(MarcaR::id).max().orElse(0L) + 1;
        MarcaR nueva = new MarcaR(nuevoId, codigo.toUpperCase(), nombre);

        marcas.add(nueva);
        try {
            guardarEnDisco(new ArrayList<>(marcas));
        } catch (IOException e) {
            marcas.remove(nueva);
            throw new RuntimeException("Error al escribir marca en JSON", e);
        }
        return nueva;
    }
}