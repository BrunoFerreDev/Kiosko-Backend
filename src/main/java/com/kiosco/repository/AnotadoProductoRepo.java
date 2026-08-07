package com.kiosco.repository;

import com.kiosco.model.subModel.AnotadoProducto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnotadoProductoRepo extends JpaRepository<AnotadoProducto, Long> {
    Page<AnotadoProducto> findByClientePersonaId(Long clienteId, Pageable pageable);
    Page<AnotadoProducto> findByProductoProductoId(Long productoId, Pageable pageable);
}
