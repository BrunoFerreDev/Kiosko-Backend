package com.kiosco.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.math.BigDecimal;

@JsonPropertyOrder({"nombre", "marca", "categoria", "precioCosto", "precioVenta", "stock", "estado", "unidadMedida"})
public record ProductoR(String nombre, Long marca, Long categoria, BigDecimal precioCosto, BigDecimal precioVenta,
                        int stock, Boolean estado, String unidadMedida) {
}


