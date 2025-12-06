package com.sp.smartreceipt.error.exception;

public class EmailAlreadyTakenException extends ResourceAlreadyExistsException {
    public EmailAlreadyTakenException(String userEmail) {
        super("Email already taken: " + userEmail);
    }
}
