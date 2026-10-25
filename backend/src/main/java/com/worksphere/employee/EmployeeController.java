package com.worksphere.employee;

import com.worksphere.employee.dto.CreateEmployeeRequest;
import com.worksphere.employee.dto.EmployeeResponse;
import com.worksphere.employee.dto.UpdateEmployeeRequest;
import com.worksphere.employee.dto.UpdateEmployeeStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@PreAuthorize("hasRole('ORG_ADMIN')")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request
    ) {
        Employee employee = employeeService.createEmployee(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.password(),
                request.phone(),
                request.jobTitle(),
                request.department(),
                request.hireDate()
        );

        return EmployeeResponse.from(employee);
    }

    @GetMapping
    public List<EmployeeResponse> getEmployees() {
        return employeeService.getEmployees()
                .stream()
                .map(EmployeeResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployee(@PathVariable("id") Long id) {
        return EmployeeResponse.from(
                employeeService.getEmployee(id)
        );
    }

    @PatchMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateEmployeeRequest request
    ) {
        Employee employee = employeeService.updateEmployee(
                id,
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.jobTitle(),
                request.department(),
                request.hireDate()
        );

        return EmployeeResponse.from(employee);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateEmployeeStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateEmployeeStatusRequest request
    ) {
        employeeService.updateEmployeeStatus(id, request.status());
    }
}
