package com.burgerburst.repository;

import com.burgerburst.entity.CartItem;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @EntityGraph(attributePaths = {"cart", "cart.user", "product", "product.category"})
    Optional<CartItem> findByUuidAndCartUserUuidAndDeletedAtIsNull(UUID itemUuid, UUID userUuid);
}

