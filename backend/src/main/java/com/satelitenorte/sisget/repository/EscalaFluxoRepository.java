package com.satelitenorte.sisget.repository;

import com.satelitenorte.sisget.model.EscalaFluxo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EscalaFluxoRepository extends JpaRepository<EscalaFluxo, Long> {
    
    List<EscalaFluxo> findByData(LocalDate data);
    
    void deleteByData(LocalDate data);
}
