package com.kiosco.repository;

import com.kiosco.model.Anotado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnotadoRepo extends JpaRepository<Anotado, Long> {
    /*List<Anotado> findByClienteClienteId(Long clienteId);*/
    List<Anotado> findByClienteClienteIdAndEstadoInOrderByFechaAnotadoAsc(Long clienteId, List<String> estados);

    List<Anotado> findTop50ByOrderByFechaAnotadoDesc();

    Page<Anotado> findByClienteClienteId(Long clienteId, Pageable pageable);
}



