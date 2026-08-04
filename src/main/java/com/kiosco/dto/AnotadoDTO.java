package com.kiosco.dto;


import com.kiosco.model.Anotado;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@Data
public class AnotadoDTO {
    private Long anotadoId;
    private int cantidad;
    private BigDecimal precioUnitario;
    private LocalDateTime fechaAnotado;
    private String estado;
    private ClienteDTO cliente;
    private ProductoDTO producto;

    public AnotadoDTO(Anotado anotado) {
        this.anotadoId = anotado.getAnotadoId();
        this.cantidad = anotado.getCantidad();
        this.precioUnitario = anotado.getPrecioUnitario();
        this.fechaAnotado = anotado.getFechaAnotado();
        this.estado = anotado.getEstado();
        this.cliente = new ClienteDTO(anotado.getCliente());
        this.producto = new ProductoDTO(anotado.getProducto());
    }
}
