
package com.worksphere.auth;

import com.worksphere.auth.dto.OrganizationRegisterRequest;
import com.worksphere.auth.dto.OrganizationSignupRequest;
import com.worksphere.auth.dto.OrganizationSignupResponse;
import com.worksphere.employee.Employee;
import com.worksphere.employee.EmployeeRepository;
import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;

@ExtendWith(MockitoExtension.class)
class OrganizationSignupServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private OrganizationSignupService signupService;

    // Existing JSON signup tests

    @Test
    void successfullyRegistersOrganizationAndAdmin() {

        OrganizationSignupRequest request =
                new OrganizationSignupRequest(
                        "  WorkSphere Technologies  ",
                        " ADMIN@EXAMPLE.COM ",
                        "StrongPassword123"
                );

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("StrongPassword123"))
                .thenReturn("encoded-password");

        when(organizationRepository.save(any(Organization.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OrganizationSignupResponse response =
                signupService.signup(request);

        assertNotNull(response);
        assertEquals("WorkSphere Technologies", response.organizationName());
        assertEquals("admin@example.com", response.email());
        assertEquals("Organization registered successfully", response.message());

        ArgumentCaptor<Organization> organizationCaptor =
                ArgumentCaptor.forClass(Organization.class);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(organizationRepository).save(organizationCaptor.capture());
        verify(userRepository).save(userCaptor.capture());

        Organization savedOrganization = organizationCaptor.getValue();
        User savedAdmin = userCaptor.getValue();

        assertEquals("WorkSphere Technologies", savedOrganization.getName());
        assertEquals("admin@example.com", savedAdmin.getEmail());
        assertEquals(User.Role.ORG_ADMIN, savedAdmin.getRole());
        assertEquals(User.Status.ACTIVE, savedAdmin.getStatus());
        assertEquals("encoded-password", savedAdmin.getPasswordHash());

        assertSame(savedOrganization, savedAdmin.getOrganization());

        verify(passwordEncoder).encode("StrongPassword123");
    }

    @Test
    void rejectsDuplicateEmail() {

        OrganizationSignupRequest request =
                new OrganizationSignupRequest(
                        "WorkSphere",
                        "admin@example.com",
                        "StrongPassword123"
                );

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(mock(User.class)));

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> signupService.signup(request)
                );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(organizationRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void trimsOrganizationNameAndNormalizesEmail() {

        OrganizationSignupRequest request =
                new OrganizationSignupRequest(
                        "  My Company  ",
                        "  ADMIN@EXAMPLE.COM  ",
                        "StrongPassword123"
                );

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode(any()))
                .thenReturn("encoded-password");

        when(organizationRepository.save(any(Organization.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        signupService.signup(request);

        ArgumentCaptor<Organization> organizationCaptor =
                ArgumentCaptor.forClass(Organization.class);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(organizationRepository).save(organizationCaptor.capture());
        verify(userRepository).save(userCaptor.capture());

        assertEquals("My Company", organizationCaptor.getValue().getName());
        assertEquals("admin@example.com", userCaptor.getValue().getEmail());
    }

    // New registration tests

    private OrganizationRegisterRequest registrationRequest(
            MockMultipartFile photo
    ) {
        OrganizationRegisterRequest request =
                new OrganizationRegisterRequest();

        request.setOrganizationName("WorkSphere Technologies");
        request.setFirstName("Affan");
        request.setLastName("Raja");
        request.setEmail(" ADMIN@EXAMPLE.COM ");
        request.setJobTitle("Administrator");
        request.setDepartment("Management");
        request.setPhone("9876543210");
        request.setPassword("StrongPassword123");
        request.setProfilePhoto(photo);

        return request;
    }

    private MockMultipartFile validPng() throws Exception {

        BufferedImage image = new BufferedImage(
                1,
                1,
                BufferedImage.TYPE_INT_ARGB
        );

        ByteArrayOutputStream output =
                new ByteArrayOutputStream();

        ImageIO.write(image, "png", output);

        return new MockMultipartFile(
                "profilePhoto",
                "profile.png",
                "image/png",
                output.toByteArray()
        );
    }

    @Test
    void successfullyRegistersOrganizationAdminAndEmployee()
            throws Exception {

        OrganizationRegisterRequest request =
                registrationRequest(validPng());

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("StrongPassword123"))
                .thenReturn("encoded-password");

        when(organizationRepository.save(any(Organization.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        OrganizationSignupResponse response =
                signupService.register(request);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(userCaptor.capture());

        User savedAdmin = userCaptor.getValue();

        assertNotNull(response);
        assertEquals("admin@example.com", savedAdmin.getEmail());
        assertEquals(User.Role.ORG_ADMIN, savedAdmin.getRole());
        assertEquals(User.Status.ACTIVE, savedAdmin.getStatus());
        assertEquals("encoded-password", savedAdmin.getPasswordHash());

        verify(passwordEncoder).encode("StrongPassword123");

        verify(organizationRepository).save(any(Organization.class));
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void rejectsDuplicateEmailDuringRegistration() {

        OrganizationRegisterRequest request =
                registrationRequest(null);

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(mock(User.class)));

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> signupService.register(request)
                );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(organizationRepository);
        verifyNoInteractions(employeeRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void rejectsInvalidProfilePhoto() {

        MockMultipartFile invalidPhoto =
                new MockMultipartFile(
                        "profilePhoto",
                        "profile.png",
                        "image/png",
                        new byte[]{1, 2, 3, 4, 5}
                );

        OrganizationRegisterRequest request =
                registrationRequest(invalidPhoto);

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> signupService.register(request)
                );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(organizationRepository);
        verifyNoInteractions(passwordEncoder);
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(employeeRepository);
    }

    @Test
    void rejectsProfilePhotoLargerThanTwoMb() {

        byte[] oversizedBytes = new byte[(2 * 1024 * 1024) + 1];

        MockMultipartFile oversizedPhoto =
                new MockMultipartFile(
                        "profilePhoto",
                        "large.png",
                        "image/png",
                        oversizedBytes
                );

        OrganizationRegisterRequest request =
                registrationRequest(oversizedPhoto);

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> signupService.register(request)
                );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());

        verifyNoInteractions(organizationRepository);
        verifyNoInteractions(passwordEncoder);
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(employeeRepository);
    }

    @Test
    void retrievesAuthenticatedUsersProfilePhoto() throws Exception {

        byte[] photoBytes = validPng().getBytes();

        Employee employee = mock(Employee.class);

        when(employeeRepository.findByUser_Id(10L))
                .thenReturn(Optional.of(employee));

        when(employee.getProfilePhoto())
                .thenReturn(photoBytes);

        when(employee.getProfilePhotoContentType())
                .thenReturn("image/png");

        OrganizationSignupService.ProfilePhoto photo =
                signupService.getProfilePhoto(10L);

        assertArrayEquals(photoBytes, photo.bytes());
        assertEquals("image/png", photo.contentType());
    }

    @Test
    void returnsNotFoundWhenProfilePhotoDoesNotExist() {

        Employee employee = mock(Employee.class);

        when(employeeRepository.findByUser_Id(10L))
                .thenReturn(Optional.of(employee));

        when(employee.getProfilePhoto()).thenReturn(null);

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> signupService.getProfilePhoto(10L)
                );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}
