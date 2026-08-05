package com.kiosco.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"nombre", "apellido", "whatsapp", "message", "jwt", "status"})
public record AuthResponse(String nombre, String apellido, String whatsapp, String message, String jwt, boolean status) {
}
