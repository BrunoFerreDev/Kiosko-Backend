package com.kiosco.config;

import com.kiosco.UnidadMedida;
import com.kiosco.model.Administrador;
import com.kiosco.model.Cliente;
import com.kiosco.model.Producto;
import com.kiosco.record.CategoriaR;
import com.kiosco.record.MarcaR;
import com.kiosco.repository.AdminRepo;
import com.kiosco.repository.ClienteRepo;
import com.kiosco.repository.PersonaRepo;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.utils.CategoriaFileService;
import com.kiosco.utils.MarcaFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final AdminRepo adminRepo;
    private final ClienteRepo clienteRepo;
    private final ProductoRepo productoRepo;
    private final MarcaFileService marcaFileService;
    private final CategoriaFileService categoriaFileService;
    private final PasswordEncoder passwordEncoder;

    @Override

    public void run(String... args) throws Exception {

        if (adminRepo.count() == 0) {
            cargarAdmins();
        }
    }

    private void cargarAdmins() {
        Administrador administrador = new Administrador();
        administrador.setNombre("Bruno");
        administrador.setApellido("Ferreira");
        administrador.setWhatsApp("3743614796");
        administrador.setContrasenia(passwordEncoder.encode("123456"));
        administrador.setEstado(true);
        adminRepo.save(administrador);
    }
}
