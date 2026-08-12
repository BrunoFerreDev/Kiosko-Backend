package com.kiosco.repository;

import com.kiosco.model.Anotado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnotadoRepo extends JpaRepository<Anotado, Long> {
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Anotado> findByClientePersonaIdAndEstadoInOrderByFechaAnotadoAsc(Long clienteId, List<String> estados);

    @EntityGraph(attributePaths = {"cliente"})
    List<Anotado> findTop50ByOrderByFechaAnotadoDesc();

    @EntityGraph(attributePaths = {"cliente"})
    Page<Anotado> findByClientePersonaId(Long clienteId, Pageable pageable);

    @EntityGraph(attributePaths = {"cliente"})
    Page<Anotado> findAll(Pageable pageable);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Anotado> findAll();
}



