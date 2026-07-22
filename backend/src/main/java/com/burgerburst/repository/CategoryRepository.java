package com.burgerburst.repository;

import com.burgerburst.entity.Category;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByUuidAndDeletedAtIsNull(UUID uuid);

    Optional<Category> findByUuid(UUID uuid);

    List<Category> findAllByActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAscNameAsc();
    List<Category> findAllByDeletedAtIsNullOrderByDisplayOrderAscNameAsc();

    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);
}
