package com.kiosco.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActividadRecienteDTO {
    private String cliente;
    private String productos;
    private BigDecimal montoTotal;
    private LocalDateTime fecha;
}
