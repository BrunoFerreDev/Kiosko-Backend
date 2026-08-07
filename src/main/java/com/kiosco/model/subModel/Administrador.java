package com.kiosco.model.subModel;

import com.kiosco.model.Persona;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_administradores")
@PrimaryKeyJoinColumn(name = "personaId")
public class Administrador extends Persona {

}
