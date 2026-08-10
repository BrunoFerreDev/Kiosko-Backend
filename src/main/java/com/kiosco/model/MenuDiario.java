package com.kiosco.model;

import com.kiosco.model.subModel.AnotadoMenu;
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
@Table(name = "tbl_menus_diarios")
public class MenuDiario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuDiarioId;
    private LocalDate fecha;
    private String nombre;
    private BigDecimal precio;
    private String imgUrl;

    @OneToMany(mappedBy = "menuDiario")
    private Set<AnotadoMenu> menuSet = new HashSet<>();

    @OneToMany(mappedBy = "menuDiario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MenuDiarioItem> menuDiarioItems = new HashSet<>();
}
