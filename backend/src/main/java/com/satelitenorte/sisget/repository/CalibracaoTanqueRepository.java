package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.CalibracaoTanque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalibracaoTanqueRepository extends JpaRepository<CalibracaoTanque, Long> {
}
