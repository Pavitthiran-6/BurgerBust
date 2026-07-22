package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.review.ReviewRequest;
import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.OrderItem;
import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.Product;
import com.burgerburst.entity.Review;
import com.burgerburst.entity.ReviewType;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.repository.ReviewRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;

    private ReviewService service;
    private User user;
    private CustomerOrder order;
    private Product product;

    @BeforeEach
    void setUp() {
        service = new ReviewService(reviewRepository, orderRepository, productRepository);
        user = new User();
        user.setUuid(UUID.randomUUID());
        user.setFullName("Customer");
        order = new CustomerOrder();
        order.setUuid(UUID.randomUUID());
        order.setUser(user);
        order.setStatus(OrderStatus.DELIVERED);
        product = new Product();
        product.setUuid(UUID.randomUUID());
        product.setName("Burger");
        OrderItem item = new OrderItem();
        item.setProductUuid(product.getUuid());
        item.setProduct(product);
        order.addItem(item);
    }

    @Test
    void createsProductReviewForDeliveredPurchasedItem() {
        when(orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(order.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(order));
        when(productRepository.findByUuidAndDeletedAtIsNull(product.getUuid())).thenReturn(Optional.of(product));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reviewRepository.calculateProductRating(product.getUuid(), ReviewType.PRODUCT))
                .thenReturn(List.<Object[]>of(new Object[]{5.0, 1L}));

        var response = service.create(user.getUuid(),
                new ReviewRequest(ReviewType.PRODUCT, order.getUuid(), product.getUuid(), 5, "Great"));

        assertThat(response.rating()).isEqualTo(5);
        assertThat(product.getRating()).isEqualByComparingTo("5.00");
        assertThat(product.getReviewCount()).isEqualTo(1);
    }

    @Test
    void rejectsReviewBeforeDelivery() {
        order.setStatus(OrderStatus.PREPARING);
        when(orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(order.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(user.getUuid(),
                new ReviewRequest(ReviewType.ORDER, order.getUuid(), null, 4, null)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("delivered");
    }

    @Test
    void rejectsProductNotPresentInOrder() {
        when(orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(order.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.create(user.getUuid(),
                new ReviewRequest(ReviewType.PRODUCT, order.getUuid(), UUID.randomUUID(), 4, null)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("not part");
    }

    @Test
    void softDeletesOwnedReviewAndRecalculatesRating() {
        Review review = new Review();
        review.setUuid(UUID.randomUUID());
        review.setProduct(product);
        review.setUser(user);
        review.setOrder(order);
        when(reviewRepository.findByUuidAndUserUuidAndDeletedAtIsNull(review.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(review));
        when(reviewRepository.calculateProductRating(product.getUuid(), ReviewType.PRODUCT))
                .thenReturn(List.<Object[]>of(new Object[]{0.0, 0L}));

        service.delete(user.getUuid(), review.getUuid());

        assertThat(review.isDeleted()).isTrue();
        verify(reviewRepository).save(review);
    }
}
