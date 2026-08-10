package com.kiosco.config;

import com.kiosco.UnidadMedida;
import com.kiosco.model.Combo;
import com.kiosco.model.ComboItem;
import com.kiosco.model.MenuDiario;
import com.kiosco.model.Producto;
import com.kiosco.model.subModel.Administrador;
import com.kiosco.repository.AdminRepo;
import com.kiosco.repository.ComboItemRepo;
import com.kiosco.repository.ComboRepo;
import com.kiosco.repository.MenuDiarioRepo;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.utils.CategoriaFileService;
import com.kiosco.utils.MarcaFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final AdminRepo adminRepo;
    private final MarcaFileService marcaFileService;
    private final CategoriaFileService categoriaFileService;
    private final PasswordEncoder passwordEncoder;
    private final ProductoRepo productoRepo;
    private final MenuDiarioRepo menuDiarioRepo;
    private final ComboRepo comboRepo;
    private final ComboItemRepo comboItemRepo;

    @Override
    public void run(String... args) throws Exception {
        cargarAdmins();
        cargarCategorias();
        cargarMarcas();
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

    private List<Producto> cargarProductosDePrueba() {
        if (productoRepo.count() > 0) {
            return productoRepo.findAll();
        }
        Producto milanesa = new Producto();
        milanesa.setNombre("Milanesa de Pollo");
        milanesa.setPrecioCosto(new BigDecimal("800"));
        milanesa.setPrecioVenta(new BigDecimal("1500"));
        milanesa.setUnidadMedida(UnidadMedida.UNIDAD);
        milanesa.setStock(50);
        milanesa.setEstado(true);
        milanesa.setFechaRegistro(LocalDate.now());

        Producto pollo = new Producto();
        pollo.setNombre("Pollo Pata Muslo");
        pollo.setPrecioCosto(new BigDecimal("750"));
        pollo.setPrecioVenta(new BigDecimal("1400"));
        pollo.setUnidadMedida(UnidadMedida.UNIDAD);
        pollo.setStock(50);
        pollo.setEstado(true);
        pollo.setFechaRegistro(LocalDate.now());

        Producto pizza = new Producto();
        pizza.setNombre("Pizza Caseras");
        pizza.setPrecioCosto(new BigDecimal("600"));
        pizza.setPrecioVenta(new BigDecimal("1200"));
        pizza.setUnidadMedida(UnidadMedida.UNIDAD);
        pizza.setStock(30);
        pizza.setEstado(true);
        pizza.setFechaRegistro(LocalDate.now());

        Producto empanada = new Producto();
        empanada.setNombre("Empanada de carne");
        empanada.setPrecioCosto(new BigDecimal("200"));
        empanada.setPrecioVenta(new BigDecimal("400"));
        empanada.setUnidadMedida(UnidadMedida.UNIDAD);
        empanada.setStock(100);
        empanada.setEstado(true);
        empanada.setFechaRegistro(LocalDate.now());

        Producto hamburguesa = new Producto();
        hamburguesa.setNombre("Hamburguesa completa");
        hamburguesa.setPrecioCosto(new BigDecimal("900"));
        hamburguesa.setPrecioVenta(new BigDecimal("1800"));
        hamburguesa.setUnidadMedida(UnidadMedida.UNIDAD);
        hamburguesa.setStock(40);
        hamburguesa.setEstado(true);
        hamburguesa.setFechaRegistro(LocalDate.now());

        Producto coca = new Producto();
        coca.setNombre("Coca-Cola 500ml");
        coca.setPrecioCosto(new BigDecimal("300"));
        coca.setPrecioVenta(new BigDecimal("600"));
        coca.setUnidadMedida(UnidadMedida.UNIDAD);
        coca.setStock(200);
        coca.setEstado(true);
        coca.setFechaRegistro(LocalDate.now());

        Producto agua = new Producto();
        agua.setNombre("Agua mineral 500ml");
        agua.setPrecioCosto(new BigDecimal("150"));
        agua.setPrecioVenta(new BigDecimal("350"));
        agua.setUnidadMedida(UnidadMedida.UNIDAD);
        agua.setStock(200);
        agua.setEstado(true);
        agua.setFechaRegistro(LocalDate.now());


        return productoRepo.saveAll(List.of(milanesa, pollo, pizza, empanada, hamburguesa, coca, agua));
    }

}
