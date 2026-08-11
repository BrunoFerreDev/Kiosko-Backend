package com.kiosco.model;

import com.kiosco.UnidadMedida;
import com.kiosco.model.subModel.AnotadoProducto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productoId;

    private String nombre;
    private Long marcaId, categoriaId;
    private BigDecimal precioVenta;
    private LocalDate fechaRegistro = LocalDate.now();
    @Enumerated(EnumType.STRING)
    private UnidadMedida unidadMedida;
    private int stock;
    private Boolean estado;

    @OneToMany(mappedBy = "producto", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private Set<AnotadoProducto> anotados = new HashSet<>();
}
