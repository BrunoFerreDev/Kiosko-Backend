package com.kiosco.dto;

import com.kiosco.model.subModel.AnotadoMenu;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@Data
public class AnotadoMenuDTO {
    private Long anotadoId;
    private int cantidad;
    private BigDecimal precioUnitario;
    private LocalDateTime fechaAnotado;
    private String estado;
    private ClienteDTO cliente;
    private MenuDiarioDTO menuDiario;
    private String nombreMenu;

    public AnotadoMenuDTO(AnotadoMenu anotado) {
        this.anotadoId = anotado.getAnotadoId();
        this.cantidad = anotado.getCantidad();
        this.precioUnitario = anotado.getPrecioUnitario();
        this.fechaAnotado = anotado.getFechaAnotado();
        this.estado = anotado.getEstado();
        this.cliente = anotado.getCliente() != null ? new ClienteDTO(anotado.getCliente()) : null;
        this.menuDiario = anotado.getMenuDiario() != null ? new MenuDiarioDTO(anotado.getMenuDiario()) : null;
        this.nombreMenu = anotado.getMenuDiario() != null ? anotado.getMenuDiario().getNombre() : "Menú";
    }
}
