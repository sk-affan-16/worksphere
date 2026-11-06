
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

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Iterator;
import java.util.Locale;

@Service
public class OrganizationSignupService {

    private static final long MAX_PHOTO_SIZE = 2 * 1024 * 1024;
    private static final int MAX_IMAGE_DIMENSION = 4096;
    private static final long MAX_IMAGE_PIXELS = 16_000_000L;

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public OrganizationSignupService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Existing JSON signup API - preserved
    @Transactional
    public OrganizationSignupResponse signup(
            OrganizationSignupRequest request
    ) {
        String organizationName = request.organizationName().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (organizationName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Organization name is required"
            );
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        Organization organization =
                organizationRepository.save(
                        new Organization(organizationName)
                );

        User admin = new User(
                organization,
                email,
                passwordEncoder.encode(request.password()),
                User.Role.ORG_ADMIN
        );

        admin.setStatus(User.Status.ACTIVE);
        User savedAdmin = userRepository.save(admin);

        return new OrganizationSignupResponse(
                organization.getId(),
                organization.getName(),
                savedAdmin.getId(),
                savedAdmin.getEmail(),
                "Organization registered successfully"
        );
    }

    // New multipart registration API
    @Transactional
    public OrganizationSignupResponse register(
            OrganizationRegisterRequest request
    ) {
        String organizationName = request.getOrganizationName().trim();
        String firstName = request.getFirstName().trim();
        String lastName = request.getLastName().trim();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        byte[] photoBytes = null;
        String photoContentType = null;

        MultipartFile photo = request.getProfilePhoto();

        if (photo != null && !photo.isEmpty()) {

            if (photo.getSize() > MAX_PHOTO_SIZE) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Profile photo must not exceed 2 MB"
                );
            }

            try {
                photoBytes = photo.getBytes();
            } catch (IOException exception) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unable to read profile photo"
                );
            }

            photoContentType = validateAndDetectImage(photoBytes);
        }

        Organization organization =
                organizationRepository.save(
                        new Organization(organizationName)
                );

        User admin = new User(
                organization,
                email,
                passwordEncoder.encode(request.getPassword()),
                User.Role.ORG_ADMIN
        );

        admin.setStatus(User.Status.ACTIVE);

        User savedAdmin = userRepository.save(admin);

        Employee employee = new Employee(
                savedAdmin,
                firstName,
                lastName,
                request.getPhone(),
                request.getJobTitle(),
                request.getDepartment(),
                LocalDate.now()
        );

        if (photoBytes != null) {
            employee.setProfilePhoto(
                    photoBytes,
                    photoContentType
            );
        }

        employeeRepository.save(employee);

        return new OrganizationSignupResponse(
                organization.getId(),
                organization.getName(),
                savedAdmin.getId(),
                savedAdmin.getEmail(),
                "Organization registered successfully"
        );
    }

    // Validate image format, actual decoding and dimensions
    private String validateAndDetectImage(byte[] bytes) {

        String contentType;

        if (isPng(bytes)) {
            contentType = "image/png";
        } else if (isJpeg(bytes)) {
            contentType = "image/jpeg";
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG and PNG profile photos are allowed"
            );
        }

        try (ImageInputStream imageInput =
                     ImageIO.createImageInputStream(
                             new ByteArrayInputStream(bytes)
                     )) {

            if (imageInput == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid image file"
                );
            }

            Iterator<ImageReader> readers =
                    ImageIO.getImageReaders(imageInput);

            if (!readers.hasNext()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or corrupted image"
                );
            }

            ImageReader reader = readers.next();

            try {
                reader.setInput(imageInput, true, true);

                String format = reader.getFormatName()
                        .toLowerCase(Locale.ROOT);

                boolean correctFormat =
                        contentType.equals("image/png")
                                ? format.equals("png")
                                : format.equals("jpeg")
                                || format.equals("jpg");

                if (!correctFormat) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Image format does not match file content"
                    );
                }

                int width = reader.getWidth(0);
                int height = reader.getHeight(0);

                if (width <= 0
                        || height <= 0
                        || width > MAX_IMAGE_DIMENSION
                        || height > MAX_IMAGE_DIMENSION
                        || (long) width * height > MAX_IMAGE_PIXELS) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Image dimensions are too large"
                    );
                }

                BufferedImage decodedImage = reader.read(0);

                if (decodedImage == null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Unable to decode image"
                    );
                }

            } finally {
                reader.dispose();
            }

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid or corrupted image"
            );
        }

        return contentType;
    }

    // Check PNG signature
    private boolean isPng(byte[] bytes) {

        byte[] signature = {
                (byte) 0x89,
                0x50,
                0x4E,
                0x47,
                0x0D,
                0x0A,
                0x1A,
                0x0A
        };

        if (bytes.length < signature.length) {
            return false;
        }

        for (int i = 0; i < signature.length; i++) {
            if (bytes[i] != signature[i]) {
                return false;
            }
        }

        return true;
    }

    // Check JPEG signature
    private boolean isJpeg(byte[] bytes) {

        return bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF;
    }

    // Retrieve authenticated user's own profile photo
    @Transactional(readOnly = true)
    public ProfilePhoto getProfilePhoto(Long userId) {

        Employee employee = employeeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile photo not found"
                ));

        if (employee.getProfilePhoto() == null
                || employee.getProfilePhotoContentType() == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Profile photo not found"
            );
        }

        return new ProfilePhoto(
                employee.getProfilePhoto(),
                employee.getProfilePhotoContentType()
        );
    }

    public record ProfilePhoto(
            byte[] bytes,
            String contentType
    ) {
    }
}
