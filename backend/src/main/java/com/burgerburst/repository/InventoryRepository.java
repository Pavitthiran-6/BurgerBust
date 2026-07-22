package com.burgerburst.repository;

import com.burgerburst.entity.Inventory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @EntityGraph(attributePaths = {"product", "product.category"})
    List<Inventory> findAllByDeletedAtIsNullOrderByProductNameAsc();

    @EntityGraph(attributePaths = {"product", "product.category"})
    Optional<Inventory> findByProductUuidAndDeletedAtIsNull(UUID productUuid);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"product", "product.category"})
    Optional<Inventory> findForUpdateByProductUuidAndDeletedAtIsNull(UUID productUuid);

    @Query("select count(inventory) from Inventory inventory where inventory.deletedAt is null "
            + "and inventory.stockQuantity <= inventory.lowStockThreshold")
    long countLowStock();
}
