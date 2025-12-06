package com.sp.smartreceipt.user.service;

import com.sp.smartreceipt.category.service.CategoryService;
import com.sp.smartreceipt.config.util.JwtUtil;
import com.sp.smartreceipt.error.exception.EmailAlreadyTakenException;
import com.sp.smartreceipt.error.exception.TokenRefreshException;
import com.sp.smartreceipt.model.*;
import com.sp.smartreceipt.user.entity.UserEntity;
import com.sp.smartreceipt.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final AuthenticationManager authenticationManager;

    private final AppUserDetailsService userDetailsService;

    private final UserService userService;

    private final CategoryService categoryService;

    private final JwtUtil jwtUtil;

    private final PasswordEncoder passwordEncoder;

    public void authenticate(String email, String password) {
        log.debug("Authenticating user: {}", email);
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    }

    @Transactional
    public AuthResponse registerUser(UserRegistration userRegistration, HttpServletResponse response) {
        log.info("Registering new user: {}", userRegistration.getEmail());
        String rawPassword = userRegistration.getPassword();
        try {
            UserEntity user = userRepository.save(translateToEntity(userRegistration));
            authenticate(user.getEmail(), rawPassword);
            categoryService.addPredefinedCategoriesToUser(user);
            return loginUser(translateToUserLogin(user), response);
        } catch (DataIntegrityViolationException e) {
            throw new EmailAlreadyTakenException(userRegistration.getEmail());
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse loginUser(UserLogin userLogin, HttpServletResponse response) {
        log.info("Generating tokens for user: {}", userLogin.getEmail());
        final UserDetails userDetails = userDetailsService.loadUserByUsername(userLogin.getEmail());

        final String accessToken = jwtUtil.generateToken(userDetails);
        final String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(refreshTokenCookie);

        return AuthResponse.builder()
                .email(userDetails.getUsername())
                .token(accessToken)
                .role(userService.getUserRole(userLogin.getEmail()))
                .build();
    }

    public void logoutUser(HttpServletResponse response) {
        log.info("Clearing security context and cookies");
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);

        SecurityContextHolder.clearContext();
    }

    @Transactional(readOnly = true)
    public RefreshedToken getRefreshedToken(Cookie[] cookies) {
        String refreshToken = null;
        if (cookies != null) {
            refreshToken = Arrays.stream(cookies)
                    .filter(cookie -> cookie.getName().equals("refreshToken"))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }

        if (refreshToken == null) {
            throw new TokenRefreshException("Refresh token not found");
        }

        String email = jwtUtil.extractUsernameFromRefreshToken(refreshToken);
        log.debug("Refreshing token for user: {}", email);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtUtil.validateRefreshToken(refreshToken, userDetails)) {
            log.warn("Invalid refresh token for user: {}", email);
            throw new TokenRefreshException("Invalid refresh token");
        }

        String newAccessToken = jwtUtil.generateToken(userDetails);
        return RefreshedToken.builder()
                .token(newAccessToken)
                .build();
    }

    private UserEntity translateToEntity(UserRegistration userRegistration) {
        return UserEntity.builder()
                .userId(UUID.randomUUID())
                .email(userRegistration.getEmail())
                .password(passwordEncoder.encode(userRegistration.getPassword()))
                .role(Role.USER)
                .build();
    }

    private UserLogin translateToUserLogin(UserEntity user) {
        return UserLogin.builder()
                .email(user.getEmail())
                .password(user.getPassword())
                .build();
    }
}
