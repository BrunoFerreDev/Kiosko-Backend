package com.kiosco.service;

import com.kiosco.dto.ComboDTO;
import com.kiosco.record.ComboR;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ComboService {
    ComboDTO crear(ComboR request, MultipartFile imagen);
    ComboDTO obtenerPorId(Long id);
    List<ComboDTO> obtenerTodos();
    List<ComboDTO> obtenerActivos();
    Page<ComboDTO> obtenerPaginado(Pageable pageable);
    ComboDTO actualizar(Long id, ComboR request, MultipartFile imagen);
    void eliminar(Long id);
}
