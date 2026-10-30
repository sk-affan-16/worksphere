
package com.worksphere.auth;

import com.worksphere.auth.dto.LoginRequest;
import com.worksphere.auth.dto.LoginResponse;
import com.worksphere.auth.dto.OrganizationSignupRequest;
import com.worksphere.auth.dto.OrganizationSignupResponse;
import com.worksphere.auth.dto.UserProfileResponse;
import com.worksphere.security.WorksphereUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OrganizationSignupService organizationSignupService;

    public AuthController(
            AuthService authService,
            OrganizationSignupService organizationSignupService
    ) {
        this.authService = authService;
        this.organizationSignupService = organizationSignupService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<OrganizationSignupResponse> signup(
            @Valid @RequestBody OrganizationSignupRequest request
    ) {
        OrganizationSignupResponse response =
                organizationSignupService.signup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(
            @AuthenticationPrincipal WorksphereUserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserProfileResponse response = new UserProfileResponse(
                principal.getUserId(),
                principal.getOrganizationId(),
                principal.getUsername(),
                principal.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationFailure(
            AuthenticationException exception
    ) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        "INVALID_CREDENTIALS",
                        "Invalid email or password"
                ));
    }

    public record ErrorResponse(String code, String message) {
    }
}
