package com.kiosco.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.kiosco.model.Persona;
import com.kiosco.repository.PersonaRepo;
import com.kiosco.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtUtils {
    private String privatekey = "61c3addc10f7461f4f37fca6bcfa1aef127b2440cedf86bd253155ceafec704f";
    private String userGenerator = "kioscoisabelpittana";
    private final PersonaRepo personaRepo;


    public String crearToken(Authentication authentication, String whatsapp, String rol) {
        long expiracion = 1000L * 60 * 60 * 24 * 30;
        Algorithm algorithm = Algorithm.HMAC256(this.privatekey);
        Persona persona = personaRepo.findByWhatsApp(whatsapp);
        if (persona == null) {
            throw new NotFoundException("Error al iniciar");
        }

        return JWT.create()
                .withIssuer(this.userGenerator)
                .withSubject(whatsapp)
                .withClaim("authorities", rol)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + expiracion)) // Expiración: 30 días
                .withNotBefore(new Date(System.currentTimeMillis()))
                .withJWTId(UUID.randomUUID().toString())
                .sign(algorithm);
    }

    public DecodedJWT validarToken(String token) throws JWTVerificationException {
        try {
            return JWT.require(Algorithm.HMAC256(this.privatekey))
                    .withIssuer(this.userGenerator)
                    .build()
                    .verify(token);
        } catch (JWTVerificationException e) {
            throw new JWTVerificationException("TOKEN INVALIDO O EXPIRADO");
        }
    }

    public String traerClaimEspecifico(DecodedJWT decodedJWT, String claimName) {
        if (decodedJWT.getClaim(claimName) != null && !decodedJWT.getClaim(claimName).isNull()) {
            return decodedJWT.getClaim(claimName).asString();
        } else {
            return "ERROR AL DECODIFICAR EL CLAIM";
        }

    }

    public String extraerWhatsApp(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject();
    }

    public String extraerNombre(DecodedJWT decodedJWT) {
        return decodedJWT.getClaim("nombre").asString();
    }


    public Date extraerExpiracion(DecodedJWT decodedJWT) {
        return decodedJWT.getExpiresAt();
    }
}
