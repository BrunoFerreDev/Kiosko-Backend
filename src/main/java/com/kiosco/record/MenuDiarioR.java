package com.kiosco.record;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record MenuDiarioR(String nombre, BigDecimal precio, LocalDate fecha, List<Long> productoIds) {
}
