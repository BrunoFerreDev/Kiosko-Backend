package com.kiosco.dto;

import com.kiosco.model.Producto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ProductoDTO implements Serializable {
    private Long productoId;

    private String nombre, marca, categoria;
    private BigDecimal precioVenta;
    private LocalDate fechaRegistro;
    private String unidadMedida;
    private int stock;
    private Boolean estado;

    public ProductoDTO(Producto producto, String marca, String categoria) {
        this.productoId = producto.getProductoId();
        this.nombre = producto.getNombre();
        this.marca = marca;
        this.categoria = categoria;
        this.unidadMedida = producto.getUnidadMedida().name();
        this.precioVenta = producto.getPrecioVenta();
        this.fechaRegistro = producto.getFechaRegistro();
        this.stock = producto.getStock();
        this.estado = producto.getEstado();
    }

    public ProductoDTO(Producto producto) {
        this.productoId = producto.getProductoId();
        this.nombre = producto.getNombre();
        this.precioVenta = producto.getPrecioVenta();
        this.fechaRegistro = producto.getFechaRegistro();
        this.unidadMedida = producto.getUnidadMedida().name();
        this.stock = producto.getStock();
        this.estado = producto.getEstado();
    }

}
