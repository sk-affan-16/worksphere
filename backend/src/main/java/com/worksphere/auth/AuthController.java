package com.worksphere.auth;

import com.worksphere.auth.dto.LoginRequest;
import com.worksphere.auth.dto.LoginResponse;
import com.worksphere.auth.dto.OrganizationRegisterRequest;
import com.worksphere.auth.dto.OrganizationSignupRequest;
import com.worksphere.auth.dto.OrganizationSignupResponse;
import com.worksphere.auth.dto.UserProfileResponse;
import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.security.WorksphereUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OrganizationSignupService organizationSignupService;
    private final EmployeeRepository employeeRepository;

    public AuthController(
            AuthService authService,
            OrganizationSignupService organizationSignupService,
            EmployeeRepository employeeRepository
    ) {
        this.authService = authService;
        this.organizationSignupService = organizationSignupService;
        this.employeeRepository = employeeRepository;
    }

    // Login API
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    // Existing JSON signup API - preserved
    @PostMapping("/signup")
    public ResponseEntity<OrganizationSignupResponse> signup(
            @Valid @RequestBody OrganizationSignupRequest request
    ) {
        OrganizationSignupResponse response =
                organizationSignupService.signup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Multipart organization registration API
    @PostMapping(
            value = "/register",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<OrganizationSignupResponse> register(
            @Valid @ModelAttribute OrganizationRegisterRequest request
    ) {
        OrganizationSignupResponse response =
                organizationSignupService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Retrieve the authenticated user's own profile photo
    @GetMapping("/profile-photo")
    public ResponseEntity<byte[]> getProfilePhoto(
            @AuthenticationPrincipal WorksphereUserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OrganizationSignupService.ProfilePhoto photo =
                organizationSignupService.getProfilePhoto(
                        principal.getUserId()
                );

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.contentType()))
                .cacheControl(CacheControl.noStore())
                .body(photo.bytes());
    }

    // Retrieve the authenticated user's profile
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(
            @AuthenticationPrincipal WorksphereUserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Employee employee = employeeRepository
                .findByUser_Id(principal.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee profile not found"
                ));

        UserProfileResponse response = new UserProfileResponse(
                principal.getUserId(),
                principal.getOrganizationId(),
                principal.getUsername(),
                principal.getRole(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getJobTitle(),
                employee.getProfilePhoto() == null
                        ? null
                        : "/api/auth/profile-photo"
        );

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
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