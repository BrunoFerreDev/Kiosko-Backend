package com.kiosco.model.subModel;

import com.kiosco.model.Anotado;
import com.kiosco.model.Pago;
import com.kiosco.model.Persona;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_clientes")
@PrimaryKeyJoinColumn(name = "personaId")
public class Cliente extends Persona {

    /* @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long clienteId;
     private String nombre, apellido;

     @Column(unique = true)
     private String whatsApp;

     private LocalDate fechaRegistro = LocalDate.now();
     private Boolean estado;*/

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anotado> anotados = new ArrayList<>();

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pago> pagos = new ArrayList<>();

}
