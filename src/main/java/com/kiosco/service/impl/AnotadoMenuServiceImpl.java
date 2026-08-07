package com.kiosco.service.impl;

import com.kiosco.dto.AnotadoMenuDTO;
import com.kiosco.model.DetallePago;
import com.kiosco.model.MenuDiario;
import com.kiosco.model.Pago;
import com.kiosco.model.Producto;
import com.kiosco.model.subModel.AnotadoMenu;
import com.kiosco.model.subModel.Cliente;
import com.kiosco.record.AnotadoMenuR;
import com.kiosco.repository.*;
import com.kiosco.service.AnotadoMenuService;
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
public class AnotadoMenuServiceImpl implements AnotadoMenuService {

    private final AnotadoMenuRepo anotadoMenuRepo;
    private final ClienteRepo clienteRepo;
    private final ProductoRepo productoRepo;
    private final MenuDiarioRepo menuDiarioRepo;
    private final PagoRepo pagoRepo;
    private final DetallePagoRepo detallePagoRepo;

    @Override
    @Transactional
    public AnotadoMenuDTO crear(AnotadoMenuR request) {
        Cliente cliente = clienteRepo.findById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId()));
        MenuDiario menuDiario = menuDiarioRepo.findById(request.menuDiarioId())
                .orElseThrow(() -> new NotFoundException("Menú diario no encontrado con ID: " + request.menuDiarioId()));

        Producto producto = null;
        if (request.productoId() != null) {
            producto = productoRepo.findById(request.productoId()).orElse(null);
        }

        AnotadoMenu anotado = new AnotadoMenu();
        anotado.setCantidad(request.cantidad());
        anotado.setPrecioUnitario(request.precioUnitario() != null ? request.precioUnitario() : menuDiario.getPrecio());
        anotado.setFechaAnotado(request.fechaAnotado() != null ? request.fechaAnotado() : LocalDateTime.now());
        anotado.setEstado(request.estado() != null ? request.estado() : "PENDIENTE");
        anotado.setCliente(cliente);
        anotado.setMenuDiario(menuDiario);
        return new AnotadoMenuDTO(anotadoMenuRepo.save(anotado));
    }

    @Override
    public AnotadoMenuDTO obtenerPorId(Long id) {
        return new AnotadoMenuDTO(anotadoMenuRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoMenu no encontrado con ID: " + id)));
    }

    @Override
    public List<AnotadoMenuDTO> obtenerTodos() {
        return anotadoMenuRepo.findAll().stream().map(AnotadoMenuDTO::new).toList();
    }

    @Override
    public Page<AnotadoMenuDTO> obtenerPaginado(Pageable pageable) {
        return anotadoMenuRepo.findAll(pageable).map(AnotadoMenuDTO::new);
    }

    @Override
    public Page<AnotadoMenuDTO> obtenerPorCliente(Long clienteId, Pageable pageable) {
        return anotadoMenuRepo.findByClientePersonaId(clienteId, pageable).map(AnotadoMenuDTO::new);
    }

    @Override
    public Page<AnotadoMenuDTO> obtenerPorMenuDiario(Long menuDiarioId, Pageable pageable) {
        return anotadoMenuRepo.findByMenuDiarioMenuDiarioId(menuDiarioId, pageable).map(AnotadoMenuDTO::new);
    }

    @Override
    @Transactional
    public AnotadoMenuDTO actualizar(Long id, AnotadoMenuR request) {
        AnotadoMenu anotado = anotadoMenuRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoMenu no encontrado con ID: " + id));

        if (request.clienteId() != null) {
            anotado.setCliente(clienteRepo.findById(request.clienteId())
                    .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId())));
        }
        if (request.menuDiarioId() != null) {
            anotado.setMenuDiario(menuDiarioRepo.findById(request.menuDiarioId())
                    .orElseThrow(() -> new NotFoundException("Menú diario no encontrado con ID: " + request.menuDiarioId())));
        }
        anotado.setCantidad(request.cantidad());
        if (request.precioUnitario() != null) anotado.setPrecioUnitario(request.precioUnitario());
        if (request.fechaAnotado() != null) anotado.setFechaAnotado(request.fechaAnotado());
        if (request.estado() != null) anotado.setEstado(request.estado());

        return new AnotadoMenuDTO(anotadoMenuRepo.save(anotado));
    }

    @Override
    @Transactional
    public AnotadoMenuDTO marcarComoPagado(Long id, String metodoPago) {
        AnotadoMenu anotado = anotadoMenuRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoMenu no encontrado con ID: " + id));

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
        return new AnotadoMenuDTO(anotadoMenuRepo.save(anotado));
    }

    @Override
    public void eliminar(Long id) {
        if (!anotadoMenuRepo.existsById(id)) {
            throw new NotFoundException("AnotadoMenu no encontrado con ID: " + id);
        }
        anotadoMenuRepo.deleteById(id);
    }
}
