
package com.worksphere.employee;

import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import com.worksphere.security.WorksphereUserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:employee-api-security;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-ms=900000"
})
@AutoConfigureMockMvc
class EmployeeApiSecurityIntegrationTest {

    private static final String EMPLOYEE_EMAIL =
            "employee-security@example.com";

    private static final String ADMIN_EMAIL =
            "admin-security@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @MockitoBean
    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        when(userDetailsService.loadUserByUsername(EMPLOYEE_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        1L, 10L, EMPLOYEE_EMAIL,
                        "test-password-hash", "EMPLOYEE", true
                ));

        when(userDetailsService.loadUserByUsername(ADMIN_EMAIL))
                .thenReturn(new WorksphereUserPrincipal(
                        2L, 10L, ADMIN_EMAIL,
                        "test-password-hash", "ORG_ADMIN", true
                ));

        when(employeeService.getEmployees()).thenReturn(List.of());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void unauthenticatedRequestCannotListEmployees() throws Exception {
        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(employeeService);
    }

    @Test
    void employeeCannotListEmployees() throws Exception {
        performEmployeeRequest(get("/api/employees"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(employeeService);
    }

    @Test
    void employeeCannotGetEmployeeById() throws Exception {
        performEmployeeRequest(get("/api/employees/25"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(employeeService);
    }

    @Test
    void employeeCannotCreateEmployee() throws Exception {
        performEmployeeRequest(
                post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "New",
                                  "lastName": "Employee",
                                  "email": "new.employee@example.com",
                                  "password": "StrongPassword-123!",
                                  "phone": "1234567890",
                                  "jobTitle": "Developer",
                                  "department": "Engineering",
                                  "hireDate": "2026-10-26"
                                }
                                """)
        ).andExpect(status().isForbidden());

        verifyNoInteractions(employeeService);
    }

    @Test
    void employeeCannotUpdateEmployee() throws Exception {
        performEmployeeRequest(
                patch("/api/employees/25")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Changed",
                                  "lastName": "Name",
                                  "phone": "1234567890",
                                  "jobTitle": "Developer",
                                  "department": "Engineering",
                                  "hireDate": "2026-10-26"
                                }
                                """)
        ).andExpect(status().isForbidden());

        verifyNoInteractions(employeeService);
    }

    @Test
    void employeeCannotChangeEmployeeStatus() throws Exception {
        performEmployeeRequest(
                patch("/api/employees/25/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "DISABLED"
                                }
                                """)
        ).andExpect(status().isForbidden());

        verifyNoInteractions(employeeService);
    }

    @Test
    void organizationAdminCanListEmployees() throws Exception {
        String token = jwtService.generateToken(ADMIN_EMAIL);

        mockMvc.perform(get("/api/employees")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        verify(userDetailsService).loadUserByUsername(ADMIN_EMAIL);
        verify(employeeService).getEmployees();
    }

    private org.springframework.test.web.servlet.ResultActions
    performEmployeeRequest(MockHttpServletRequestBuilder request)
            throws Exception {

        String token = jwtService.generateToken(EMPLOYEE_EMAIL);

        return mockMvc.perform(request.header(
                HttpHeaders.AUTHORIZATION,
                "Bearer " + token
        ));
    }
}
