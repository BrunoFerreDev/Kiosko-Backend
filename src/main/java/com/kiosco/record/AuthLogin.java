package com.kiosco.record;

import jakarta.validation.constraints.NotBlank;

public record AuthLogin(@NotBlank String whatsapp,
                        @NotBlank String contrasenia) {
}
