package com.satelitenorte.sisget.service;

import com.satelitenorte.sisget.model.FleetPositioningStatic;
import com.satelitenorte.sisget.model.Reserva;
import com.satelitenorte.sisget.model.StaticCategory;
import com.satelitenorte.sisget.model.Tanque;
import com.satelitenorte.sisget.repository.FleetPositioningStaticRepository;
import com.satelitenorte.sisget.repository.ReservaRepository;
import com.satelitenorte.sisget.repository.TanqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GarageService {

    private final ReservaRepository reservaRepository;
    private final TanqueRepository tanqueRepository;
    private final FleetPositioningStaticRepository fleetRepository;

    public List<Tanque> listTanks() {
        return tanqueRepository.findAll();
    }

    @Transactional
    public Tanque updateTank(Long id, Tanque tanque) {
        Tanque existing = tanqueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tanque não encontrado"));
        
        existing.setMedicaoCm(tanque.getMedicaoCm());
        existing.setVolumeL(tanque.getVolumeL());
        existing.setAtualizadoEm(java.time.LocalDateTime.now());
        existing.setAtualizadoPor(tanque.getAtualizadoPor());
        
        return tanqueRepository.save(existing);
    }

    public List<Reserva> listReservas() {
        return reservaRepository.findAll();
    }

    @Transactional
    public Reserva saveReserva(Reserva reserva) {
        // Lógica Bilateral: Sincronizar com FleetPositioningStatic
        syncToFleet(reserva);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public void deleteReserva(Long id) {
        reservaRepository.findById(id).ifPresent(res -> {
            // Ao deletar uma reserva na garagem, removemos o badge de RESERVA na frota (ou removemos o registro)
            fleetRepository.findByBase("IMP").stream()
                .filter(f -> f.getVehicleId().equals(res.getCodigo()))
                .forEach(fleetRepository::delete);
            
            reservaRepository.delete(res);
        });
    }

    @Transactional
    public void deleteFleetPosition(Long id) {
        fleetRepository.findById(id).ifPresent(pos -> {
            // Sincronização Bilateral: Se deletar da frota e for RESERVA, deleta da garagem
            if (StaticCategory.RESERVA.name().equals(pos.getCategory())) {
                reservaRepository.findByCodigo(pos.getVehicleId())
                    .ifPresent(reservaRepository::delete);
            }
            fleetRepository.delete(pos);
        });
    }

    private void syncToFleet(Reserva reserva) {
        String code = reserva.getCodigo();
        if (code == null || code.isEmpty()) return;

        // Tenta encontrar o veículo no posicionamento estático de Imperatriz
        List<FleetPositioningStatic> fleetList = fleetRepository.findByBase("IMP");
        Optional<FleetPositioningStatic> existing = fleetList.stream()
                .filter(f -> f.getVehicleId().equals(code))
                .findFirst();

        if (existing.isPresent()) {
            FleetPositioningStatic pos = existing.get();
            pos.setCategory(StaticCategory.RESERVA.name());
            pos.setNotes("Reserva Automática: " + reserva.getDescricao());
            fleetRepository.save(pos);
        } else {
            // Se não existe, cria um novo "Reserva" em Imperatriz
            FleetPositioningStatic newPos = FleetPositioningStatic.builder()
                    .vehicleId(code)
                    .base("IMP")
                    .category(StaticCategory.RESERVA.name())
                    .notes(reserva.getDescricao())
                    .build();
            fleetRepository.save(newPos);
        }
    }
}
