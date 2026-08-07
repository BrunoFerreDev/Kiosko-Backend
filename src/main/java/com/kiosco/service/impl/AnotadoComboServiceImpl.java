package com.kiosco.service.impl;

import com.kiosco.dto.AnotadoComboDTO;
import com.kiosco.model.Combo;
import com.kiosco.model.DetallePago;
import com.kiosco.model.Pago;
import com.kiosco.model.subModel.AnotadoCombo;
import com.kiosco.model.subModel.Cliente;
import com.kiosco.record.AnotadoComboR;
import com.kiosco.repository.*;
import com.kiosco.service.AnotadoComboService;
import com.kiosco.utils.BadRequestException;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnotadoComboServiceImpl implements AnotadoComboService {

    private final AnotadoComboRepo anotadoComboRepo;
    private final ClienteRepo clienteRepo;
    private final ComboRepo comboRepo;
    private final PagoRepo pagoRepo;
    private final DetallePagoRepo detallePagoRepo;

    @Override
    @Transactional
    public AnotadoComboDTO crear(AnotadoComboR request) {
        Cliente cliente = clienteRepo.findById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId()));
        Combo combo = comboRepo.findById(request.comboId())
                .orElseThrow(() -> new NotFoundException("Combo no encontrado con ID: " + request.comboId()));

        AnotadoCombo anotado = new AnotadoCombo();
        anotado.setCantidad(request.cantidad());
        anotado.setPrecioUnitario(request.precioUnitario() != null ? request.precioUnitario() : combo.getPrecio());
        anotado.setFechaAnotado(request.fechaAnotado() != null ? request.fechaAnotado() : LocalDateTime.now());
        anotado.setEstado(request.estado() != null ? request.estado() : "PENDIENTE");
        anotado.setCliente(cliente);
        anotado.setCombo(combo);

        return new AnotadoComboDTO(anotadoComboRepo.save(anotado));
    }

    @Override
    public AnotadoComboDTO obtenerPorId(Long id) {
        return new AnotadoComboDTO(anotadoComboRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoCombo no encontrado con ID: " + id)));
    }

    @Override
    public List<AnotadoComboDTO> obtenerTodos() {
        return anotadoComboRepo.findAll().stream().map(AnotadoComboDTO::new).toList();
    }

    @Override
    public Page<AnotadoComboDTO> obtenerPaginado(Pageable pageable) {
        return anotadoComboRepo.findAll(pageable).map(AnotadoComboDTO::new);
    }

    @Override
    public Page<AnotadoComboDTO> obtenerPorCliente(Long clienteId, Pageable pageable) {
        return anotadoComboRepo.findByClientePersonaId(clienteId, pageable).map(AnotadoComboDTO::new);
    }

    @Override
    public Page<AnotadoComboDTO> obtenerPorCombo(Long comboId, Pageable pageable) {
        return anotadoComboRepo.findByComboComboId(comboId, pageable).map(AnotadoComboDTO::new);
    }

    @Override
    @Transactional
    public AnotadoComboDTO actualizar(Long id, AnotadoComboR request) {
        AnotadoCombo anotado = anotadoComboRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoCombo no encontrado con ID: " + id));

        if (request.clienteId() != null) {
            anotado.setCliente(clienteRepo.findById(request.clienteId())
                    .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId())));
        }
        if (request.comboId() != null) {
            anotado.setCombo(comboRepo.findById(request.comboId())
                    .orElseThrow(() -> new NotFoundException("Combo no encontrado con ID: " + request.comboId())));
        }
        anotado.setCantidad(request.cantidad());
        if (request.precioUnitario() != null) anotado.setPrecioUnitario(request.precioUnitario());
        if (request.fechaAnotado() != null) anotado.setFechaAnotado(request.fechaAnotado());
        if (request.estado() != null) anotado.setEstado(request.estado());

        return new AnotadoComboDTO(anotadoComboRepo.save(anotado));
    }

    @Override
    @Transactional
    public AnotadoComboDTO marcarComoPagado(Long id, String metodoPago) {
        AnotadoCombo anotado = anotadoComboRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoCombo no encontrado con ID: " + id));

        if ("PAGADO".equalsIgnoreCase(anotado.getEstado())) {
            throw new BadRequestException("El anotado con ID " + id + " ya se encuentra pagado.");
        }

        BigDecimal total = anotado.getPrecioUnitario().multiply(BigDecimal.valueOf(anotado.getCantidad()));
        BigDecimal yaPagado = anotado.getDetallePagos().stream()
                .map(DetallePago::getMontoAplicado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal saldo = total.subtract(yaPagado);

        Pago pago = new Pago();
        pago.setMetodoPago(metodoPago != null && !metodoPago.isBlank() ? metodoPago : "EFECTIVO");
        pago.setFechaPago(LocalDateTime.now());
        pago.setMontoAbonado(saldo);
        pago.setCliente(anotado.getCliente());
        Pago pagoGuardado = pagoRepo.save(pago);

        DetallePago detalle = new DetallePago();
        detalle.setPago(pagoGuardado);
        detalle.setAnotado(anotado);
        detalle.setMontoAplicado(saldo);
        detallePagoRepo.save(detalle);

        anotado.setEstado("PAGADO");
        return new AnotadoComboDTO(anotadoComboRepo.save(anotado));
    }

    @Override
    public void eliminar(Long id) {
        if (!anotadoComboRepo.existsById(id)) {
            throw new NotFoundException("AnotadoCombo no encontrado con ID: " + id);
        }
        anotadoComboRepo.deleteById(id);
    }
}
