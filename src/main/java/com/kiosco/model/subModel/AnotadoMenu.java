package com.kiosco.model.subModel;

import com.kiosco.model.Anotado;
import com.kiosco.model.MenuDiario;
import com.kiosco.model.Producto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_anotados_menus")
@PrimaryKeyJoinColumn(name = "anotadoId")
public class AnotadoMenu extends Anotado {
    @ManyToOne
    @JoinColumn(name = "menuIdH")
    private MenuDiario menuDiario;
    private BigDecimal precioFinal;
}
