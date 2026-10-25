package com.worksphere.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateEmployeeRequest(

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must not exceed 100 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must not exceed 100 characters")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "A valid email address is required")
        @Size(max = 254, message = "Email must not exceed 254 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 12, max = 72, message = "Password must contain 12 to 72 characters")
        String password,

        @Size(max = 30, message = "Phone must not exceed 30 characters")
        String phone,

        @Size(max = 120, message = "Job title must not exceed 120 characters")
        String jobTitle,

        @Size(max = 120, message = "Department must not exceed 120 characters")
        String department,

        LocalDate hireDate
) {
}
