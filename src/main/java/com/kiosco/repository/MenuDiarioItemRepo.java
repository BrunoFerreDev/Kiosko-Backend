package com.kiosco.repository;

import com.kiosco.model.MenuDiarioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuDiarioItemRepo extends JpaRepository<MenuDiarioItem, Long> {
    List<MenuDiarioItem> findByMenuDiarioMenuDiarioId(Long menuDiarioId);
    void deleteByMenuDiarioMenuDiarioId(Long menuDiarioId);
}
