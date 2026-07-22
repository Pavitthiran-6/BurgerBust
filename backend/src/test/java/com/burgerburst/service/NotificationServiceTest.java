package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.entity.Notification;
import com.burgerburst.entity.NotificationType;
import com.burgerburst.entity.User;
import com.burgerburst.event.CommerceNotificationEvent;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.NotificationRepository;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.UserRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private OrderRepository orderRepository;

    private NotificationService service;
    private Instant now;

    @BeforeEach
    void setUp() {
        now = Instant.parse("2026-07-21T12:00:00Z");
        service = new NotificationService(notificationRepository, userRepository, orderRepository,
                Clock.fixed(now, ZoneOffset.UTC));
    }

    @Test
    void persistsCommerceEventForUser() {
        User user = new User();
        user.setUuid(UUID.randomUUID());
        when(userRepository.findByUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(user));

        service.onCommerceEvent(new CommerceNotificationEvent(
                user.getUuid(), NotificationType.ORDER_CREATED, "Placed", "Order placed", null));

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void marksOwnedNotificationRead() {
        UUID userUuid = UUID.randomUUID();
        UUID notificationUuid = UUID.randomUUID();
        Notification notification = new Notification();
        notification.setUuid(notificationUuid);
        notification.setNotificationType(NotificationType.COUPON);
        notification.setTitle("Coupon");
        notification.setMessage("Applied");
        when(notificationRepository.findByUuidAndUserUuidAndDeletedAtIsNull(notificationUuid, userUuid))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);

        var response = service.markRead(userUuid, notificationUuid);

        assertThat(response.read()).isTrue();
        assertThat(response.readAt()).isEqualTo(now);
    }

    @Test
    void rejectsNotificationOwnedByAnotherUser() {
        assertThatThrownBy(() -> service.markRead(UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

