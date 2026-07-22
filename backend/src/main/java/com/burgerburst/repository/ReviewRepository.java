package com.burgerburst.repository;

import com.burgerburst.entity.Review;
import com.burgerburst.entity.ReviewType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    @EntityGraph(attributePaths = {"user", "order", "product"})
    Optional<Review> findByUuidAndUserUuidAndDeletedAtIsNull(UUID uuid, UUID userUuid);

    boolean existsByUserUuidAndOrderUuidAndProductUuidAndReviewTypeAndDeletedAtIsNull(
            UUID userUuid, UUID orderUuid, UUID productUuid, ReviewType type);

    boolean existsByUserUuidAndOrderUuidAndReviewTypeAndProductIsNullAndDeletedAtIsNull(
            UUID userUuid, UUID orderUuid, ReviewType type);

    @EntityGraph(attributePaths = {"user", "product"})
    Page<Review> findByProductUuidAndReviewTypeAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID productUuid, ReviewType type, Pageable pageable);

    @Query("select coalesce(avg(r.rating), 0), count(r) from Review r "
            + "where r.product.uuid = :productUuid and r.reviewType = :type and r.deletedAt is null")
    List<Object[]> calculateProductRating(UUID productUuid, ReviewType type);
}
