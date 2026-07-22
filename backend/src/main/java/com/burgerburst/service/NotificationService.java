package com.burgerburst.service;

import com.burgerburst.dto.notification.NotificationResponse;
import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.Notification;
import com.burgerburst.entity.User;
import com.burgerburst.event.CommerceNotificationEvent;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.NotificationRepository;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.UserRepository;
import com.burgerburst.response.PageResponse;
import java.time.Clock;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final Clock clock;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onCommerceEvent(CommerceNotificationEvent event) {
        User user = userRepository.findByUuidAndDeletedAtIsNull(event.userUuid())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CustomerOrder order = event.orderUuid() == null ? null
                : orderRepository.findByUuidAndDeletedAtIsNull(event.orderUuid()).orElse(null);
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setOrder(order);
        notification.setNotificationType(event.type());
        notification.setTitle(event.title());
        notification.setMessage(event.message());
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(UUID userUuid, int page, int size) {
        return PageResponse.from(notificationRepository
                .findByUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(
                        userUuid, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)))
                .map(this::toResponse));
    }

    @Transactional
    public NotificationResponse markRead(UUID userUuid, UUID notificationUuid) {
        Notification notification = notificationRepository
                .findByUuidAndUserUuidAndDeletedAtIsNull(notificationUuid, userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (notification.getReadAt() == null) notification.setReadAt(clock.instant());
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID userUuid) {
        return notificationRepository.countByUserUuidAndReadAtIsNullAndDeletedAtIsNull(userUuid);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getUuid(), notification.getNotificationType(), notification.getTitle(),
                notification.getMessage(), notification.getOrder() == null ? null : notification.getOrder().getUuid(),
                notification.getReadAt() != null, notification.getReadAt(), notification.getCreatedAt());
    }
}

