package com.sp.smartreceipt.error.exception;

public class UserNotFoundException extends ResourceNotFoundException {
    public UserNotFoundException(String userEmail) {
        super("User with email: " + userEmail + " does not exist");
    }
}
