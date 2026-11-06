
package com.worksphere.exception;

import com.worksphere.auth.AuthController.ErrorResponse;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle authorization-denied exceptions.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAuthorizationDenied(
            AuthorizationDeniedException exception
    ) {
        return error(
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                "You do not have permission to perform this action"
        );
    }

    /**
     * Handle access-denied exceptions.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException exception
    ) {
        return error(
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                "You do not have permission to perform this action"
        );
    }

    /**
     * Handle validation failures.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationFailure(
            MethodArgumentNotValidException exception
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_FAILED",
                "Request validation failed"
        );
    }

    /**
     * Handle malformed request bodies.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableMessage(
            HttpMessageNotReadableException exception
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "The request body is invalid or contains an unsupported value"
        );
    }

    /**
     * Handle files exceeding the permitted upload size.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException exception
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "FILE_TOO_LARGE",
                "Uploaded file exceeds the permitted size"
        );
    }

    /**
     * Handle missing database entities.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            EntityNotFoundException exception
    ) {
        return error(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                "The requested resource was not found"
        );
    }

    /**
     * Handle invalid arguments.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException exception
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "The request contains invalid data"
        );
    }

    /**
     * Handle database constraint violations.
     *
     * Do not expose internal database details to the client.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception
    ) {
        return error(
                HttpStatus.CONFLICT,
                "CONFLICT",
                "The request conflicts with existing data"
        );
    }

    /**
     * Handle ResponseStatusException.
     *
     * A duplicate email receives a specific error code.
     * Other HTTP 409 responses remain generic conflicts.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
            ResponseStatusException exception
    ) {
        HttpStatusCode status = exception.getStatusCode();

        if (status.value() == 409
                && "Email is already registered".equals(
                exception.getReason()
        )) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(
                            "EMAIL_ALREADY_REGISTERED",
                            "This email address already has a WorkSphere account. Please sign in or use another email."
                    ));
        }

        String code = switch (status.value()) {
            case 400 -> "INVALID_REQUEST";
            case 401 -> "UNAUTHORIZED";
            case 403 -> "FORBIDDEN";
            case 404 -> "RESOURCE_NOT_FOUND";
            case 409 -> "CONFLICT";
            default -> "REQUEST_FAILED";
        };

        String message = switch (status.value()) {
            case 400 -> "The request is invalid";
            case 401 -> "Authentication is required";
            case 403 -> "You do not have permission to perform this action";
            case 404 -> "The requested resource was not found";
            case 409 -> "The request conflicts with existing data";
            default -> "The request could not be completed";
        };

        return ResponseEntity.status(status)
                .body(new ErrorResponse(code, message));
    }

    /**
     * Handle unexpected exceptions.
     *
     * Internal exception details are not exposed.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(
            Exception exception
    ) {
        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "An unexpected server error occurred"
        );
    }

    /**
     * Common error response builder.
     */
    private ResponseEntity<ErrorResponse> error(
            HttpStatus status,
            String code,
            String message
    ) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(code, message));
    }
}
