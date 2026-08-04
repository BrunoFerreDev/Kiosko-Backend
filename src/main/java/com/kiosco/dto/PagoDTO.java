package com.kiosco.dto;

import com.kiosco.model.Pago;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class PagoDTO {
    private Long pagoId;

    private String metodoPago;

    private LocalDateTime fechaPago;

    private BigDecimal montoAbonado;

    private ClienteDTO cliente;

    public PagoDTO(Pago pago) {
        this.pagoId = pago.getPagoId();
        this.metodoPago = pago.getMetodoPago();
        this.fechaPago = pago.getFechaPago();
        this.montoAbonado = pago.getMontoAbonado();
        this.cliente = new ClienteDTO(pago.getCliente());
    }
}
