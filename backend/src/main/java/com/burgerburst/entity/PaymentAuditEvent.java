package com.burgerburst.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "payment_audit_events")
public class PaymentAuditEvent extends BaseEntity {

    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 40)
    private PaymentAuditType eventType;

    @Column(name = "external_event_id", length = 120)
    private String externalEventId;

    @Column(length = 500)
    private String detail;

    @Column(name = "payload_hash", length = 64)
    private String payloadHash;

    @PrePersist
    void assignUuid() {
        if (uuid == null) uuid = UUID.randomUUID();
    }
}

