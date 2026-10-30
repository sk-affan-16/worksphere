package com.worksphere.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = Utf8PasswordLengthValidator.class)
@Target({
        ElementType.FIELD,
        ElementType.PARAMETER,
        ElementType.RECORD_COMPONENT,
        ElementType.ANNOTATION_TYPE
})
@Retention(RetentionPolicy.RUNTIME)
public @interface Utf8PasswordLength {

    String message() default
            "Password must contain at least 12 characters and no more than 72 UTF-8 bytes";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
