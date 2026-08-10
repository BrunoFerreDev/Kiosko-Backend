package com.kiosco;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum UnidadMedida {
    KILOGRAMO("kg"),
    UNIDAD("unidad"),
    DECENA("decena"),
    LITRO("litro"),
    CAJA("caja"),
    PORCION("porcion"),
    DOCENA("docena");


    private final String abreviatura;

    UnidadMedida(String abreviatura) {
        this.abreviatura = abreviatura;
    }

    public String getAbreviatura() {
        return abreviatura;
    }

    /**
     * Método para recibir un String y devolver el Enum correspondiente.
     *
     * @JsonCreator le dice a Spring Boot que use este método al deserializar el JSON.
     */
    @JsonCreator
    public static UnidadMedida fromString(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return null;
        }

        for (UnidadMedida cat : UnidadMedida.values()) {
            if (cat.getAbreviatura().equalsIgnoreCase(texto.trim()) ||
                    cat.name().equalsIgnoreCase(texto.trim())) {
                return cat;
            }
        }

        // Si el texto no coincide con nada, lanzamos una excepción clara
        throw new IllegalArgumentException("Unidad de medida no válida: " + texto);
    }
}
