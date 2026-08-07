package com.kiosco.repository;

import com.kiosco.model.subModel.AnotadoCombo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnotadoComboRepo extends JpaRepository<AnotadoCombo, Long> {
    Page<AnotadoCombo> findByClientePersonaId(Long clienteId, Pageable pageable);
    Page<AnotadoCombo> findByComboComboId(Long comboId, Pageable pageable);
}
