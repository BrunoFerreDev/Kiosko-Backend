package com.kiosco.service;

import com.kiosco.dto.ActividadRecienteDTO;
import com.kiosco.dto.AnotadoDTO;
import com.kiosco.record.AnotadoR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnotadoService {
    AnotadoDTO crear(AnotadoR request);
    List<AnotadoDTO> obtenerTodos();
    Page<AnotadoDTO> obtenerPaginado(Pageable pageable);
    Page<AnotadoDTO> obtenerPorCliente(Long clienteId, Pageable pageable);
    List<ActividadRecienteDTO> obtenerActividadReciente(int limite);
    AnotadoDTO obtenerPorId(Long id);
    AnotadoDTO actualizar(Long id, AnotadoR request);
    AnotadoDTO marcarComoPagado(Long anotadoId, String metodoPago);
    void eliminar(Long id);
}


