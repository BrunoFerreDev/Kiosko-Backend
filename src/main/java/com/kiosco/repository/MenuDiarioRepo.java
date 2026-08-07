package com.kiosco.repository;

import com.kiosco.model.MenuDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface MenuDiarioRepo extends JpaRepository<MenuDiario, Long> {
    Optional<MenuDiario> findByFecha(LocalDate fecha);
    boolean existsByFecha(LocalDate fecha);
}
