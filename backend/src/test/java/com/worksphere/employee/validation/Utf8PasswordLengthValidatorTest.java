package com.worksphere.employee.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class Utf8PasswordLengthValidatorTest {

    private Utf8PasswordLengthValidator validator;
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new Utf8PasswordLengthValidator();
        context = mock(ConstraintValidatorContext.class);
    }

    @Test
    void acceptsPasswordWithExactlyTwelveAsciiCharacters() {
        assertTrue(validator.isValid("abcdefghijkl", context));
    }

    @Test
    void rejectsPasswordWithElevenCharacters() {
        assertFalse(validator.isValid("abcdefghijk", context));
    }

    @Test
    void acceptsPasswordWithExactlySeventyTwoUtf8Bytes() {
        assertTrue(validator.isValid("a".repeat(72), context));
    }

    @Test
    void rejectsPasswordWithMoreThanSeventyTwoUtf8Bytes() {
        assertFalse(validator.isValid("a".repeat(73), context));
    }

    @Test
    void acceptsTwelveUnicodeCharactersWithinByteLimit() {
        assertTrue(validator.isValid("😀".repeat(12), context));
    }

    @Test
    void rejectsTwelveUnicodeCharactersExceedingByteLimit() {
        assertFalse(validator.isValid("😀".repeat(19), context));
    }

    @Test
    void acceptsNullBecauseNotBlankValidatesRequiredValue() {
        assertTrue(validator.isValid(null, context));
    }

    @Test
    void acceptsBlankBecauseNotBlankValidatesRequiredValue() {
        assertTrue(validator.isValid("            ", context));
    }
}
