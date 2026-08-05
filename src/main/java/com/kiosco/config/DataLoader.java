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
        if (clienteRepo.count() == 0) {
            cargarClientes();
        }
        if (productoRepo.count() == 0) {
            cargarProductos();
        }
        if (adminRepo.count() == 0) {
            cargarAdmins();
        }
    }

    private void cargarClientes() {
        List<Cliente> clientes = new ArrayList<>();
        String[] nombres = {"Juan", "Maria", "Carlos", "Ana", "Pedro", "Lucia", "Diego", "Sofia", "Gabriel", "Valentina"};
        String[] apellidos = {"Gomez", "Perez", "Rodriguez", "Lopez", "Gonzalez", "Fernandez", "Martinez", "Sanchez", "Romero", "Torres"};

        for (int i = 0; i < 10; i++) {
            Cliente c = new Cliente();
            c.setNombre(nombres[i]);
            c.setApellido(apellidos[i]);
            c.setWhatsApp("11223344" + i);
            c.setEstado(true);
            c.setFechaRegistro(LocalDate.now());
            c.setContrasenia(passwordEncoder.encode("123456"));
            clientes.add(c);
        }
        clienteRepo.saveAll(clientes);
    }

    private void cargarProductos() {
        List<Producto> productos = new ArrayList<>();

        Object[][] datosProductos = {
                // Golosinas (Arcor / Nestlé)
                {"Alfajor Bon o Bon", "Arcor", "Golosinas", new BigDecimal("450.00"), new BigDecimal("700.00"), 30},
                {"Bon o Bon Leche", "Arcor", "Golosinas", new BigDecimal("200.00"), new BigDecimal("350.00"), 50},
                {"Turrón Maní Arcor", "Arcor", "Golosinas", new BigDecimal("150.00"), new BigDecimal("250.00"), 40},
                {"Chocolate Aguila Semiamargo", "Arcor", "Golosinas", new BigDecimal("900.00"), new BigDecimal("1400.00"), 20},
                {"Rocklets Leche 40g", "Arcor", "Golosinas", new BigDecimal("350.00"), new BigDecimal("550.00"), 25},
                {"Butter Toffees Menta", "Arcor", "Golosinas", new BigDecimal("100.00"), new BigDecimal("180.00"), 60},
                {"Chupetín Mister Pop", "Arcor", "Golosinas", new BigDecimal("80.00"), new BigDecimal("150.00"), 45},
                {"KitKat 4 Cuerpos", "Nestlé", "Golosinas", new BigDecimal("600.00"), new BigDecimal("950.00"), 35},
                {"Caramelos Sugus Confitados", "Arcor", "Golosinas", new BigDecimal("250.00"), new BigDecimal("400.00"), 50},
                {"Chocolate Garoto Surtido", "Nestlé", "Golosinas", new BigDecimal("1200.00"), new BigDecimal("1800.00"), 15},

                // Bebidas (Coca-Cola / Nestlé / Arcor)
                {"Coca-Cola Original 500ml", "Coca-Cola", "Bebidas", new BigDecimal("700.00"), new BigDecimal("1100.00"), 40},
                {"Coca-Cola Sin Azúcar 500ml", "Coca-Cola", "Bebidas", new BigDecimal("700.00"), new BigDecimal("1100.00"), 35},
                {"Sprite Lima Limón 500ml", "Coca-Cola", "Bebidas", new BigDecimal("680.00"), new BigDecimal("1050.00"), 30},
                {"Fanta Naranja 500ml", "Coca-Cola", "Bebidas", new BigDecimal("680.00"), new BigDecimal("1050.00"), 25},
                {"Powerade Mountain Blast 500ml", "Coca-Cola", "Bebidas", new BigDecimal("800.00"), new BigDecimal("1250.00"), 20},
                {"Cepita Naranja 300ml", "Coca-Cola", "Bebidas", new BigDecimal("450.00"), new BigDecimal("700.00"), 25},
                {"Aquarius Manzana 500ml", "Coca-Cola", "Bebidas", new BigDecimal("600.00"), new BigDecimal("950.00"), 20},
                {"Monster Energy 473ml", "Coca-Cola", "Bebidas", new BigDecimal("1100.00"), new BigDecimal("1700.00"), 30},
                {"Agua Benedictino Sin Gas 500ml", "Coca-Cola", "Bebidas", new BigDecimal("350.00"), new BigDecimal("600.00"), 50},
                {"Nescafé Espresso Listo para Tomar", "Nestlé", "Bebidas", new BigDecimal("850.00"), new BigDecimal("1300.00"), 15},

                // Snacks (Lays)
                {"Papas Fritas Lays Clásicas 85g", "Lays", "Snacks", new BigDecimal("850.00"), new BigDecimal("1350.00"), 25},
                {"Papas Fritas Lays Acanaladas 85g", "Lays", "Snacks", new BigDecimal("850.00"), new BigDecimal("1350.00"), 20},
                {"Doritos Queso Nacho 90g", "Lays", "Snacks", new BigDecimal("900.00"), new BigDecimal("1450.00"), 30},
                {"Cheetos Queso 80g", "Lays", "Snacks", new BigDecimal("750.00"), new BigDecimal("1200.00"), 25},
                {"3D 3 Arroyos Queso 75g", "Lays", "Snacks", new BigDecimal("700.00"), new BigDecimal("1100.00"), 20},
                {"Papas Fritas Lays Stax 134g", "Lays", "Snacks", new BigDecimal("1500.00"), new BigDecimal("2300.00"), 15},
                {"Chizitos Lays 80g", "Lays", "Snacks", new BigDecimal("700.00"), new BigDecimal("1100.00"), 22},
                {"Maní Pehuamar Salado 100g", "Lays", "Snacks", new BigDecimal("500.00"), new BigDecimal("800.00"), 40},
                {"Conos Lays 80g", "Lays", "Snacks", new BigDecimal("750.00"), new BigDecimal("1200.00"), 18},
                {"Nachos Lays Queso 90g", "Lays", "Snacks", new BigDecimal("900.00"), new BigDecimal("1450.00"), 16},

                // Lácteos (La Serenísima / Nestlé)
                {"Leche La Serenísima Entera 1L", "La Serenísima", "Lácteos", new BigDecimal("950.00"), new BigDecimal("1300.00"), 30},
                {"Leche La Serenísima Descremada 1L", "La Serenísima", "Lácteos", new BigDecimal("950.00"), new BigDecimal("1300.00"), 25},
                {"Yogurísimo Frutilla Batido 190g", "La Serenísima", "Lácteos", new BigDecimal("550.00"), new BigDecimal("850.00"), 20},
                {"Yogurísimo Vainilla Firme 190g", "La Serenísima", "Lácteos", new BigDecimal("550.00"), new BigDecimal("850.00"), 20},
                {"Chocolitada Cindor 1L", "La Serenísima", "Lácteos", new BigDecimal("1400.00"), new BigDecimal("2100.00"), 15},
                {"Danonino Frutilla 100g", "La Serenísima", "Lácteos", new BigDecimal("400.00"), new BigDecimal("650.00"), 18},
                {"Queso Cremón 500g", "La Serenísima", "Lácteos", new BigDecimal("2800.00"), new BigDecimal("4200.00"), 10},
                {"Manteca La Serenísima 200g", "La Serenísima", "Lácteos", new BigDecimal("1600.00"), new BigDecimal("2400.00"), 12},
                {"Dulce de Leche La Serenísima 400g", "La Serenísima", "Lácteos", new BigDecimal("1200.00"), new BigDecimal("1800.00"), 22},
                {"Crema de Leche La Serenísima 200ml", "La Serenísima", "Lácteos", new BigDecimal("1100.00"), new BigDecimal("1650.00"), 14},

                // Galletitas (Arcor / Nestlé / La Serenísima)
                {"Galletitas Chocolinas 170g", "Arcor", "Galletitas", new BigDecimal("650.00"), new BigDecimal("1000.00"), 35},
                {"Galletitas Sonrisas 108g", "Arcor", "Galletitas", new BigDecimal("450.00"), new BigDecimal("720.00"), 28},
                {"Galletitas Formis Frutilla 100g", "Arcor", "Galletitas", new BigDecimal("420.00"), new BigDecimal("680.00"), 24},
                {"Galletitas Maná Vainilla 145g", "Arcor", "Galletitas", new BigDecimal("500.00"), new BigDecimal("800.00"), 30},
                {"Galletitas Rumba 112g", "Arcor", "Galletitas", new BigDecimal("480.00"), new BigDecimal("750.00"), 26},
                {"Galletitas Mellizas 112g", "Arcor", "Galletitas", new BigDecimal("480.00"), new BigDecimal("750.00"), 22},
                {"Galletitas Criollitas 100g", "Arcor", "Galletitas", new BigDecimal("380.00"), new BigDecimal("600.00"), 40},
                {"Galletitas Traviata 101g", "Arcor", "Galletitas", new BigDecimal("380.00"), new BigDecimal("600.00"), 35},
                {"Cerealitas Lino y Chía 200g", "Arcor", "Galletitas", new BigDecimal("750.00"), new BigDecimal("1150.00"), 18},
                {"Galletitas Saladix Jamón 100g", "Arcor", "Galletitas", new BigDecimal("550.00"), new BigDecimal("880.00"), 30}
        };

        for (Object[] item : datosProductos) {
            String nombreMarca = (String) item[1];
            String nombreCategoria = (String) item[2];

            Long marcaId = marcaFileService.obtenerTodas().stream()
                    .filter(m -> m.nombre() != null && m.nombre().equalsIgnoreCase(nombreMarca))
                    .map(MarcaR::id)
                    .findFirst()
                    .orElse(null);

            // 2. Buscar el ID de la Categoría en categorias.json por su nombre
            Long categoriaId = categoriaFileService.obtenerTodas().stream()
                    .filter(c -> c.nombre().equalsIgnoreCase(nombreCategoria))
                    .map(CategoriaR::id)
                    .findFirst()
                    .orElse(null); // O asignar un ID por defecto si no existe

            Producto p = new Producto();
            p.setNombre((String) item[0]);
            p.setMarcaId(marcaId);         // Pasamos el Long marcaId
            p.setCategoriaId(categoriaId); // Pasamos el Long categoriaId
            p.setPrecioCosto((BigDecimal) item[3]);
            p.setPrecioVenta((BigDecimal) item[4]);
            p.setStock((Integer) item[5]);
            p.setEstado(true);
            p.setUnidadMedida(UnidadMedida.UNIDAD);
            p.setFechaRegistro(LocalDate.now());
            productos.add(p);
        }
        productoRepo.saveAll(productos);
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
