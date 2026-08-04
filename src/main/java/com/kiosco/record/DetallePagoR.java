package com.kiosco.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.math.BigDecimal;

@JsonPropertyOrder({"montoAplicado", "pagoId", "anotadoId"})
public record DetallePagoR(BigDecimal montoAplicado, Long pagoId, Long anotadoId) {
}

