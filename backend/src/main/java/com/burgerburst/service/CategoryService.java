package com.burgerburst.service;

import com.burgerburst.dto.category.CategoryRequest;
import com.burgerburst.dto.category.CategoryResponse;
import com.burgerburst.entity.Category;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.CategoryRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getPublicCategories() {
        return categoryRepository.findAllByActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAscNameAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAdminCategories() {
        return categoryRepository.findAllByDeletedAtIsNullOrderByDisplayOrderAscNameAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getPublicCategory(UUID uuid) {
        Category category = findActive(uuid);
        if (!category.isActive()) {
            throw new ResourceNotFoundException("Category not found");
        }
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        validateUniqueName(request.name(), null);
        Category category = new Category();
        category.setUuid(UUID.randomUUID());
        apply(category, request);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(UUID uuid, CategoryRequest request) {
        Category category = findActive(uuid);
        validateUniqueName(request.name(), category.getName());
        apply(category, request);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void softDelete(UUID uuid) {
        Category category = findActive(uuid);
        category.setActive(false);
        category.markDeleted();
        categoryRepository.save(category);
    }

    @Transactional
    public CategoryResponse updateStatus(UUID uuid, boolean active) {
        Category category = findActive(uuid);
        category.setActive(active);
        return toResponse(categoryRepository.save(category));
    }

    private Category findActive(UUID uuid) {
        return categoryRepository.findByUuidAndDeletedAtIsNull(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void validateUniqueName(String name, String existingName) {
        if ((existingName == null || !existingName.equalsIgnoreCase(name.strip()))
                && categoryRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(name.strip())) {
            throw new IllegalArgumentException("Category name already exists");
        }
    }

    private void apply(Category category, CategoryRequest request) {
        category.setName(request.name().strip());
        category.setDescription(trimToNull(request.description()));
        category.setImageUrl(trimToNull(request.imageUrl()));
        category.setDisplayOrder(request.displayOrder());
        category.setActive(request.active());
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getUuid(), category.getName(), category.getDescription(), category.getImageUrl(),
                category.getDisplayOrder(), category.isActive(), category.getCreatedAt(), category.getUpdatedAt());
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
