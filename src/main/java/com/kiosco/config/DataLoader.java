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
        cargarCategorias();
        cargarMarcas();
        if (adminRepo.count() == 0) {
            cargarAdmins();
        }
    }

    private void cargarAdmins() {
        Administrador adminBruno = new Administrador();
        adminBruno.setNombre("Bruno");
        adminBruno.setApellido("Ferreira");
        adminBruno.setWhatsApp("3743614796");
        adminBruno.setContrasenia(passwordEncoder.encode("42273555"));
        adminBruno.setEstado(true);

        Administrador adminSol = new Administrador();
        adminSol.setNombre("Sol Angeles");
        adminSol.setApellido("Ferreira");
        adminSol.setWhatsApp("3743582264");
        adminSol.setContrasenia(passwordEncoder.encode("41091041"));
        adminSol.setEstado(true);

        Administrador adminIsabel = new Administrador();
        adminIsabel.setNombre("Ana Isabel");
        adminIsabel.setApellido("Pittana");
        adminIsabel.setWhatsApp("3743445199");
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

  /*  private List<Producto> cargarProductosDePrueba() {
        if (productoRepo.count() > 0) {
            return productoRepo.findAll();
        }
        Producto milanesa = new Producto();
        milanesa.setNombre("Milanesa con papas");
        milanesa.setPrecioCosto(new BigDecimal("800"));
        milanesa.setPrecioVenta(new BigDecimal("1500"));
        milanesa.setUnidadMedida(UnidadMedida.UNIDAD);
        milanesa.setStock(50);
        milanesa.setEstado(true);
        milanesa.setFechaRegistro(LocalDate.now());

        Producto pollo = new Producto();
        pollo.setNombre("Pollo al horno con ensalada");
        pollo.setPrecioCosto(new BigDecimal("750"));
        pollo.setPrecioVenta(new BigDecimal("1400"));
        pollo.setUnidadMedida(UnidadMedida.UNIDAD);
        pollo.setStock(50);
        pollo.setEstado(true);
        pollo.setFechaRegistro(LocalDate.now());

        Producto pizza = new Producto();
        pizza.setNombre("Pizza de muzzarella");
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

        Producto ensalada = new Producto();
        ensalada.setNombre("Ensalada mixta");
        ensalada.setPrecioCosto(new BigDecimal("400"));
        ensalada.setPrecioVenta(new BigDecimal("800"));
        ensalada.setUnidadMedida(UnidadMedida.UNIDAD);
        ensalada.setStock(30);
        ensalada.setEstado(true);
        ensalada.setFechaRegistro(LocalDate.now());

        Producto fideos = new Producto();
        fideos.setNombre("Fideos con tuco");
        fideos.setPrecioCosto(new BigDecimal("500"));
        fideos.setPrecioVenta(new BigDecimal("1100"));
        fideos.setUnidadMedida(UnidadMedida.UNIDAD);
        fideos.setStock(40);
        fideos.setEstado(true);
        fideos.setFechaRegistro(LocalDate.now());

        Producto postre = new Producto();
        postre.setNombre("Postre flan con dulce");
        postre.setPrecioCosto(new BigDecimal("300"));
        postre.setPrecioVenta(new BigDecimal("600"));
        postre.setUnidadMedida(UnidadMedida.UNIDAD);
        postre.setStock(30);
        postre.setEstado(true);
        postre.setFechaRegistro(LocalDate.now());

        return productoRepo.saveAll(List.of(
                milanesa, pollo, pizza, empanada, hamburguesa,
                coca, agua, ensalada, fideos, postre
        ));
    }

    private void cargarMenusDiarios() {
        if (menuDiarioRepo.count() > 0) return;

        LocalDate hoy = LocalDate.now();

        crearMenu("Menú Milanesa con puré", new BigDecimal("1500"), hoy.minusDays(2));
        crearMenu("Menú Pollo con ensalada", new BigDecimal("1400"), hoy.minusDays(1));
        crearMenu("Menú Pizza libre", new BigDecimal("1200"), hoy);
        crearMenu("Menú Hamburguesa premium", new BigDecimal("1800"), hoy.plusDays(1));
        crearMenu("Menú Fideos al pesto", new BigDecimal("1100"), hoy.plusDays(2));
    }

    private void crearMenu(String nombre, BigDecimal precio, LocalDate fecha) {
        MenuDiario menu = new MenuDiario();
        menu.setNombre(nombre);
        menu.setPrecio(precio);
        menu.setFecha(fecha);
        menuDiarioRepo.save(menu);
    }

    private void cargarCombos(List<Producto> productos) {
        if (comboRepo.count() > 0) return;

        crearCombo("Combo Milanesa + Coca", new BigDecimal("2000"), true, productos.get(0), 1, productos.get(5), 1);
        crearCombo("Combo Pollo + Agua", new BigDecimal("1700"), true, productos.get(1), 1, productos.get(6), 1);
        crearCombo("Combo Pizza + Coca", new BigDecimal("1700"), true, productos.get(2), 1, productos.get(5), 1);
        crearCombo("Combo Empanadas x4 + Agua", new BigDecimal("1900"), true, productos.get(3), 4, productos.get(6), 1);
        crearCombo("Combo Hamburguesa + Coca", new BigDecimal("2300"), true, productos.get(4), 1, productos.get(5), 1);
        crearCombo("Combo Fideos + Postre", new BigDecimal("1600"), true, productos.get(8), 1, productos.get(9), 1);
        crearCombo("Combo Milanesa + Ensalada", new BigDecimal("2200"), true, productos.get(0), 1, productos.get(7), 1);
        crearCombo("Combo Pollo + Postre + Agua", new BigDecimal("2100"), true, productos.get(1), 1, productos.get(9), 1, productos.get(6), 1);
        crearCombo("Combo Familiar Pizza x2", new BigDecimal("2200"), true, productos.get(2), 2, null, 0);
        crearCombo("Combo Empanadas x6 + Coca", new BigDecimal("2500"), true, productos.get(3), 6, productos.get(5), 1);
    }

    private void crearCombo(String nombre, BigDecimal precio, boolean activo,
                            Producto p1, int c1, Producto p2, int c2) {
        Combo combo = new Combo();
        combo.setNombre(nombre);
        combo.setPrecio(precio);
        combo.setActivo(activo);
        Combo guardado = comboRepo.save(combo);

        ComboItem item1 = new ComboItem();
        item1.setCombo(guardado);
        item1.setProducto(p1);
        item1.setCantidad(c1);
        item1.setPrecioUnitario(p1.getPrecioVenta());
        comboItemRepo.save(item1);

        if (p2 != null) {
            ComboItem item2 = new ComboItem();
            item2.setCombo(guardado);
            item2.setProducto(p2);
            item2.setCantidad(c2);
            item2.setPrecioUnitario(p2.getPrecioVenta());
            comboItemRepo.save(item2);
        }
    }

    private void crearCombo(String nombre, BigDecimal precio, boolean activo,
                            Producto p1, int c1, Producto p2, int c2, Producto p3, int c3) {
        Combo combo = new Combo();
        combo.setNombre(nombre);
        combo.setPrecio(precio);
        combo.setActivo(activo);
        Combo guardado = comboRepo.save(combo);

        ComboItem item1 = new ComboItem();
        item1.setCombo(guardado);
        item1.setProducto(p1);
        item1.setCantidad(c1);
        item1.setPrecioUnitario(p1.getPrecioVenta());
        comboItemRepo.save(item1);

        ComboItem item2 = new ComboItem();
        item2.setCombo(guardado);
        item2.setProducto(p2);
        item2.setCantidad(c2);
        item2.setPrecioUnitario(p2.getPrecioVenta());
        comboItemRepo.save(item2);

        ComboItem item3 = new ComboItem();
        item3.setCombo(guardado);
        item3.setProducto(p3);
        item3.setCantidad(c3);
        item3.setPrecioUnitario(p3.getPrecioVenta());
        comboItemRepo.save(item3);
    }*/
}
