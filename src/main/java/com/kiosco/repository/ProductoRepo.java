package com.kiosco.repository;

import com.kiosco.model.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepo extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {
    List<Producto> findByEstadoTrue();
    Page<Producto> findByEstadoTrue(Pageable pageable);

  /*  @Query("SELECT DISTINCT p.categoria FROM Producto p")
    List<String> findCategoriasUnicas();

    @Query("SELECT DISTINCT p.marca FROM Producto p")
    List<String> findMarcasUnicas();*/
}


