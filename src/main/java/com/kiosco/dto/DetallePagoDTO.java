package com.kiosco.dto;

import com.kiosco.model.DetallePago;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class DetallePagoDTO {
    private Long detallePagoId;
    private BigDecimal montoAplicado;
    private PagoDTO pago;
    private AnotadoDTO anotado;

    public DetallePagoDTO(DetallePago detallePago) {
        this.detallePagoId = detallePago.getDetallePagoId();
        this.montoAplicado = detallePago.getMontoAplicado();
        this.pago = new PagoDTO(detallePago.getPago());
        this.anotado = new AnotadoDTO(detallePago.getAnotado());
    }
}
