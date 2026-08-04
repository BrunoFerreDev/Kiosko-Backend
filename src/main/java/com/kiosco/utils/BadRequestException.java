package com.kiosco.utils;

public class BadRequestException extends ApiException {
    public BadRequestException(String message) {
        super(message);
    }
}
