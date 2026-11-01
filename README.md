# WorkSphere — Workforce & Workflow Management Platform

WorkSphere is a multi-tenant enterprise SaaS platform designed to help organizations manage their workforce and organizational operations through a centralized application. The project focuses on secure authentication, role-based access control, organization management, employee management, and a foundation for onboarding, document management, task workflows, notifications, and dashboards.

The platform is being developed using Java, Spring Boot, Spring Security, JWT, Spring Data JPA, MySQL, Angular, and TypeScript.

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Project Objectives](#project-objectives)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Data Model](#core-data-model)
- [Backend API Overview](#backend-api-overview)
- [Security and Multi-Tenancy](#security-and-multi-tenancy)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Team Responsibilities](#team-responsibilities)
- [Git Workflow](#git-workflow)
- [Development Roadmap](#development-roadmap)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)

## Project Overview

Modern organizations manage employee information, user accounts, onboarding activities, documents, and daily work across multiple tools. This can lead to duplicated information, manual processes, limited visibility, and inconsistent access control.

WorkSphere aims to bring these activities into a centralized platform while maintaining clear boundaries between organizations.

The application follows a multi-tenant architecture in which multiple organizations can use the same platform without being allowed to access one another's private data.

The project is being developed as a modular, maintainable, and security-conscious application using a layered backend architecture and an Angular frontend.

## Problem Statement

Organizations often face the following challenges:

- Employee information is scattered across spreadsheets, emails, and separate applications.
- Managing employee records manually requires time and effort.
- Different organizations require separate and secure access to their information.
- Unauthorized access to employee and organizational data can create security risks.
- Employee onboarding and document-related activities may require repeated manual follow-ups.
- Managers need a centralized view of organizational operations and work progress.
- Integrating multiple workforce processes becomes difficult as an organization grows.

WorkSphere addresses these challenges through centralized workforce management, organization-scoped data access, authentication, authorization, and a modular application architecture.

## Project Objectives

1. Develop a centralized workforce and workflow management platform.
2. Support multiple organizations within a shared application.
3. Enforce organization-level data isolation.
4. Provide secure user authentication using Spring Security and JWT.
5. Implement role-based access control.
6. Manage organization profiles, user accounts, and employee records.
7. Establish a maintainable backend architecture with clear separation of responsibilities.
8. Provide REST APIs for frontend integration.
9. Support automated testing of business logic and security-sensitive operations.
10. Provide a foundation for onboarding, documents, tasks, workflows, notifications, and dashboards.
11. Improve maintainability, reliability, and future extensibility.

## Key Features

### 1. Authentication and Authorization

The backend includes an authentication foundation built with Spring Security and JWT.

Key capabilities include:

- Login through a REST API.
- Password verification using a password encoder.
- JWT generation and validation.
- Authentication of subsequent requests using bearer tokens.
- Role-based access restrictions.
- Account and organization status checks.
- Stateless HTTP authentication.
- Centralized security configuration.

### 2. Organization Management

The organization module represents the tenant boundary of the application.

Verified backend capabilities include:

- Organization information management.
- Retrieval of the authenticated user's organization.
- Updating supported organization details.
- Organization status management within the backend domain model.
- Organization-scoped access through the authenticated user's context.

### 3. Employee Management

The employee module manages workforce profile information.

Verified backend API operations include:

- Creating employee records.
- Listing employees.
- Retrieving an employee by ID.
- Updating supported employee details.
- Updating employee status.
- Associating employee profiles with user accounts.
- Restricting employee-management operations to authorized organization administrators.

### 4. User Management

The user module represents application accounts and their access-related information.

Verified backend capabilities include:

- Listing users belonging to the current organization.
- Retrieving user details within the current organization.
- Maintaining user roles and account status.
- Keeping account information separate from employee profile information.

### 5. Employee Onboarding

Planned module.

The intended purpose is to organize employee joining activities, checklists, and onboarding progress. The exact functionality depends on the completed onboarding implementation.

### 6. Document Management

Planned module.

The intended purpose is to organize employee-related documents and support secure document access. File storage, upload/download APIs, and document-specific permissions must be implemented and verified as part of this module.

### 7. Tasks and Workflow Management

Planned module.

The intended purpose is to support task assignment, work tracking, workflow progression, and operational coordination.

### 8. Notifications

Planned module.

The intended purpose is to provide relevant updates and reminders for organizational activities and workflows.

### 9. Dashboard

Frontend and integration workstream.

The intended purpose is to provide users with a consolidated view of relevant workforce and workflow information. Dashboard metrics and displayed information depend on the APIs and frontend components that have been implemented and integrated.

> **Implementation status:** Authentication, organization, employee, user-management, and security foundations are present in the inspected backend source. Onboarding, documents, tasks, workflows, notifications, and dashboard functionality should be considered complete only after verification against the integrated repository and working application.

## User Roles

The inspected backend currently defines the following roles:

### ORG_ADMIN — Organization Administrator

The organization administrator has privileged access to supported organization-management operations.

The employee and user-management controllers include role restrictions requiring `ORG_ADMIN` for their protected operations.

### EMPLOYEE — Employee

The employee role represents a regular application account. Its complete self-service permissions depend on the endpoints and authorization rules implemented for employee-facing functionality.

Roles are enforced by the backend. Frontend navigation or hidden buttons alone must never be treated as authorization controls.

## Technology Stack

| Technology | Purpose |
|---|---|
| Java | Backend programming language |
| Spring Boot | Backend application framework |
| Spring Web MVC | REST API development |
| Spring Security | Authentication and authorization |
| JWT / JJWT | Signed bearer-token authentication |
| Spring Data JPA | Database access and repository operations |
| Hibernate | ORM and entity persistence |
| MySQL | Development and application database |
| Angular | Frontend application framework |
| TypeScript | Frontend programming language |
| HTML and CSS | User interface structure and styling |
| Maven | Backend dependency management and builds |
| JUnit | Automated testing |
| Mockito | Mocking dependencies in unit tests |
| H2 | In-memory database for supported automated tests |
| Git and GitHub | Version control and team collaboration |
| Docker | Planned or environment-dependent containerization |

## System Architecture

WorkSphere follows a layered backend architecture.

```text
Angular Frontend
       |
       | HTTP / JSON
       v
Spring Security and JWT Filter
       |
       v
REST Controllers
       |
       v
Service Layer
       |
       v
Repository Layer
       |
       v
JPA / Hibernate
       |
       v
MySQL Database
```

### Frontend Layer

The Angular frontend provides the user interface for authentication, forms, tables, navigation, and integrated application features.

### Security Layer

Spring Security and the JWT authentication filter validate requests and establish the authenticated user context.

### Controller Layer

Controllers expose REST endpoints, accept requests, and return appropriate responses. They delegate business operations to services.

### Service Layer

Services contain business rules, authorization-sensitive operations, and tenant-scoped application logic.

### Repository Layer

Repositories handle database queries and persistence through Spring Data JPA.

### Database Layer

MySQL stores persistent application records, including organizations, users, and employees.

## Core Data Model

The core backend contains the following entities:

### Organization

Represents an organization and its tenant boundary.

Important fields include:

- `id`
- `name`
- `status`
- `createdAt`

### User

Represents an application account.

Important fields include:

- `id`
- `organization`
- `email`
- `passwordHash`
- `role`
- `status`
- `createdAt`

### Employee

Represents a workforce profile.

Important fields include:

- `id`
- First name
- Last name
- Phone
- Job title
- Department
- Hire date
- Associated user account

### Relationships

- One organization can have multiple users.
- Each user belongs to an organization.
- An employee profile is associated with a user account through a one-to-one relationship in the inspected model.
- User role and status are used in access-control decisions.
- Organization status can affect whether associated accounts are allowed to authenticate.

The database schema should be verified against the current entity mappings and generated migrations before deployment.

## Backend API Overview

The following endpoints are present in the inspected backend source.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate a user and obtain a JWT |
| GET | `/api/organizations/me` | Retrieve the authenticated user's organization |
| PATCH | `/api/organizations/me` | Update supported organization details |
| POST | `/api/employees` | Create an employee |
| GET | `/api/employees` | List employees |
| GET | `/api/employees/{id}` | Retrieve employee details |
| PATCH | `/api/employees/{id}` | Update employee details |
| PATCH | `/api/employees/{id}/status` | Update employee status |
| GET | `/api/users` | List users within the current organization |
| GET | `/api/users/{id}` | Retrieve a user within the current organization |

Protected endpoints generally require a valid bearer token.

Example request header:

```http
Authorization: Bearer <JWT>
```

Exact request fields, response DTOs, validation rules, and response status codes should be taken from the current controller and DTO implementations.

## Security and Multi-Tenancy

Security and tenant isolation are core design requirements of WorkSphere.

### Authentication

Users authenticate through the login endpoint. Successful authentication produces a signed JWT that can be presented on subsequent requests.

### Password Security

Passwords are verified using a password encoder. Plain-text passwords must never be stored in the database or committed to source control.

### JWT Validation

The backend validates the token's signature and expiration before using it for authentication.

### Role-Based Authorization

Protected operations require the appropriate backend authority. For example, employee-management endpoints require the `ORG_ADMIN` role in the inspected implementation.

### Tenant Isolation

The current organization must be derived from the authenticated security context.

The backend must not trust a client-supplied `tenantId` as proof of authorization.

Tenant-scoped operations must ensure that users cannot access another organization's resources by changing a URL, resource ID, request body, or query parameter.

### Account Status

The authentication flow checks relevant account and organization status. Disabled accounts and accounts associated with inactive organizations must not be allowed to authenticate normally.

### Input Validation

Request DTOs and validation rules help reject invalid input before it reaches business logic or persistence operations.

### Error Handling

Centralized exception handling helps provide consistent API errors and reduces duplicated exception-handling logic.

### Configuration and Secrets

Database credentials, JWT signing secrets, and other sensitive configuration values must be provided through environment-specific configuration or a secure secret-management mechanism.

Never commit real passwords, tokens, database credentials, or signing secrets.

## Project Structure

The repository uses separate backend and frontend directories.

```text
worksphere/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/worksphere/
│   │   │   │       ├── auth/
│   │   │   │       ├── bootstrap/
│   │   │   │       ├── employee/
│   │   │   │       ├── exception/
│   │   │   │       ├── organization/
│   │   │   │       ├── security/
│   │   │   │       └── user/
│   │   │   └── resources/
│   │   └── test/
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
└── README.md
```

The structure above summarizes the inspected backend packages and expected Angular project files. Additional packages and files may exist in the current repository.

## Prerequisites

Install the following software before running the application:

- Git
- JDK version compatible with the backend's `pom.xml`
- MySQL Server
- Node.js version compatible with the frontend's Angular dependencies
- npm
- A code editor or IDE such as IntelliJ IDEA or Visual Studio Code

Verify installations:

```bash
java -version
git --version
node --version
npm --version
```

Check the backend's `pom.xml` for the configured Java version and the frontend's `package.json` for its Angular version.

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd worksphere
```

Replace the placeholder with the actual central GitHub repository URL.

### 2. Configure MySQL

Start MySQL and create a development database if it does not already exist.

```sql
CREATE DATABASE worksphere;
```

Use a dedicated development database account where practical. Do not expose production credentials.

### 3. Configure Backend Environment Variables

The backend must receive the database URL, username, password, and JWT signing secret through the configuration mechanism expected by the current application.

Example for Windows PowerShell:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/worksphere"
$env:DB_USERNAME = "your_database_username"
$env:DB_PASSWORD = "your_database_password"
```

Set the JWT signing secret using the exact environment-variable name expected by the current JWT configuration. Do not guess the property name; check `JwtService` and the application configuration.

Use a sufficiently strong random secret that meets the implementation's validation requirements. Never commit it to Git.

### 4. Run the Backend

Open PowerShell or a terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

On Linux or macOS:

```bash
cd backend
./mvnw spring-boot:run
```

The default Spring Boot development port is commonly `8080`, unless overridden by application configuration.

### 5. Run the Frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
npm start
```

If the project's scripts do not define `start`, use the configured Angular development command:

```powershell
npx ng serve
```

The development frontend is commonly available at:

```text
http://localhost:4200
```

The frontend's API proxy and backend URL must match the current development configuration.

### 6. Initial Administrator Setup

If the project uses the initial administrator bootstrap, inspect its configuration before enabling it.

The bootstrap is disabled by default in the inspected implementation. It requires valid organization and administrator configuration and refuses initialization when organizations or users already exist.

Use this mechanism only for a controlled development or initialization environment. Never publish bootstrap passwords or enable development initialization casually in production.

### 7. Verify the Application

- Confirm MySQL is running.
- Confirm the backend starts without configuration or database errors.
- Confirm the frontend compiles and loads.
- Test login using a valid configured account.
- Verify authenticated API access.
- Verify role-based restrictions.
- Verify cross-tenant access is prevented.
- Check the browser console and backend logs for errors.

The login screen and other frontend routes depend on the actual Angular implementation.

## Environment Configuration

Configuration varies by environment.

Typical configuration categories include:

| Configuration | Purpose |
|---|---|
| Database URL | MySQL connection |
| Database username | Database authentication |
| Database password | Database authentication |
| JWT signing secret | Signing and verifying tokens |
| JWT token lifetime | Token expiration |
| Server port | Backend HTTP port |
| Initial administrator settings | Controlled first-time initialization |
| Frontend API proxy | Local frontend-to-backend communication |
| CORS origins | Permitted browser origins |

Use the exact property names defined in the current application configuration. Do not assume that every setting in this table has a specific environment variable name.

For production, use secure secret management, controlled database migrations, explicit CORS configuration, and deployment-specific settings.

## Testing

The backend uses Maven and automated tests.

Run the complete backend verification lifecycle:

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd clean verify
```

Linux or macOS:

```bash
cd backend
./mvnw clean verify
```

To run tests without cleaning first:

```powershell
.\mvnw.cmd test
```

Important testing areas include:

- Authentication and login behaviour.
- JWT generation and validation.
- Invalid and expired token handling.
- Role-based access control.
- Disabled account handling.
- Inactive organization handling.
- Tenant-scoped user access.
- Tenant-scoped employee access.
- Input validation.
- Organization API security.
- Service and repository behaviour.

Tests should verify both successful requests and unauthorized or cross-tenant requests.

A successful compilation alone does not establish that a feature is complete. Relevant automated tests and working API/UI behaviour must also be checked.

## Team Responsibilities

WorkSphere is developed collaboratively through a shared GitHub repository.

| Team Member | Responsibility |
|---|---|
| Affan | Backend core, authentication, authorization, JWT, Spring Security, and multi-tenancy |
| Subham | Organization and employee management |
| Prasannajit | Employee onboarding and document management |
| Nihar | Tasks, workflows, and notifications |
| Rabin | Angular frontend and dashboard |

These assignments describe module ownership. The completion status of each module must be verified against the integrated repository.

## Git Workflow

The project uses a single central repository. Team members collaborate through feature branches and pull requests rather than forking the repository.

### Main Branch

`main` is the stable integration branch.

Team members should not develop directly on `main`.

### Feature Branches

Examples include:

```text
feature/affan-security
feature/subham-organization
feature/prasannajit-onboarding
feature/nihar-workflow
feature/rabin-angular
```

### Development Workflow

1. Check the current branch and working-tree status.
2. Synchronize with the latest base branch.
3. Create or switch to the appropriate feature branch.
4. Implement a small, focused change.
5. Run relevant tests and inspect the diff.
6. Commit using a descriptive message.
7. Push the feature branch.
8. Open a pull request.
9. Review the changes and resolve conflicts carefully.
10. Merge only after required checks and review are successful.

Example commit messages:

```text
feat: add employee creation API
fix: prevent cross-tenant access
test: add JWT validation tests
docs: improve project setup instructions
```

Avoid destructive Git commands without first inspecting the working tree. Preserve unrelated work and coordinate changes to shared security configuration, DTOs, and exception handling.

## Development Roadmap

### Phase 1 — Core Foundation

- Backend application foundation.
- Database integration.
- Authentication and JWT.
- Spring Security configuration.
- Role-based authorization.
- Multi-tenant access control.
- Organization management.
- Employee and user APIs.
- Automated backend tests.

### Phase 2 — Workforce Features

- Complete employee-management integration.
- Employee onboarding workflows.
- Document management.
- Task assignment and tracking.
- Workflow progression.
- Notifications.
- Dashboard and frontend integration.

### Phase 3 — Integration and Quality

- End-to-end application testing.
- Security and tenant-isolation testing.
- API contract verification.
- Improved validation and error handling.
- Documentation and setup verification.
- Docker-based development setup where appropriate.

### Phase 4 — Production Readiness

- Managed secrets and environment-specific configuration.
- Database migrations.
- Audit logging.
- Monitoring and observability.
- Performance and query optimization.
- Backup and recovery procedures.
- CI/CD automation.
- Deployment and operational documentation.

Roadmap items should be marked complete only after implementation and verification.

## Future Improvements

Potential improvements include:

- More granular roles and permissions.
- Audit trails for sensitive operations.
- Improved employee self-service features.
- Secure document storage and access policies.
- Advanced workflow configuration.
- Notification delivery and retry handling.
- Dashboard analytics.
- Database indexing and query optimization.
- Automated CI/CD checks.
- Containerized deployment.
- Application monitoring and operational alerts.

Additional infrastructure such as Redis, Kafka, or cloud services should be introduced only when there is a concrete product or engineering requirement.

## Contributing

Contributions should follow the project's architecture and Git workflow.

Before submitting a pull request:

1. Confirm the correct feature branch.
2. Review all changed files.
3. Run relevant tests.
4. Check for accidental credentials or tokens.
5. Verify role-based authorization and tenant isolation where applicable.
6. Update documentation when behaviour or setup instructions change.
7. Provide a clear commit message and pull-request description.

Avoid unnecessary abstractions, duplicated logic, large controller classes, and uncoordinated changes to shared files.

## Project Principles

WorkSphere prioritizes:

- Correctness.
- Secure authentication and authorization.
- Strong tenant isolation.
- Clean architecture.
- Maintainable code.
- Automated testing.
- Clear API contracts.
- Team collaboration.
- Reliable integration.
- Practical production readiness.

## License

A license has not been specified in this README. Add an appropriate license after the repository owners decide how the project may be used, modified, and distributed.

---

**WorkSphere — One Platform for Workforce and Workflow Management**
