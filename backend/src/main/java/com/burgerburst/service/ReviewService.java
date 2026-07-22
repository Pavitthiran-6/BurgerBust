package com.burgerburst.service;

import com.burgerburst.dto.review.ReviewRequest;
import com.burgerburst.dto.review.ReviewResponse;
import com.burgerburst.dto.review.UpdateReviewRequest;
import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.Product;
import com.burgerburst.entity.Review;
import com.burgerburst.entity.ReviewType;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.repository.ReviewRepository;
import com.burgerburst.response.PageResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public ReviewResponse create(UUID userUuid, ReviewRequest request) {
        CustomerOrder order = orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(request.orderId(), userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Only delivered orders can be reviewed", HttpStatus.UNPROCESSABLE_ENTITY);
        }
        Product product = validateTarget(userUuid, order, request);
        Review review = new Review();
        review.setUser(order.getUser());
        review.setOrder(order);
        review.setProduct(product);
        review.setReviewType(request.type());
        review.setRating(request.rating());
        review.setComment(trimToNull(request.comment()));
        Review saved = reviewRepository.save(review);
        if (product != null) updateProductRating(product);
        return toResponse(saved);
    }

    @Transactional
    public ReviewResponse update(UUID userUuid, UUID reviewUuid, UpdateReviewRequest request) {
        Review review = findOwned(userUuid, reviewUuid);
        review.setRating(request.rating());
        review.setComment(trimToNull(request.comment()));
        Review saved = reviewRepository.save(review);
        if (saved.getProduct() != null) updateProductRating(saved.getProduct());
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID userUuid, UUID reviewUuid) {
        Review review = findOwned(userUuid, reviewUuid);
        Product product = review.getProduct();
        review.markDeleted();
        reviewRepository.save(review);
        if (product != null) updateProductRating(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(UUID productUuid, int page, int size) {
        productRepository.findByUuidAndDeletedAtIsNull(productUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return PageResponse.from(reviewRepository
                .findByProductUuidAndReviewTypeAndDeletedAtIsNullOrderByCreatedAtDesc(
                        productUuid, ReviewType.PRODUCT,
                        PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)))
                .map(this::toResponse));
    }

    private Product validateTarget(UUID userUuid, CustomerOrder order, ReviewRequest request) {
        if (request.type() == ReviewType.PRODUCT) {
            if (request.productId() == null) {
                throw new BusinessRuleException("Product ID is required for a product review", HttpStatus.BAD_REQUEST);
            }
            boolean belongsToOrder = order.getItems().stream()
                    .anyMatch(item -> item.getProductUuid().equals(request.productId()));
            if (!belongsToOrder) {
                throw new BusinessRuleException("Product was not part of this order", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            if (reviewRepository.existsByUserUuidAndOrderUuidAndProductUuidAndReviewTypeAndDeletedAtIsNull(
                    userUuid, order.getUuid(), request.productId(), ReviewType.PRODUCT)) {
                throw new BusinessRuleException("Product has already been reviewed for this order", HttpStatus.CONFLICT);
            }
            return productRepository.findByUuidAndDeletedAtIsNull(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        }
        if (request.productId() != null) {
            throw new BusinessRuleException("Product ID is only valid for product reviews", HttpStatus.BAD_REQUEST);
        }
        if (reviewRepository.existsByUserUuidAndOrderUuidAndReviewTypeAndProductIsNullAndDeletedAtIsNull(
                userUuid, order.getUuid(), request.type())) {
            throw new BusinessRuleException("This order has already been reviewed", HttpStatus.CONFLICT);
        }
        return null;
    }

    private Review findOwned(UUID userUuid, UUID reviewUuid) {
        return reviewRepository.findByUuidAndUserUuidAndDeletedAtIsNull(reviewUuid, userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    private void updateProductRating(Product product) {
        Object[] aggregate = reviewRepository.calculateProductRating(product.getUuid(), ReviewType.PRODUCT)
                .stream()
                .findFirst()
                .orElse(new Object[]{0.0, 0L});
        Number average = (Number) aggregate[0];
        Number count = (Number) aggregate[1];
        product.setRating(BigDecimal.valueOf(average.doubleValue()).setScale(2, RoundingMode.HALF_UP));
        product.setReviewCount(count.intValue());
        productRepository.save(product);
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getUuid(), review.getReviewType(), review.getOrder().getUuid(),
                review.getProduct() == null ? null : review.getProduct().getUuid(),
                review.getProduct() == null ? null : review.getProduct().getName(),
                review.getUser().getFullName(), review.getRating(), review.getComment(),
                review.getCreatedAt(), review.getUpdatedAt());
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
