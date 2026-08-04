package com.kiosco.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonPropertyOrder({"cantidad", "precioUnitario", "fechaAnotado", "estado", "clienteId", "productoId"})
public record AnotadoR(int cantidad, BigDecimal precioUnitario, LocalDateTime fechaAnotado, String estado, Long clienteId,
                       Long productoId) {
}

