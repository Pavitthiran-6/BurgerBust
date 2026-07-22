package com.burgerburst.repository;

import com.burgerburst.entity.PaymentAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentAuditRepository extends JpaRepository<PaymentAuditEvent, Long> {
}

