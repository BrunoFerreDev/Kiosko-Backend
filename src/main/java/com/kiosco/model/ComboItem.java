package com.kiosco.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "tbl_combos_items")
public class ComboItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long comboItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comboIdH")
    private Combo combo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productoId")
    private Producto producto;

    private int cantidad;
    private BigDecimal precioUnitario;


}
