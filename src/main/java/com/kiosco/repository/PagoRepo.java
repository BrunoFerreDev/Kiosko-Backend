package com.kiosco.repository;

import com.kiosco.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoRepo extends JpaRepository<Pago, Long> {
}
