
package com.worksphere.user;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Lists users belonging to the authenticated organization.
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(UserResponse::from)
                .toList();

        return ResponseEntity.ok(users);
    }

    /**
     * Retrieves one user belonging to the authenticated organization.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id
    ) {
        UserResponse response =
                UserResponse.from(userService.getUserById(id));

        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(
            EntityNotFoundException exception
    ) {
        return ResponseEntity.status(404)
                .body(new ApiError(
                        "USER_NOT_FOUND",
                        "User not found"
                ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleInvalidArgument(
            IllegalArgumentException exception
    ) {
        return ResponseEntity.badRequest()
                .body(new ApiError(
                        "INVALID_REQUEST",
                        exception.getMessage()
                ));
    }

    public record ApiError(String code, String message) {
    }
}
