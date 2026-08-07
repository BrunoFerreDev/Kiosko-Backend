package com.kiosco.model.subModel;

import com.kiosco.model.Anotado;
import com.kiosco.model.Producto;
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
@Table(name = "tbl_anotados_productos")
@PrimaryKeyJoinColumn(name = "anotadoId")
public class AnotadoProducto extends Anotado {

    @ManyToOne
    @JoinColumn(name = "productoIdH")
    private Producto producto;
}
