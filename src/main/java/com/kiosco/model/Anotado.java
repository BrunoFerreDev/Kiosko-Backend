package com.kiosco.model;

import com.kiosco.model.subModel.Cliente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_anotados")
@Inheritance(strategy = InheritanceType.JOINED)
public class Anotado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long anotadoId;
    private int cantidad;
    private BigDecimal precioUnitario;
    private LocalDateTime fechaAnotado;
    private String estado;
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @OneToMany(mappedBy = "anotado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePago> detallePagos = new ArrayList<>();
}
