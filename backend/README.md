# WorkSphere Backend

WorkSphere is a multi-tenant workforce and workflow management platform. This module provides the backend REST API built with Java and Spring Boot.

## Technology Stack

- Java 25
- Spring Boot (version managed through `pom.xml`)
- Maven Wrapper
- Spring Security and JWT
- Spring Data JPA / Hibernate
- MySQL for local development
- H2 in-memory database for automated tests
- JUnit and Mockito

## Prerequisites

Install or configure:

- JDK 25
- MySQL Server
- Git

Verify Java and Maven Wrapper:

```powershell
java -version
.\mvnw.cmd -version
```

The Maven Wrapper downloads and uses the Maven version configured by the project.

## Project Structure

Main source code is under `src/main/java/com/worksphere`.

Important areas include:

- `auth` — authentication and login
- `security` — JWT, authentication filters, current-user and tenant context
- `organization` — organization operations
- `employee` — employee operations
- `user` — user management
- `bootstrap` — optional initial organization administrator bootstrap

Automated tests are under `src/test/java`.

## Configuration

The application reads database and JWT settings from environment variables. Do not commit real credentials, passwords, tokens, or production signing keys.

| Environment variable | Required | Purpose |
|---|---|---|
| `DB_URL` | Yes | JDBC URL of the development MySQL database |
| `DB_USERNAME` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `JWT_SECRET` | Yes | Base64-encoded JWT signing secret |
| `JWT_EXPIRATION_MS` | No | JWT lifetime in milliseconds; defaults to `900000` (15 minutes) |

The JWT secret must satisfy the application's secret-length validation. Use a securely generated, unique secret for each environment. Never reuse the test signing key in development or production.

### Configure variables in Windows PowerShell

Set the variables in your current terminal session before starting the backend. Replace the example database name, username, and other values with your local configuration.

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/worksphere"
$env:DB_USERNAME = "your_local_mysql_username"
$env:DB_PASSWORD = "your_local_mysql_password"
$env:JWT_SECRET = "YOUR_BASE64_ENCODED_SECRET"
$env:JWT_EXPIRATION_MS = "900000"
```

These example values are placeholders, not actual credentials. The MySQL database must exist, and the JDBC URL must match your local setup.

PowerShell session variables are not permanent. Configure them again in a new terminal session, or use your approved local secret-management method.

## Optional Initial Administrator Bootstrap

The initial administrator bootstrap is disabled unless explicitly enabled with:

`WORKSPHERE_BOOTSTRAP_ENABLED=true`

When enabled, all three environment variables below are required:

- `WORKSPHERE_BOOTSTRAP_ORGANIZATION_NAME`
- `WORKSPHERE_BOOTSTRAP_ADMIN_EMAIL`
- `WORKSPHERE_BOOTSTRAP_ADMIN_PASSWORD`

Example PowerShell configuration:

```powershell
$env:WORKSPHERE_BOOTSTRAP_ENABLED = "true"
$env:WORKSPHERE_BOOTSTRAP_ORGANIZATION_NAME = "Example Organization"
$env:WORKSPHERE_BOOTSTRAP_ADMIN_EMAIL = "admin@example.invalid"
$env:WORKSPHERE_BOOTSTRAP_ADMIN_PASSWORD = "REPLACE_WITH_A_STRONG_PASSWORD"
```

Use a real, controlled administrator email and a strong, unique password in your local environment. Do not commit the password.

The bootstrap refuses to initialize if organizations or users already exist. The administrator password is hashed before it is saved. The password must be between 12 and 72 UTF-8 bytes.

After successful initialization, disable the bootstrap setting and remove the bootstrap credentials from the environment. Do not enable this process casually against a populated or production database.

## Run the Backend

From the backend directory, configure the required database and JWT environment variables, then run:

```powershell
.\mvnw.cmd spring-boot:run
```

The application uses the configuration in `src/main/resources/application.properties`.

The actual server port and available API routes should be checked against the current application configuration and controllers.

## Build and Test

Run the full verification lifecycle:

```powershell
.\mvnw.cmd clean verify
```

Run tests without cleaning previous build output:

```powershell
.\mvnw.cmd test
```

Automated tests use an isolated H2 in-memory database configured in `src/test/resources/application.properties`. The test schema is recreated for the test application context and is not the development MySQL database.

The test JWT key is for automated tests only. Never use it as a production secret.

## Security Notes

- Tenant identity must come from the authenticated security context, not a client-supplied tenant ID.
- Tenant-scoped operations must prevent access to another organization's data.
- Passwords must be stored using the configured password encoder.
- Protect JWT signing secrets and database credentials.
- Review roles and permissions whenever a protected endpoint is added.
- Validate request data and return appropriate HTTP error responses.
- The current development configuration uses `spring.jpa.hibernate.ddl-auto=update`. Review schema migration and database backup procedures before production deployment.
- Configure CORS for the actual trusted frontend origins in each environment.
- Do not disable security checks to make tests or local startup pass.

## Troubleshooting

### Database connection fails

1. Confirm MySQL is running.
2. Confirm the database exists.
3. Check `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
4. Verify that the database driver and JDBC URL are compatible with the project.

### Missing configuration error

Check that all required environment variables are set in the same terminal session used to launch the application. Do not print secret values when troubleshooting.

### Tests fail

Run:

```powershell
.\mvnw.cmd clean verify
```

Read the first relevant test failure and its stack trace. Fix the cause rather than skipping the test or weakening security assertions.

## Git Workflow

- Develop on a feature branch, not directly on `main`.
- Keep changes small and focused.
- Run relevant tests before committing.
- Review the Git diff before pushing.
- Submit a pull request and merge only after review and successful checks.

## Production Readiness

This README describes the current development setup, not a complete production deployment procedure. Before production use, review database migrations, secrets management, HTTPS, CORS, backups, logging, monitoring, deployment configuration, and security tests.
