package com.sp.smartreceipt.config.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret.key}")
    private String SECRET_KEY;

    @Value("${jwt.refresh.secret.key}")
    private String REFRESH_SECRET_KEY;

    private final long ACCESS_TOKEN_VALIDITY = 1000 * 60 * 15;

    private final long REFRESH_TOKEN_VALIDITY = 1000 * 60 * 60 * 24 * 7;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername(), SECRET_KEY, ACCESS_TOKEN_VALIDITY);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername(), REFRESH_SECRET_KEY, REFRESH_TOKEN_VALIDITY);
    }

    private String createToken(Map<String, Object> claims, String subject, String secretKey, long validity) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + validity))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    // --- Obsługa Access Tokena (używa SECRET_KEY) ---

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject, SECRET_KEY);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration, SECRET_KEY);
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token, SECRET_KEY));
    }

    // --- Obsługa Refresh Tokena (używa REFRESH_SECRET_KEY) ---

    public String extractUsernameFromRefreshToken(String token) {
        return extractClaim(token, Claims::getSubject, REFRESH_SECRET_KEY);
    }

    public Date extractExpirationFromRefreshToken(String token) {
        return extractClaim(token, Claims::getExpiration, REFRESH_SECRET_KEY);
    }

    public Boolean validateRefreshToken(String token, UserDetails userDetails) {
        final String username = extractUsernameFromRefreshToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token, REFRESH_SECRET_KEY));
    }

    // --- Metody pomocnicze i generyczne (obsługują oba klucze) ---

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver, String secretKey) {
        final Claims claims = extractAllClaims(token, secretKey);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token, String secretKey) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token, String secretKey) {
        return extractClaim(token, Claims::getExpiration, secretKey).before(new Date());
    }
}