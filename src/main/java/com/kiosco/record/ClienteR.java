package com.kiosco.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"nombre", "apellido", "whatsApp", "estado"})
public record ClienteR(String nombre, String apellido, String whatsApp, Boolean estado) {
}

