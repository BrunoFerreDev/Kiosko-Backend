package com.kiosco.service;

import com.kiosco.dto.ClienteDTO;
import com.kiosco.record.ClienteR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClienteService {
    ClienteDTO crear(ClienteR request);
    List<ClienteDTO> obtenerTodos();
    Page<ClienteDTO> obtenerPaginado(Pageable pageable);
    ClienteDTO obtenerPorId(Long id);
    ClienteDTO actualizar(Long id, ClienteR request);
    void eliminar(Long id);
}


