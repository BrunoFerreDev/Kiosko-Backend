package com.kiosco.repository;

import com.kiosco.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarcaRepo extends JpaRepository<Marca, Long> {
    List<Marca> findByNombreContainingIgnoreCase(String nombre);
}
