package com.sp.smartreceipt.error.exception;

public class EmptyFileException extends FileUploadException {
    public EmptyFileException() {
        super("No file was uploaded");
    }
}
