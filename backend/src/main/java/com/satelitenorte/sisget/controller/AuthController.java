package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.config.JwtService;
import com.satelitenorte.sisget.dto.AuthRequest;
import com.satelitenorte.sisget.dto.AuthResponse;
import com.satelitenorte.sisget.dto.ChangePasswordRequest;
import com.satelitenorte.sisget.model.Usuario;
import com.satelitenorte.sisget.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          UsuarioRepository usuarioRepository,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getMatricula(),
                        request.getSenha()
                )
        );

        Usuario user = usuarioRepository.findByMatricula(request.getMatricula())
                .orElseThrow();
        
        String jwtToken = jwtService.generateToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwtToken)
                .nome(user.getNome())
                .matricula(user.getMatricula())
                .cargo(user.getCargo())
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal Usuario currentUser
    ) {
        if (!passwordEncoder.matches(request.getSenhaAntiga(), currentUser.getPassword())) {
            return ResponseEntity.badRequest().body("Senha atual incorreta");
        }

        currentUser.setSenha(passwordEncoder.encode(request.getNovaSenha()));
        usuarioRepository.save(currentUser);

        return ResponseEntity.ok("Senha alterada com sucesso");
    }
}
