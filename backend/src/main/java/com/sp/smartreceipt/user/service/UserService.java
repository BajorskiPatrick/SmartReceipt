package com.sp.smartreceipt.user.service;

import com.sp.smartreceipt.error.exception.UserNotFoundException;
import com.sp.smartreceipt.model.Role;
import com.sp.smartreceipt.user.entity.UserEntity;
import com.sp.smartreceipt.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public Role getUserRole(String email) {
        return userRepository.findByEmail(email)
                .map(UserEntity::getRole)
                .orElseThrow(() -> new UserNotFoundException(email));
    }
}
