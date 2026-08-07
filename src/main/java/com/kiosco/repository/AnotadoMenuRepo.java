package com.kiosco.repository;

import com.kiosco.model.subModel.AnotadoMenu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnotadoMenuRepo extends JpaRepository<AnotadoMenu, Long> {
    Page<AnotadoMenu> findByClientePersonaId(Long clienteId, Pageable pageable);
    Page<AnotadoMenu> findByMenuDiarioMenuDiarioId(Long menuDiarioId, Pageable pageable);
}
