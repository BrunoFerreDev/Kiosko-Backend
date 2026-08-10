package com.kiosco.config;


import com.kiosco.model.subModel.Administrador;
import com.kiosco.repository.AdminRepo;
import com.kiosco.repository.ComboItemRepo;
import com.kiosco.repository.ComboRepo;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.utils.CategoriaFileService;
import com.kiosco.utils.MarcaFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final AdminRepo adminRepo;
    private final MarcaFileService marcaFileService;
    private final CategoriaFileService categoriaFileService;
    private final PasswordEncoder passwordEncoder;
    private final ProductoRepo productoRepo;
    private final ComboRepo comboRepo;
    private final ComboItemRepo comboItemRepo;

    @Override
    public void run(String... args) throws Exception {
        if (adminRepo.count() == 0) {
            cargarAdmins();
        }
        if (categoriaFileService.obtenerTodas().isEmpty()) {
            cargarCategorias();
        }
        if (marcaFileService.obtenerTodas().isEmpty()) {
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
        if (categoriaFileService.obtenerTodas().isEmpty()) {
            categoriaFileService.crearCategoria("BEBIDAS", "Bebidas y Gaseosas", "Gaseosas, aguas, jugos y aguas saborizadas");
            categoriaFileService.crearCategoria("GOLOSINAS", "Golosinas y Chocolates", "Alfajores, caramelos, chicles y chocolates");
            categoriaFileService.crearCategoria("ALMACEN", "Almacén y Galletitas", "Yerba, azúcar, galletitas dulces y saladas, fideos");
            categoriaFileService.crearCategoria("CIGARRILLOS", "Cigarrillos y Tabaco", "Atados de cigarrillos, encendedores y sedas");
            categoriaFileService.crearCategoria("FIAMBRERIA", "Fiambrería y Lácteos", "Quesos, fiambres, yogures, leches y manteca");
            categoriaFileService.crearCategoria("CASERO", "Comidas Caseras", "Comidas caseeras, pizza, hamburguesa");
        }
    }

    private void cargarMarcas() {
        if (marcaFileService.obtenerTodas().isEmpty()) {
            marcaFileService.crearMarca("COCA_COLA", "Coca-Cola");
            marcaFileService.crearMarca("PEPSICO", "PepsiCo");
            marcaFileService.crearMarca("ARCOR", "Arcor");
            marcaFileService.crearMarca("BAGLEY", "Bagley");
            marcaFileService.crearMarca("LA_SERENISIMA", "La Serenísima");
            marcaFileService.crearMarca("MARLBORO", "Marlboro");
            marcaFileService.crearMarca("MONTECATINI", "Montecatini");
            marcaFileService.crearMarca("PPTS", "Los pipitos,marca del kiosco");
        }
    }

}
