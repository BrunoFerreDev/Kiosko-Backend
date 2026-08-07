package com.kiosco.service.impl;

import com.kiosco.dto.AnotadoProductoDTO;
import com.kiosco.model.DetallePago;
import com.kiosco.model.Pago;
import com.kiosco.model.Producto;
import com.kiosco.model.subModel.AnotadoProducto;
import com.kiosco.model.subModel.Cliente;
import com.kiosco.record.AnotadoProductoR;
import com.kiosco.repository.*;
import com.kiosco.service.AnotadoProductoService;
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
public class AnotadoProductoServiceImpl implements AnotadoProductoService {

    private final AnotadoProductoRepo anotadoProductoRepo;
    private final ClienteRepo clienteRepo;
    private final ProductoRepo productoRepo;
    private final PagoRepo pagoRepo;
    private final DetallePagoRepo detallePagoRepo;

    @Override
    @Transactional
    public AnotadoProductoDTO crear(AnotadoProductoR request) {
        Cliente cliente = clienteRepo.findById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId()));
        Producto producto = productoRepo.findById(request.productoId())
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + request.productoId()));

        if (request.cantidad() > producto.getStock()) {
            throw new BadRequestException("Stock insuficiente para el producto: " + request.productoId());
        }

        AnotadoProducto anotado = new AnotadoProducto();
        anotado.setCantidad(request.cantidad());
        anotado.setPrecioUnitario(request.precioUnitario() != null ? request.precioUnitario() : producto.getPrecioVenta());
        anotado.setFechaAnotado(request.fechaAnotado() != null ? request.fechaAnotado() : LocalDateTime.now());
        anotado.setEstado(request.estado() != null ? request.estado() : "PENDIENTE");
        anotado.setCliente(cliente);
        anotado.setProducto(producto);

        producto.setStock(producto.getStock() - request.cantidad());
        productoRepo.save(producto);

        return new AnotadoProductoDTO(anotadoProductoRepo.save(anotado));
    }

    @Override
    public AnotadoProductoDTO obtenerPorId(Long id) {
        return new AnotadoProductoDTO(anotadoProductoRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoProducto no encontrado con ID: " + id)));
    }

    @Override
    public List<AnotadoProductoDTO> obtenerTodos() {
        return anotadoProductoRepo.findAll().stream().map(AnotadoProductoDTO::new).toList();
    }

    @Override
    public Page<AnotadoProductoDTO> obtenerPaginado(Pageable pageable) {
        return anotadoProductoRepo.findAll(pageable).map(AnotadoProductoDTO::new);
    }

    @Override
    public Page<AnotadoProductoDTO> obtenerPorCliente(Long clienteId, Pageable pageable) {
        return anotadoProductoRepo.findByClientePersonaId(clienteId, pageable).map(AnotadoProductoDTO::new);
    }

    @Override
    public Page<AnotadoProductoDTO> obtenerPorProducto(Long productoId, Pageable pageable) {
        return anotadoProductoRepo.findByProductoProductoId(productoId, pageable).map(AnotadoProductoDTO::new);
    }

    @Override
    @Transactional
    public AnotadoProductoDTO actualizar(Long id, AnotadoProductoR request) {
        AnotadoProducto anotado = anotadoProductoRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoProducto no encontrado con ID: " + id));

        if (request.clienteId() != null) {
            anotado.setCliente(clienteRepo.findById(request.clienteId())
                    .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + request.clienteId())));
        }
        if (request.productoId() != null) {
            anotado.setProducto(productoRepo.findById(request.productoId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + request.productoId())));
        }
        anotado.setCantidad(request.cantidad());
        if (request.precioUnitario() != null) anotado.setPrecioUnitario(request.precioUnitario());
        if (request.fechaAnotado() != null) anotado.setFechaAnotado(request.fechaAnotado());
        if (request.estado() != null) anotado.setEstado(request.estado());

        return new AnotadoProductoDTO(anotadoProductoRepo.save(anotado));
    }

    @Override
    @Transactional
    public AnotadoProductoDTO marcarComoPagado(Long id, String metodoPago) {
        AnotadoProducto anotado = anotadoProductoRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AnotadoProducto no encontrado con ID: " + id));

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
        return new AnotadoProductoDTO(anotadoProductoRepo.save(anotado));
    }

    @Override
    public void eliminar(Long id) {
        if (!anotadoProductoRepo.existsById(id)) {
            throw new NotFoundException("AnotadoProducto no encontrado con ID: " + id);
        }
        anotadoProductoRepo.deleteById(id);
    }
}
