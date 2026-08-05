package com.kiosco.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString
@Setter
@Entity
@Table(name = "tbl_personas")
@Inheritance(strategy = InheritanceType.JOINED)
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long personaId;

    private String nombre, apellido;
    private String rol;
    private String contrasenia;
    @Column(unique = true)
    private String whatsApp;
    private LocalDate fechaRegistro = LocalDate.now();
    private Boolean estado;
}
