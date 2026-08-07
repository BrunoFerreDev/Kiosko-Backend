package com.kiosco.record;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AnotadoComboR(
        int cantidad,
        BigDecimal precioUnitario,
        LocalDateTime fechaAnotado,
        String estado,
        Long clienteId,
        Long comboId
) {
}
