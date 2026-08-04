package com.kiosco.repository;

import com.kiosco.model.DetallePago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetallePagoRepo extends JpaRepository<DetallePago, Long> {
}
