package com.kiosco.security;

import com.kiosco.model.Administrador;
import com.kiosco.model.Cliente;
import com.kiosco.model.Persona;
import com.kiosco.record.AuthLogin;
import com.kiosco.record.AuthResponse;
import com.kiosco.repository.PersonaRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final PersonaRepo personaRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Persona persona = personaRepo.findByWhatsApp(username);
        if (persona == null) {
            throw new UsernameNotFoundException("Usuario no encontrado");
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (persona instanceof Administrador) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR"));
        }
        if (persona instanceof Cliente) {
            authorities.add(new SimpleGrantedAuthority("ROLE_CLIENTE"));
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        return new User(persona.getWhatsApp(), persona.getContrasenia(), true, true, true, true, authorities);
    }

    public Authentication authenticate(String username, String password) {
        UserDetails userDetails = this.loadUserByUsername(username);
        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username or password");
        }
        // si no es igual
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        return new UsernamePasswordAuthenticationToken(userDetails.getUsername(), userDetails.getPassword(), userDetails.getAuthorities());
    }

    public AuthResponse loginUser(AuthLogin loginDTO) {
        //Obtener usuario y contrasena
        String password = loginDTO.contrasenia();
        String whatsapp = loginDTO.whatsapp();
        Authentication authentication = this.authenticate(whatsapp, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String rol = authentication.getAuthorities().iterator().next().getAuthority().toString().replace("ROLE_", "");
        String tokenAcceso = jwtUtils.crearToken(authentication, whatsapp, rol);
        AuthResponse authResponse = new AuthResponse(whatsapp, "login ok", tokenAcceso, true);
        return authResponse;
    }

    public void logout() {
        SecurityContextHolder.clearContext();
    }
}
