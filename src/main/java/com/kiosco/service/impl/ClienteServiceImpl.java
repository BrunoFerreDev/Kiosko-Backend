package com.kiosco.service.impl;

import com.kiosco.dto.ClienteDTO;
import com.kiosco.model.Cliente;
import com.kiosco.record.ClienteR;
import com.kiosco.repository.ClienteRepo;
import com.kiosco.service.ClienteService;
import com.kiosco.utils.BadRequestException;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {
    private final ClienteRepo clienteRepo;

    @Override
    public ClienteDTO crear(ClienteR request) {
        Cliente cliente = new Cliente();
        cliente.setNombre(request.nombre());
        cliente.setApellido(request.apellido());
        cliente.setWhatsApp(request.whatsApp());
        cliente.setEstado(request.estado() != null ? request.estado() : true);
        cliente.setFechaRegistro(LocalDate.now());
        return new ClienteDTO(clienteRepo.save(cliente));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteDTO> obtenerTodos() {
        return clienteRepo.findAll().stream()
                .map(ClienteDTO::new)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClienteDTO> obtenerPaginado(Pageable pageable) {
        return clienteRepo.findAll(pageable)
                .map(ClienteDTO::new);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteDTO obtenerPorId(Long id) {
        Cliente cliente = clienteRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + id));
        return new ClienteDTO(cliente);
    }

    @Override
    public ClienteDTO actualizar(Long id, ClienteR request) {
        Cliente cliente = clienteRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con ID: " + id));
        cliente.setNombre(request.nombre());
        cliente.setApellido(request.apellido());
        cliente.setWhatsApp(request.whatsApp());
        if (request.estado() != null) {
            cliente.setEstado(request.estado());
        }
        return new ClienteDTO(clienteRepo.save(cliente));
    }

    @Override
    public void eliminar(Long id) {
        if (!clienteRepo.existsById(id)) {
            throw new BadRequestException("Cliente no encontrado con ID: " + id);
        }
        clienteRepo.deleteById(id);
    }
}

