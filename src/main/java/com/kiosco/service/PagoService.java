package com.kiosco.service;

import com.kiosco.dto.PagoDTO;
import com.kiosco.record.PagoR;

import java.util.List;

public interface PagoService {
    PagoDTO crear(PagoR request);
    List<PagoDTO> obtenerTodos();
    PagoDTO obtenerPorId(Long id);
    PagoDTO actualizar(Long id, PagoR request);
    void eliminar(Long id);
}

