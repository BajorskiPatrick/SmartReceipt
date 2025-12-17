package com.sp.smartreceipt.user.controller;

import com.sp.smartreceipt.error.exception.DataValidationException;
import com.sp.smartreceipt.model.NewUserByAdmin;
import com.sp.smartreceipt.model.UserResponse;
import com.sp.smartreceipt.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/users")
public class UserController {

    private final UserService userService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createNewUser(@RequestBody NewUserByAdmin newUser) {
        if (newUser.getPassword() == null || newUser.getPassword().isEmpty() || newUser.getPassword().length() < 6) {
            throw new DataValidationException("Password length should be at least 6 characters");
        }
        return userService.createUser(newUser);
    }

    @PutMapping("/{userId}")
    @ResponseStatus(HttpStatus.OK)
    public UserResponse updateUser(@PathVariable("userId") UUID userId, @RequestBody NewUserByAdmin newUser) {
        if (newUser.getPassword() == null || newUser.getPassword().isEmpty() || newUser.getPassword().length() < 6) {
            throw new DataValidationException("Password length should be at least 6 characters");
        }
        return userService.updateUser(userId, newUser);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable("userId") UUID userId) {
        userService.deleteUserById(userId);
    }
}
