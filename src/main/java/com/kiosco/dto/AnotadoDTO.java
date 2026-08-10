package com.kiosco.dto;

import com.kiosco.model.Anotado;
import com.kiosco.model.subModel.AnotadoCombo;
import com.kiosco.model.subModel.AnotadoProducto;
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
    private ComboDTO combo;
    private String nombreItem;
    private String tipo;

    public AnotadoDTO(Anotado anotado) {
        this.anotadoId = anotado.getAnotadoId();
        this.cantidad = anotado.getCantidad();
        this.precioUnitario = anotado.getPrecioUnitario();
        this.fechaAnotado = anotado.getFechaAnotado();
        this.estado = anotado.getEstado();
        this.cliente = anotado.getCliente() != null ? new ClienteDTO(anotado.getCliente()) : null;

        if (anotado instanceof AnotadoProducto ap) {
            this.tipo = "PRODUCTO";
            this.producto = ap.getProducto() != null ? new ProductoDTO(ap.getProducto()) : null;
            this.nombreItem = ap.getProducto() != null ? ap.getProducto().getNombre() : "Producto";
        } else if (anotado instanceof AnotadoCombo ac) {
            this.tipo = "COMBO";
            this.combo = ac.getCombo() != null ? new ComboDTO(ac.getCombo()) : null;
            this.nombreItem = ac.getCombo() != null ? ac.getCombo().getNombre() : "Combo";
        } else {
            this.tipo = "DESCONOCIDO";
            this.nombreItem = "Anotado";
        }
    }
}
