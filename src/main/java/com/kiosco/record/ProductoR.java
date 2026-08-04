package com.kiosco.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.math.BigDecimal;

@JsonPropertyOrder({"nombre", "marca", "categoria", "precioCosto", "precioVenta", "stock", "estado"})
public record ProductoR(String nombre, String marca, String categoria, BigDecimal precioCosto, BigDecimal precioVenta,
                        int stock, Boolean estado) {
}


