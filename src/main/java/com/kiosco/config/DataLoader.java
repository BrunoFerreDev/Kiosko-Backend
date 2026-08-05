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

        Administrador adminBruno = new Administrador();
        adminBruno.setNombre("Bruno");
        adminBruno.setApellido("Ferreira");
        adminBruno.setWhatsApp("3743614796");
        adminBruno.setContrasenia(passwordEncoder.encode("123456"));
        adminBruno.setEstado(true);

        Administrador adminSol = new Administrador();
        adminSol.setNombre("Sol Angeles");
        adminSol.setApellido("Ferreira");
        adminSol.setWhatsApp("3743582264");
        adminSol.setContrasenia(passwordEncoder.encode("123456"));
        adminSol.setEstado(true);

        Administrador adminIsabel = new Administrador();
        adminIsabel.setNombre("Ana Isabel");
        adminIsabel.setApellido("Pittana");
        adminIsabel.setWhatsApp("3743445199");
        adminIsabel.setContrasenia(passwordEncoder.encode("123456"));
        adminIsabel.setEstado(true);

        adminRepo.save(adminBruno);
        adminRepo.save(adminSol);
        adminRepo.save(adminIsabel);
    }
}
