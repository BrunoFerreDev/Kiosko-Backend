package com.kiosco.dto;

import com.kiosco.model.Anotado;
import com.kiosco.model.subModel.Cliente;
import com.kiosco.model.DetallePago;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ClienteDTO {
    private Long clienteId;
    private String nombreCompleto, whatsApp;
    private Boolean estado;
    private LocalDate fechaRegistro;
    private BigDecimal saldoPendiente;

    public ClienteDTO(Cliente cliente) {
        this.clienteId = cliente.getPersonaId();
        this.nombreCompleto = cliente.getNombre() + " " + cliente.getApellido();
        this.whatsApp = cliente.getWhatsApp();
        this.estado = cliente.getEstado();
        this.saldoPendiente = calcularSaldoPendiente(cliente);
        this.fechaRegistro = cliente.getFechaRegistro();
    }

    private BigDecimal calcularSaldoPendiente(Cliente cliente) {
        if (cliente.getAnotados() == null || cliente.getAnotados().isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalSaldo = BigDecimal.ZERO;

        for (Anotado anotado : cliente.getAnotados()) {
            if ("PAGADO".equalsIgnoreCase(anotado.getEstado())) {
                continue;
            }
            BigDecimal totalAnotado = anotado.getPrecioUnitario() != null
                    ? anotado.getPrecioUnitario().multiply(BigDecimal.valueOf(anotado.getCantidad()))
                    : BigDecimal.ZERO;

            BigDecimal yaPagado = BigDecimal.ZERO;
            if (anotado.getDetallePagos() != null) {
                for (DetallePago dp : anotado.getDetallePagos()) {
                    if (dp.getMontoAplicado() != null) {
                        yaPagado = yaPagado.add(dp.getMontoAplicado());
                    }
                }
            }

            BigDecimal pendiente = totalAnotado.subtract(yaPagado);
            if (pendiente.compareTo(BigDecimal.ZERO) > 0) {
                totalSaldo = totalSaldo.add(pendiente);
            }
        }

        return totalSaldo;
    }
}
