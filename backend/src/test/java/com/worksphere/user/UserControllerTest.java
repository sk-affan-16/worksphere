
package com.worksphere.user;

import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @Test
    void getAllUsersReturnsUserResponsesWithoutSensitiveFields()
            throws Exception {

        User user = createUser(10L, "employee@example.com");

        when(userService.getAllUsers())
                .thenReturn(List.of(user));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].email")
                        .value("employee@example.com"))
                .andExpect(jsonPath("$[0].role").value("EMPLOYEE"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$[0].createdAt")
                        .value("2026-10-24T10:00:00Z"))
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$[0].organization").doesNotExist());

        verify(userService).getAllUsers();
        verifyNoMoreInteractions(userService);
    }

    @Test
    void getAllUsersReturnsEmptyArrayWhenNoUsersExist()
            throws Exception {

        when(userService.getAllUsers()).thenReturn(List.of());

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(userService).getAllUsers();
        verifyNoMoreInteractions(userService);
    }

    @Test
    void getUserByIdReturnsUserResponse() throws Exception {

        User user = createUser(25L, "person@example.com");

        when(userService.getUserById(25L)).thenReturn(user);

        mockMvc.perform(get("/api/users/25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(25))
                .andExpect(jsonPath("$.email")
                        .value("person@example.com"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.organization").doesNotExist());

        verify(userService).getUserById(25L);
        verifyNoMoreInteractions(userService);
    }

    @Test
    void getUserByIdReturnsNotFoundWhenServiceCannotFindUser()
            throws Exception {

        when(userService.getUserById(999L))
                .thenThrow(
                        new jakarta.persistence.EntityNotFoundException(
                                "User not found"
                        )
                );

        mockMvc.perform(get("/api/users/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("User not found"));

        verify(userService).getUserById(999L);
        verifyNoMoreInteractions(userService);
    }

    @Test
    void getUserByIdReturnsBadRequestForInvalidId()
            throws Exception {

        when(userService.getUserById(0L))
                .thenThrow(
                        new IllegalArgumentException(
                                "User ID must be a positive number"
                        )
                );

        mockMvc.perform(get("/api/users/0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));

        verify(userService).getUserById(0L);
        verifyNoMoreInteractions(userService);
    }

    private User createUser(Long id, String email) {
        User user = org.mockito.Mockito.mock(User.class);

        when(user.getId()).thenReturn(id);
        when(user.getEmail()).thenReturn(email);
        when(user.getRole()).thenReturn(User.Role.EMPLOYEE);
        when(user.getStatus()).thenReturn(User.Status.ACTIVE);
        when(user.getCreatedAt()).thenReturn(
                Instant.parse("2026-10-24T10:00:00Z")
        );

        return user;
    }
}
