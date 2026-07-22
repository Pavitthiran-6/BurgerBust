package com.burgerburst.repository;

import com.burgerburst.entity.OtpVerification;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findFirstByEmailIgnoreCaseAndDeletedAtIsNullOrderByCreatedAtDesc(String email);
}
