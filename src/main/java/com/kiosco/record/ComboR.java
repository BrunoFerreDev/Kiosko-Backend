package com.kiosco.record;

import java.math.BigDecimal;
import java.util.List;

public record ComboR(String nombre, BigDecimal precio, Boolean activo, String imgUrl, List<ComboItemR> items) {
    public record ComboItemR(Long productoId, int cantidad, BigDecimal precioUnitario) {
    }
}
