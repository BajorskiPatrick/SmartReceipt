package com.sp.smartreceipt.user.controller;

import com.sp.smartreceipt.model.AuthResponse;
import com.sp.smartreceipt.model.RefreshedToken;
import com.sp.smartreceipt.model.UserLogin;
import com.sp.smartreceipt.model.UserRegistration;
import com.sp.smartreceipt.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerUser(@Valid @RequestBody UserRegistration userRequest, HttpServletResponse response) {
        return authService.registerUser(userRequest, response);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public AuthResponse login(@Valid @RequestBody UserLogin request, HttpServletResponse response) {
        authService.authenticate(request.getEmail(), request.getPassword());
        return authService.loginUser(request, response);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.OK)
    public void logout(HttpServletResponse response) {
        authService.logoutUser(response);
    }

    @PostMapping("/refresh")
    @ResponseStatus(HttpStatus.OK)
    public RefreshedToken refreshToken(HttpServletRequest request) {
        return authService.getRefreshedToken(request.getCookies());
    }
}
