package com.sp.smartreceipt.user.service;

import com.sp.smartreceipt.category.service.CategoryService;
import com.sp.smartreceipt.error.exception.EmailAlreadyTakenException;
import com.sp.smartreceipt.error.exception.UserNotFoundException;
import com.sp.smartreceipt.model.NewUserByAdmin;
import com.sp.smartreceipt.model.Role;
import com.sp.smartreceipt.model.UserResponse;
import com.sp.smartreceipt.user.entity.UserEntity;
import com.sp.smartreceipt.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final CategoryService categoryService;

    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Role getUserRole(String email) {
        log.debug("Fetching role for user: {}", email);
        return userRepository.findByEmail(email)
                .map(UserEntity::getRole)
                .orElseThrow(() -> new UserNotFoundException(email));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll().stream()
                .map(this::translateToUserResponse)
                .toList();
    }

    @Transactional
    public UserResponse createUser(NewUserByAdmin newUser) {
        log.info("Creating new user: {}", newUser.getEmail());
        try {
            UserEntity user = userRepository.save(translateToEntity(newUser));
            categoryService.addPredefinedCategoriesToUser(user);
            return translateToUserResponse(user);
        } catch (DataIntegrityViolationException e) {
            throw new EmailAlreadyTakenException(newUser.getEmail());
        }
    }

    @Transactional
    public UserResponse updateUser(UUID id, NewUserByAdmin updatedUser) {
        log.info("Updating user with ID: {}", id);
        UserEntity user = userRepository.findByUserId(id)
                .orElseThrow(() -> new UserNotFoundException(id.toString()));

        user.setEmail(updatedUser.getEmail());
        user.setRole(updatedUser.getRole());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        UserEntity savedUser = userRepository.save(user);
        return translateToUserResponse(savedUser);
    }

    @Transactional
    public void deleteUserById(UUID id) {
        log.debug("Deleting user with ID: {}", id);
        if (!userRepository.existsByUserId(id)) {
            throw new UserNotFoundException(id.toString());
        }
        userRepository.deleteByUserId(id);
    }

    private UserEntity translateToEntity(NewUserByAdmin newUser) {
        return UserEntity.builder()
                .userId(UUID.randomUUID())
                .email(newUser.getEmail())
                .password(passwordEncoder.encode(newUser.getPassword())) // Password should be encoded in real implementation
                .role(newUser.getRole())
                .build();
    }

    private UserResponse translateToUserResponse(UserEntity user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
