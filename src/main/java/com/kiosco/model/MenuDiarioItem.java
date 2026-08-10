package com.kiosco.model;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_menus_diarios_items")
public class MenuDiarioItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuDiarioItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menuDiarioIdH")
    private MenuDiario menuDiario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productoIdH")
    private Producto producto;
}
