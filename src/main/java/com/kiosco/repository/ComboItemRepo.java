package com.kiosco.repository;

import com.kiosco.model.ComboItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboItemRepo extends JpaRepository<ComboItem, Long> {
    List<ComboItem> findByComboComboId(Long comboId);
}
