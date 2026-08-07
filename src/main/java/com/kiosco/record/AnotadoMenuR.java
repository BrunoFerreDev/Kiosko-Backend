package com.kiosco.record;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AnotadoMenuR(
        int cantidad,
        BigDecimal precioUnitario,
        LocalDateTime fechaAnotado,
        String estado,
        Long clienteId,
        Long menuDiarioId,
        Long productoId
) {
}
