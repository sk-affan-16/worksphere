package com.worksphere.employee.dto;

import com.worksphere.user.User;
import jakarta.validation.constraints.NotNull;

public record UpdateEmployeeStatusRequest(

        @NotNull(message = "Employee status is required")
        User.Status status
) {
}
