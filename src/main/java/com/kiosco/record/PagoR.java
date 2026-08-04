package com.kiosco.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonPropertyOrder({"metodoPago", "fechaPago", "montoAbonado", "clienteId"})
public record PagoR(String metodoPago, LocalDateTime fechaPago, BigDecimal montoAbonado, Long clienteId) {
}

