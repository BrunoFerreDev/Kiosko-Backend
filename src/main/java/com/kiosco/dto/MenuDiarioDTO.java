package com.kiosco.dto;

import com.kiosco.model.MenuDiario;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@Data
public class MenuDiarioDTO {
    private Long menuDiarioId;
    private String nombre;
    private BigDecimal precio;
    private LocalDate fecha;
    private List<ProductoDTO> productos;

    public MenuDiarioDTO(MenuDiario menuDiario) {
        this.menuDiarioId = menuDiario.getMenuDiarioId();
        this.nombre = menuDiario.getNombre();
        this.precio = menuDiario.getPrecio();
        this.fecha = menuDiario.getFecha();
        this.productos = menuDiario.getMenuDiarioItems() != null ? menuDiario.getMenuDiarioItems().stream()
                .map(item -> new ProductoDTO(item.getProducto()))
                .toList() : List.of();
    }
}
