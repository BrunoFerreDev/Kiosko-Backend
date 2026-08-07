package com.kiosco.model.subModel;

import com.kiosco.model.Anotado;
import com.kiosco.model.Combo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_anotados_combos")
@PrimaryKeyJoinColumn(name = "anotadoId")
public class AnotadoCombo extends Anotado {

    @ManyToOne
    @JoinColumn(name = "comboIdH")
    private Combo combo;

}
