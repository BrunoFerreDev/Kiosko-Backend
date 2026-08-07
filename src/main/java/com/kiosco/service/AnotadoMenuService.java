package com.kiosco.service;

import com.kiosco.dto.AnotadoMenuDTO;
import com.kiosco.record.AnotadoMenuR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnotadoMenuService {
    AnotadoMenuDTO crear(AnotadoMenuR request);
    AnotadoMenuDTO obtenerPorId(Long id);
    List<AnotadoMenuDTO> obtenerTodos();
    Page<AnotadoMenuDTO> obtenerPaginado(Pageable pageable);
    Page<AnotadoMenuDTO> obtenerPorCliente(Long clienteId, Pageable pageable);
    Page<AnotadoMenuDTO> obtenerPorMenuDiario(Long menuDiarioId, Pageable pageable);
    AnotadoMenuDTO actualizar(Long id, AnotadoMenuR request);
    AnotadoMenuDTO marcarComoPagado(Long id, String metodoPago);
    void eliminar(Long id);
}
