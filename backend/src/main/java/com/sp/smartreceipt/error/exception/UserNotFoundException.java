package com.sp.smartreceipt.error.exception;

public class UserNotFoundException extends ResourceNotFoundException {
    public UserNotFoundException(String userCredential) {
        super("User with email/ID: " + userCredential + " does not exist");
    }
}
