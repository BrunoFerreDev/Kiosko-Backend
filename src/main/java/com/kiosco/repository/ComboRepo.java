package com.kiosco.repository;

import com.kiosco.model.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboRepo extends JpaRepository<Combo, Long> {
    List<Combo> findByActivoTrue();
}
