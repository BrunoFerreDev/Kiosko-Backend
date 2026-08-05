package com.kiosco.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_administradores")
@PrimaryKeyJoinColumn(name = "personaId")
public class Administrador extends Persona {
    private String rol = "ROLE_ADMINISTRADOR";

}
