package com.worksphere.employee;

import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.security.CurrentTenantService;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final CurrentTenantService currentTenantService;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            CurrentTenantService currentTenantService,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.currentTenantService = currentTenantService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public Employee createEmployee(
            String firstName,
            String lastName,
            String email,
            String password,
            String phone,
            String jobTitle,
            String department,
            java.time.LocalDate hireDate
    ) {
        validatePassword(password);

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Organization not found"
                ));

        User user = new User(
                organization,
                normalizedEmail,
                passwordEncoder.encode(password),
                User.Role.EMPLOYEE
        );

        user.setStatus(User.Status.ACTIVE);

        User savedUser = userRepository.save(user);

        Employee employee = new Employee(
                savedUser,
                firstName,
                lastName,
                phone,
                jobTitle,
                department,
                hireDate
        );

        return employeeRepository.save(employee);
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public List<Employee> getEmployees() {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return employeeRepository
                .findAllByUser_Organization_Id(organizationId);
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public Employee getEmployee(Long employeeId) {
        return findEmployeeInOrganization(employeeId);
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public Employee updateEmployee(
            Long employeeId,
            String firstName,
            String lastName,
            String phone,
            String jobTitle,
            String department,
            java.time.LocalDate hireDate
    ) {
        Employee employee = findEmployeeInOrganization(employeeId);

        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setPhone(phone);
        employee.setJobTitle(jobTitle);
        employee.setDepartment(department);
        employee.setHireDate(hireDate);

        return employeeRepository.save(employee);
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public void updateEmployeeStatus(
            Long employeeId,
            User.Status status
    ) {
        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee status is required"
            );
        }

        Employee employee = findEmployeeInOrganization(employeeId);
        employee.getUser().setStatus(status);
    }

    private Employee findEmployeeInOrganization(Long employeeId) {
        if (employeeId == null || employeeId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee ID must be a positive number"
            );
        }

        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        return employeeRepository
                .findByIdAndUser_Organization_Id(
                        employeeId,
                        organizationId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (normalizedEmail.length() > 254
                || !normalizedEmail.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid email address is required"
            );
        }

        return normalizedEmail;
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password is required"
            );
        }

        int passwordBytes =
                password.getBytes(StandardCharsets.UTF_8).length;

        if (passwordBytes < 12 || passwordBytes > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must contain between 12 and 72 UTF-8 bytes"
            );
        }
    }
}