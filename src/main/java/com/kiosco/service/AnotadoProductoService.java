package com.kiosco.service;

import com.kiosco.dto.AnotadoProductoDTO;
import com.kiosco.record.AnotadoProductoR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnotadoProductoService {
    AnotadoProductoDTO crear(AnotadoProductoR request);
    AnotadoProductoDTO obtenerPorId(Long id);
    List<AnotadoProductoDTO> obtenerTodos();
    Page<AnotadoProductoDTO> obtenerPaginado(Pageable pageable);
    Page<AnotadoProductoDTO> obtenerPorCliente(Long clienteId, Pageable pageable);
    Page<AnotadoProductoDTO> obtenerPorProducto(Long productoId, Pageable pageable);
    AnotadoProductoDTO actualizar(Long id, AnotadoProductoR request);
    AnotadoProductoDTO marcarComoPagado(Long id, String metodoPago);
    void eliminar(Long id);
}
