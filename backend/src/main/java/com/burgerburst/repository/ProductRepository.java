package com.burgerburst.repository;

import com.burgerburst.entity.Product;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByUuidAndDeletedAtIsNull(UUID uuid);

    Optional<Product> findByUuid(UUID uuid);

    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);

    List<Product> findAllByUuidInAndDeletedAtIsNull(List<UUID> uuids);
}
