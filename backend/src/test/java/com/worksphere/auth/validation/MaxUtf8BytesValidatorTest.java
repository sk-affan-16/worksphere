
package com.worksphere.auth.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MaxUtf8BytesValidatorTest {

    private MaxUtf8BytesValidator validator;

    @BeforeEach
    void setUp() {
        validator = new MaxUtf8BytesValidator();

        MaxUtf8Bytes constraint = new MaxUtf8Bytes() {
            @Override
            public int value() {
                return 72;
            }

            @Override
            public String message() {
                return "Password must not exceed 72 UTF-8 bytes";
            }

            @Override
            public Class<?>[] groups() {
                return new Class<?>[0];
            }

            @Override
            public Class<? extends jakarta.validation.Payload>[] payload() {
                return new Class[0];
            }

            @Override
            public Class<? extends java.lang.annotation.Annotation>
            annotationType() {
                return MaxUtf8Bytes.class;
            }
        };

        validator.initialize(constraint);
    }

    @Test
    void acceptsExactlySeventyTwoAsciiBytes() {
        assertTrue(validator.isValid("a".repeat(72), null));
    }

    @Test
    void rejectsSeventyThreeAsciiBytes() {
        assertFalse(validator.isValid("a".repeat(73), null));
    }

    @Test
    void acceptsEighteenEmojiWithinSeventyTwoBytes() {
        String emoji = "\uD83D\uDE00";
        assertTrue(validator.isValid(emoji.repeat(18), null));
    }

    @Test
    void rejectsNineteenEmojiExceedingSeventyTwoBytes() {
        String emoji = "\uD83D\uDE00";
        assertFalse(validator.isValid(emoji.repeat(19), null));
    }

    @Test
    void acceptsShortExistingPasswordAtValidatorLevel() {
        assertTrue(validator.isValid("old123", null));
    }

    @Test
    void acceptsNullForSeparateRequiredValueValidation() {
        assertTrue(validator.isValid(null, null));
    }
}
