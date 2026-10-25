package com.worksphere.employee.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.nio.charset.StandardCharsets;

public class Utf8PasswordLengthValidator
        implements ConstraintValidator<Utf8PasswordLength, String> {

    @Override
    public boolean isValid(
            String password,
            ConstraintValidatorContext context
    ) {
        if (password == null || password.isBlank()) {
            return true;
        }

        int characterCount =
                password.codePointCount(0, password.length());

        int byteCount =
                password.getBytes(StandardCharsets.UTF_8).length;

        return characterCount >= 12 && byteCount <= 72;
    }
}
