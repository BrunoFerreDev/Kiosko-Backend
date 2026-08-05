package com.kiosco.utils;

import com.kiosco.record.CategoriaR;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class CategoriaFileService {

    private final ObjectMapper objectMapper;

    @Value("${app.storage.categorias-path:./data/categorias.json}")
    private String filePath;

    private final List<CategoriaR> categorias = new CopyOnWriteArrayList<>();

    public CategoriaFileService(ObjectMapper objectMapper) {
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
                List<CategoriaR> data = objectMapper.readValue(file, new TypeReference<List<CategoriaR>>() {
                });
                categorias.clear();
                categorias.addAll(data);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al cargar categorías desde JSON", e);
        }
    }

    private synchronized void guardarEnDisco(List<CategoriaR> data) throws IOException {
        File file = new File(filePath);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, data);
    }

    public List<CategoriaR> obtenerTodas() {
        return List.copyOf(categorias);
    }

    public Optional<CategoriaR> buscarPorId(Long id) {
        return categorias.stream().filter(c -> c.id().equals(id)).findFirst();
    }

    public synchronized CategoriaR crearCategoria(String codigo, String nombre, String descripcion) {
        Long nuevoId = categorias.stream().mapToLong(CategoriaR::id).max().orElse(0L) + 1;
        CategoriaR nueva = new CategoriaR(nuevoId, codigo.toUpperCase(), nombre, descripcion);

        categorias.add(nueva);
        try {
            guardarEnDisco(new ArrayList<>(categorias));
        } catch (IOException e) {
            categorias.remove(nueva);
            throw new RuntimeException("Error al escribir categoría en JSON", e);
        }
        return nueva;
    }
}
