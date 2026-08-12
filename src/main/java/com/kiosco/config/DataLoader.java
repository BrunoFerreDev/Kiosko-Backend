package com.kiosco.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiosco.model.Categoria;
import com.kiosco.model.Marca;
import com.kiosco.model.subModel.Administrador;
import com.kiosco.repository.AdminRepo;
import com.kiosco.repository.CategoriaRepo;
import com.kiosco.repository.MarcaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final AdminRepo adminRepo;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepo categoriaRepo;
    private final MarcaRepo marcaRepo;
    private final ObjectMapper objectMapper;

    @Value("${app.storage.categorias-path:./data/categorias.json}")
    private String categoriasPath;

    @Value("${app.storage.marcas-path:./data/marcas.json}")
    private String marcasPath;

    @Override
    public void run(String... args) throws Exception {
        if (adminRepo.count() == 0) {
            cargarAdmins();
        }
        if (categoriaRepo.count() == 0) {
            cargarCategorias();
        }
        if (marcaRepo.count() == 0) {
            cargarMarcas();
        }
    }

    private void cargarAdmins() {
        Administrador adminBruno = new Administrador();
        adminBruno.setNombre("Bruno M");
        adminBruno.setApellido("Ferreira");
        adminBruno.setWhatsApp("37436147969");
        adminBruno.setContrasenia(passwordEncoder.encode("42273555"));
        adminBruno.setEstado(true);

        Administrador adminSol = new Administrador();
        adminSol.setNombre("Sol Angeles");
        adminSol.setApellido("Ferreira");
        adminSol.setWhatsApp("37435822649");
        adminSol.setContrasenia(passwordEncoder.encode("41091041"));
        adminSol.setEstado(true);

        Administrador adminIsabel = new Administrador();
        adminIsabel.setNombre("Ana Isabel");
        adminIsabel.setApellido("Pittana");
        adminIsabel.setWhatsApp("37434451999");
        adminIsabel.setContrasenia(passwordEncoder.encode("17807819"));
        adminIsabel.setEstado(true);

        adminRepo.save(adminBruno);
        adminRepo.save(adminSol);
        adminRepo.save(adminIsabel);
    }

    private void cargarCategorias() {
        try {
            File file = new File(categoriasPath);
            if (file.exists()) {
                List<Categoria> data = objectMapper.readValue(file, new TypeReference<List<Categoria>>() {});
                List<Categoria> nuevas = data.stream().map(c -> {
                    Categoria nueva = new Categoria();
                    nueva.setCodigo(c.getCodigo());
                    nueva.setNombre(c.getNombre());
                    nueva.setDescripcion(c.getDescripcion());
                    return nueva;
                }).toList();
                categoriaRepo.saveAll(nuevas);
            }
        } catch (Exception e) {
            System.err.println("Error al cargar categorias desde JSON: " + e.getMessage());
        }
    }

    private void cargarMarcas() {
        try {
            File file = new File(marcasPath);
            if (file.exists()) {
                List<Marca> data = objectMapper.readValue(file, new TypeReference<List<Marca>>() {});
                List<Marca> nuevas = data.stream().map(m -> {
                    Marca nueva = new Marca();
                    nueva.setCodigo(m.getCodigo());
                    nueva.setNombre(m.getNombre());
                    return nueva;
                }).toList();
                marcaRepo.saveAll(nuevas);
            }
        } catch (Exception e) {
            System.err.println("Error al cargar marcas desde JSON: " + e.getMessage());
        }
    }
}
