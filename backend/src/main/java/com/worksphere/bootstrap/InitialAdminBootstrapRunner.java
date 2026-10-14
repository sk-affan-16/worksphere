package com.worksphere.bootstrap;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        prefix = "worksphere.bootstrap",
        name = "enabled",
        havingValue = "true"
)
public class InitialAdminBootstrapRunner implements ApplicationRunner {

    private final Environment environment;
    private final InitialAdminBootstrapService bootstrapService;

    public InitialAdminBootstrapRunner(
            Environment environment,
            InitialAdminBootstrapService bootstrapService) {
        this.environment = environment;
        this.bootstrapService = bootstrapService;
    }

    @Override
    public void run(ApplicationArguments args) {
        String organizationName = required("WORKSPHERE_BOOTSTRAP_ORGANIZATION_NAME");
        String adminEmail = required("WORKSPHERE_BOOTSTRAP_ADMIN_EMAIL");
        String adminPassword = required("WORKSPHERE_BOOTSTRAP_ADMIN_PASSWORD");

        bootstrapService.initialize(organizationName, adminEmail, adminPassword);
    }

    private String required(String name) {
        String value = environment.getProperty(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Bootstrap is enabled but required environment variable " + name
                            + " is missing");
        }
        return value;
    }
}
