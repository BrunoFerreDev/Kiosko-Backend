package com.kiosco.service.impl;

import com.kiosco.dto.PagoDTO;
import com.kiosco.model.Anotado;
import com.kiosco.model.subModel.Cliente;
import com.kiosco.model.DetallePago;
import com.kiosco.model.Pago;
import com.kiosco.record.PagoR;
import com.kiosco.repository.AnotadoRepo;
import com.kiosco.repository.ClienteRepo;
import com.kiosco.repository.DetallePagoRepo;
import com.kiosco.repository.PagoRepo;
import com.kiosco.service.PagoService;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {
    private final PagoRepo pagoRepo;
    private final DetallePagoRepo detallePagoRepo;
    private final ClienteRepo clienteRepo;
    private final AnotadoRepo anotadoRepo;

    @Override
    @Transactional
    public PagoDTO crear(PagoR request) {
        Cliente cliente = clienteRepo.findById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId()));

        if (request.montoAbonado() == null || request.montoAbonado().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El monto abonado debe ser mayor a 0.");
        }

        Pago pago = new Pago();
        pago.setMetodoPago(request.metodoPago() != null ? request.metodoPago() : "EFECTIVO");
        pago.setFechaPago(request.fechaPago() != null ? request.fechaPago() : LocalDateTime.now());
        pago.setMontoAbonado(request.montoAbonado());
        pago.setCliente(cliente);

        Pago pagoGuardado = pagoRepo.save(pago);

        distribuirPago(pagoGuardado, cliente.getPersonaId(), request.montoAbonado());

        return new PagoDTO(pagoGuardado);
    }

    private void distribuirPago(Pago pago, Long clienteId, BigDecimal montoDisponible) {
        List<Anotado> anotadosPendientes = anotadoRepo.findByClientePersonaIdAndEstadoInOrderByFechaAnotadoAsc(
                clienteId, List.of("PENDIENTE", "PARCIAL"));

        BigDecimal saldoRestante = montoDisponible;

        for (Anotado anotado : anotadosPendientes) {
            if (saldoRestante.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal totalAnotado = anotado.getPrecioUnitario().multiply(BigDecimal.valueOf(anotado.getCantidad()));
            BigDecimal yaPagado = anotado.getDetallePagos().stream()
                    .map(DetallePago::getMontoAplicado)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal pendienteAnotado = totalAnotado.subtract(yaPagado);

            if (pendienteAnotado.compareTo(BigDecimal.ZERO) <= 0) {
                anotado.setEstado("PAGADO");
                anotadoRepo.save(anotado);
                continue;
            }

            BigDecimal montoAplicar;
            if (saldoRestante.compareTo(pendienteAnotado) >= 0) {
                montoAplicar = pendienteAnotado;
                saldoRestante = saldoRestante.subtract(pendienteAnotado);
                anotado.setEstado("PAGADO");
            } else {
                montoAplicar = saldoRestante;
                saldoRestante = BigDecimal.ZERO;
                anotado.setEstado("PARCIAL");
            }

            DetallePago detallePago = new DetallePago();
            detallePago.setPago(pago);
            detallePago.setAnotado(anotado);
            detallePago.setMontoAplicado(montoAplicar);
            detallePagoRepo.save(detallePago);

            anotadoRepo.save(anotado);
        }
    }

    @Override
    public List<PagoDTO> obtenerTodos() {
        return pagoRepo.findAll().stream()
                .map(PagoDTO::new)
                .toList();
    }

    @Override
    public PagoDTO obtenerPorId(Long id) {
        Pago pago = pagoRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Pago no encontrado con ID: " + id));
        return new PagoDTO(pago);
    }

    @Override
    public PagoDTO actualizar(Long id, PagoR request) {
        Pago pago = pagoRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Pago no encontrado con ID: " + id));

        if (request.clienteId() != null) {
            Cliente cliente = clienteRepo.findById(request.clienteId())
                    .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId()));
            pago.setCliente(cliente);
        }

        pago.setMetodoPago(request.metodoPago());
        if (request.fechaPago() != null) {
            pago.setFechaPago(request.fechaPago());
        }
        pago.setMontoAbonado(request.montoAbonado());

        return new PagoDTO(pagoRepo.save(pago));
    }

    @Override
    public void eliminar(Long id) {
        if (!pagoRepo.existsById(id)) {
            throw new NotFoundException("Pago no encontrado con ID: " + id);
        }
        pagoRepo.deleteById(id);
    }
}

