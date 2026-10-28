package com.worksphere.onboarding;

import com.worksphere.security.DatabaseUserDetailsService;
import com.worksphere.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OnboardingController.class)
@AutoConfigureMockMvc(addFilters = false)
class OnboardingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OnboardingService onboardingService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @Test
    void createOnboardingShouldRejectMissingEmployeeId()
            throws Exception {

        mockMvc.perform(post("/api/onboardings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(onboardingService);
    }

    @Test
    void createOnboardingShouldRejectNonPositiveEmployeeId()
            throws Exception {

        mockMvc.perform(post("/api/onboardings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"employeeId": 0}
                                """))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(onboardingService);
    }

    @Test
    void updateStatusShouldRejectMissingStatus()
            throws Exception {

        mockMvc.perform(patch("/api/onboardings/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(onboardingService);
    }
}
