package com.kiosco.model;

import com.kiosco.model.subModel.AnotadoCombo;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_combos")
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long comboId;
    private String nombre;
    private BigDecimal precio;
    private Boolean activo;
    private String imgUrl;
    @OneToMany(mappedBy = "combo", fetch = FetchType.LAZY)
    private Set<ComboItem> items = new HashSet<>();

    @OneToMany(mappedBy = "combo")
    private Set<AnotadoCombo> setCombos = new HashSet<>();

}
