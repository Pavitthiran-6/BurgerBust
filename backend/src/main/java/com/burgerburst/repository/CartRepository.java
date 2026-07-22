package com.burgerburst.repository;

import com.burgerburst.entity.Cart;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {

    @EntityGraph(attributePaths = {"user", "coupon", "items", "items.product", "items.product.category"})
    Optional<Cart> findByUserUuidAndDeletedAtIsNull(UUID userUuid);
}

