
package com.worksphere.user;

import com.worksphere.organization.Organization;
import com.worksphere.organization.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UserRepositoryTenantIsolationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    private Organization organizationA;
    private Organization organizationB;
    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        organizationA = organizationRepository.saveAndFlush(
                new Organization("Organization A")
        );

        organizationB = organizationRepository.saveAndFlush(
                new Organization("Organization B")
        );

        userA = userRepository.saveAndFlush(
                new User(
                        organizationA,
                        "employee-a@example.com",
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );

        userB = userRepository.saveAndFlush(
                new User(
                        organizationB,
                        "employee-b@example.com",
                        "test-password-hash",
                        User.Role.EMPLOYEE
                )
        );
    }

    @Test
    void organizationAQueryReturnsOnlyItsOwnUsers() {
        List<User> users =
                userRepository.findAllByOrganization_Id(
                        organizationA.getId()
                );

        assertEquals(1, users.size());
        assertEquals(userA.getId(), users.get(0).getId());
        assertEquals(
                organizationA.getId(),
                users.get(0).getOrganization().getId()
        );
    }

    @Test
    void organizationBQueryReturnsOnlyItsOwnUsers() {
        List<User> users =
                userRepository.findAllByOrganization_Id(
                        organizationB.getId()
                );

        assertEquals(1, users.size());
        assertEquals(userB.getId(), users.get(0).getId());
    }

    @Test
    void cannotFindOrganizationBUserThroughOrganizationAQuery() {
        Optional<User> result =
                userRepository.findByIdAndOrganization_Id(
                        userB.getId(),
                        organizationA.getId()
                );

        assertFalse(result.isPresent());
    }

    @Test
    void canFindOrganizationBUserThroughItsOwnOrganizationQuery() {
        Optional<User> result =
                userRepository.findByIdAndOrganization_Id(
                        userB.getId(),
                        organizationB.getId()
                );

        assertTrue(result.isPresent());
        assertEquals(userB.getId(), result.get().getId());
    }
}
