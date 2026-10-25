package com.worksphere.employee.dto;

import com.worksphere.employee.Employee;
import com.worksphere.user.User;

import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        Long userId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String jobTitle,
        String department,
        LocalDate hireDate,
        User.Status status
) {

    public static EmployeeResponse from(Employee employee) {
        User user = employee.getUser();

        return new EmployeeResponse(
                employee.getId(),
                user.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                user.getEmail(),
                employee.getPhone(),
                employee.getJobTitle(),
                employee.getDepartment(),
                employee.getHireDate(),
                user.getStatus()
        );
    }
}
