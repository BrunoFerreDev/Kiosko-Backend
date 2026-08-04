package com.kiosco.dto;

import com.kiosco.model.Producto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ProductoDTO {
    private Long productoId;

    private String nombre, marca, categoria;
    private BigDecimal precioCosto, precioVenta;
    private LocalDateTime fechaRegistro;
    private int stock;
    private Boolean estado;

    public ProductoDTO(Producto producto) {
        this.productoId = producto.getProductoId();
        this.nombre = producto.getNombre();
        this.marca = producto.getMarca();
        this.categoria = producto.getCategoria();
        this.precioCosto = producto.getPrecioCosto();
        this.precioVenta = producto.getPrecioVenta();
        this.fechaRegistro = producto.getFechaRegistro();
        this.stock = producto.getStock();
        this.estado = producto.getEstado();
    }
}
