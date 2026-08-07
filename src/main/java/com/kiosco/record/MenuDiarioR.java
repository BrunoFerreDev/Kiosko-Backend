package com.kiosco.record;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MenuDiarioR(String nombre, BigDecimal precio, LocalDate fecha) {
}
