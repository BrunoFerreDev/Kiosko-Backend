package com.kiosco.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_detalles_pagos")
public class DetallePago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long detallePagoId;
    private BigDecimal montoAplicado;

    @ManyToOne
    @JoinColumn(name = "pago_id")
    private Pago pago;

    @ManyToOne
    @JoinColumn(name = "anotado_id")
    private Anotado anotado;
}
