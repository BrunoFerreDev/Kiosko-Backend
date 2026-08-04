package com.kiosco.service.impl;

import com.kiosco.dto.ActividadRecienteDTO;
import com.kiosco.dto.AnotadoDTO;
import com.kiosco.model.Anotado;
import com.kiosco.model.Cliente;
import com.kiosco.model.Producto;
import com.kiosco.record.AnotadoR;
import com.kiosco.repository.AnotadoRepo;
import com.kiosco.repository.ClienteRepo;
import com.kiosco.repository.ProductoRepo;
import com.kiosco.service.AnotadoService;
import com.kiosco.utils.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.kiosco.model.DetallePago;
import com.kiosco.model.Pago;
import com.kiosco.repository.DetallePagoRepo;
import com.kiosco.repository.PagoRepo;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnotadoServiceImpl implements AnotadoService {
    private final AnotadoRepo anotadoRepo;
    private final ClienteRepo clienteRepo;
    private final ProductoRepo productoRepo;
    private final PagoRepo pagoRepo;
    private final DetallePagoRepo detallePagoRepo;

    @Transactional
    @Override
    public AnotadoDTO crear(AnotadoR request) {
        Cliente cliente = clienteRepo.findById(request.clienteId())
                .orElseThrow(() -> new BadRequestException("Cliente no encontrado con ID: " + request.clienteId()));
        Producto producto = productoRepo.findById(request.productoId())
                .orElseThrow(() -> new BadRequestException("Producto no encontrado con ID: " + request.productoId()));
        if (request.cantidad() > producto.getStock()) {
            throw new BadRequestException("Stock insuficiente para el producto: " + request.productoId());
        }
        Anotado anotado = new Anotado();
        anotado.setCantidad(request.cantidad());
        anotado.setPrecioUnitario(request.precioUnitario() != null ? request.precioUnitario() : producto.getPrecioVenta());
        anotado.setFechaAnotado(request.fechaAnotado() != null ? request.fechaAnotado() : LocalDateTime.now());
        anotado.setEstado(request.estado() != null ? request.estado() : "PENDIENTE");
        anotado.setCliente(cliente);
        anotado.setProducto(producto);
        producto.setStock(producto.getStock() - request.cantidad());
        productoRepo.save(producto);
        return new AnotadoDTO(anotadoRepo.save(anotado));
    }

    @Override
    public List<AnotadoDTO> obtenerTodos() {
        return anotadoRepo.findAll().stream()
                .map(AnotadoDTO::new)
                .toList();
    }

    @Override
    public Page<AnotadoDTO> obtenerPaginado(Pageable pageable) {
        return anotadoRepo.findAll(pageable)
                .map(AnotadoDTO::new);
    }

    @Override
    public Page<AnotadoDTO> obtenerPorCliente(Long clienteId, Pageable pageable) {
        Pageable pageableSeguro = sanearPageable(pageable);
        return anotadoRepo.findByClienteClienteId(clienteId, pageableSeguro)
                .map(AnotadoDTO::new);
    }

    private static final Map<String, String> SORT_PERMITIDO = Map.of(
            "fecha", "fechaAnotado",
            "precio", "precioUnitario"
    );

    private Pageable sanearPageable(Pageable pageable) {
        List<Sort.Order> ordenesValidos = pageable.getSort().stream()
                .filter(o -> SORT_PERMITIDO.containsKey(o.getProperty()))
                .map(o -> new Sort.Order(o.getDirection(), SORT_PERMITIDO.get(o.getProperty())))
                .toList();

        Sort sortSeguro = ordenesValidos.isEmpty()
                ? Sort.by(Sort.Direction.ASC, "fechaAnotado") // default: más reciente primero
                : Sort.by(ordenesValidos);

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sortSeguro);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActividadRecienteDTO> obtenerActividadReciente(int limite) {
        List<Anotado> recientes = anotadoRepo.findTop50ByOrderByFechaAnotadoDesc();
        if (recientes.isEmpty()) {
            return List.of();
        }

        Map<Long, List<Anotado>> agrupados = recientes.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCliente() != null ? a.getCliente().getClienteId() : 0L,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        int max = limite > 0 ? limite : 10;

        return agrupados.values().stream()
                .limit(max)
                .map(lista -> {
                    Anotado primero = lista.get(0);
                    String clienteNombre = primero.getCliente() != null ? primero.getCliente().getNombreCompleto() : "Cliente Desconocido";

                    String productosNombres = lista.stream()
                            .map(a -> a.getProducto() != null ? a.getProducto().getNombre() : "Producto")
                            .distinct()
                            .collect(Collectors.joining(", "));

                    BigDecimal montoTotal = lista.stream()
                            .map(a -> (a.getPrecioUnitario() != null ? a.getPrecioUnitario() : BigDecimal.ZERO)
                                    .multiply(BigDecimal.valueOf(a.getCantidad())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new ActividadRecienteDTO(
                            clienteNombre,
                            productosNombres,
                            montoTotal,
                            primero.getFechaAnotado()
                    );
                })
                .toList();
    }

    @Override
    public AnotadoDTO obtenerPorId(Long id) {
        Anotado anotado = anotadoRepo.findById(id)
                .orElseThrow(() -> new BadRequestException("Anotado no encontrado con ID: " + id));
        return new AnotadoDTO(anotado);
    }

    @Override
    public AnotadoDTO actualizar(Long id, AnotadoR request) {
        Anotado anotado = anotadoRepo.findById(id)
                .orElseThrow(() -> new BadRequestException("Anotado no encontrado con ID: " + id));

        if (request.clienteId() != null) {
            Cliente cliente = clienteRepo.findById(request.clienteId())
                    .orElseThrow(() -> new BadRequestException("Cliente no encontrado con ID: " + request.clienteId()));
            anotado.setCliente(cliente);
        }

        if (request.productoId() != null) {
            Producto producto = productoRepo.findById(request.productoId())
                    .orElseThrow(() -> new BadRequestException("Producto no encontrado con ID: " + request.productoId()));
            anotado.setProducto(producto);
        }

        anotado.setCantidad(request.cantidad());
        if (request.precioUnitario() != null) {
            anotado.setPrecioUnitario(request.precioUnitario());
        }
        if (request.fechaAnotado() != null) {
            anotado.setFechaAnotado(request.fechaAnotado());
        }
        if (request.estado() != null) {
            anotado.setEstado(request.estado());
        }

        return new AnotadoDTO(anotadoRepo.save(anotado));
    }

    @Override
    @Transactional
    public AnotadoDTO marcarComoPagado(Long anotadoId, String metodoPago) {
        Anotado anotado = anotadoRepo.findById(anotadoId)
                .orElseThrow(() -> new RuntimeException("Anotado no encontrado con ID: " + anotadoId));

        if ("PAGADO".equalsIgnoreCase(anotado.getEstado())) {
            throw new RuntimeException("El anotado con ID " + anotadoId + " ya se encuentra pagado.");
        }

        BigDecimal totalAnotado = anotado.getPrecioUnitario().multiply(BigDecimal.valueOf(anotado.getCantidad()));
        BigDecimal yaPagado = anotado.getDetallePagos().stream()
                .map(DetallePago::getMontoAplicado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal saldoPendiente = totalAnotado.subtract(yaPagado);

        Pago pago = new Pago();
        pago.setMetodoPago(metodoPago != null && !metodoPago.isBlank() ? metodoPago : "EFECTIVO");
        pago.setFechaPago(LocalDateTime.now());
        pago.setMontoAbonado(saldoPendiente);
        pago.setCliente(anotado.getCliente());
        Pago pagoGuardado = pagoRepo.save(pago);

        DetallePago detallePago = new DetallePago();
        detallePago.setPago(pagoGuardado);
        detallePago.setAnotado(anotado);
        detallePago.setMontoAplicado(saldoPendiente);
        detallePagoRepo.save(detallePago);

        anotado.setEstado("PAGADO");
        return new AnotadoDTO(anotadoRepo.save(anotado));
    }

    @Override
    public void eliminar(Long id) {
        if (!anotadoRepo.existsById(id)) {
            throw new BadRequestException("Anotado no encontrado con ID: " + id);
        }
        anotadoRepo.deleteById(id);
    }
}

