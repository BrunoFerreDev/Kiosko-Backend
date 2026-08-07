package com.kiosco.dto;

import com.kiosco.model.Combo;
import com.kiosco.model.ComboItem;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@NoArgsConstructor
@Data
public class ComboDTO {
    private Long comboId;
    private String nombre;
    private BigDecimal precio;
    private Boolean activo;
    private String imgUrl;
    private List<ComboItemDTO> items;

    public ComboDTO(Combo combo) {
        this.comboId = combo.getComboId();
        this.nombre = combo.getNombre();
        this.precio = combo.getPrecio();
        this.activo = combo.getActivo();
        this.imgUrl = combo.getImgUrl();
        this.items = combo.getItems().stream()
                .map(ComboItemDTO::new)
                .toList();
    }

    @NoArgsConstructor
    @Data
    public static class ComboItemDTO {
        private Long comboItemId;
        private ProductoDTO producto;
        private int cantidad;
        private BigDecimal precioUnitario;

        public ComboItemDTO(ComboItem item) {
            this.comboItemId = item.getComboItemId();
            this.producto = new ProductoDTO(item.getProducto());
            this.cantidad = item.getCantidad();
            this.precioUnitario = item.getPrecioUnitario();
        }
    }
}
