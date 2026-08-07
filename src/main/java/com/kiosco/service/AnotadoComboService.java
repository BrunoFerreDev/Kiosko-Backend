package com.kiosco.service;

import com.kiosco.dto.AnotadoComboDTO;
import com.kiosco.record.AnotadoComboR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnotadoComboService {
    AnotadoComboDTO crear(AnotadoComboR request);
    AnotadoComboDTO obtenerPorId(Long id);
    List<AnotadoComboDTO> obtenerTodos();
    Page<AnotadoComboDTO> obtenerPaginado(Pageable pageable);
    Page<AnotadoComboDTO> obtenerPorCliente(Long clienteId, Pageable pageable);
    Page<AnotadoComboDTO> obtenerPorCombo(Long comboId, Pageable pageable);
    AnotadoComboDTO actualizar(Long id, AnotadoComboR request);
    AnotadoComboDTO marcarComoPagado(Long id, String metodoPago);
    void eliminar(Long id);
}
