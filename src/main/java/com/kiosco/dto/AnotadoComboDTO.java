package com.kiosco.dto;

import com.kiosco.model.subModel.AnotadoCombo;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@Data
public class AnotadoComboDTO {
    private Long anotadoId;
    private int cantidad;
    private BigDecimal precioUnitario;
    private LocalDateTime fechaAnotado;
    private String estado;
    private ClienteDTO cliente;
    private ComboDTO combo;

    public AnotadoComboDTO(AnotadoCombo anotado) {
        this.anotadoId = anotado.getAnotadoId();
        this.cantidad = anotado.getCantidad();
        this.precioUnitario = anotado.getPrecioUnitario();
        this.fechaAnotado = anotado.getFechaAnotado();
        this.estado = anotado.getEstado();
        this.cliente = anotado.getCliente() != null ? new ClienteDTO(anotado.getCliente()) : null;
        this.combo = anotado.getCombo() != null ? new ComboDTO(anotado.getCombo()) : null;
    }
}
