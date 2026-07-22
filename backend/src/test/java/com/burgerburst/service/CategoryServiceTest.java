package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.category.CategoryRequest;
import com.burgerburst.dto.category.CategoryResponse;
import com.burgerburst.entity.Category;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.CategoryRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository repository;

    private CategoryService service;

    @BeforeEach
    void setUp() {
        service = new CategoryService(repository);
    }

    @Test
    void createsCategoryWithUuidAndDisplayMetadata() {
        when(repository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CategoryRequest request = new CategoryRequest("Desserts", "Sweet treats", "/dessert.png", 8, true);

        CategoryResponse response = service.create(request);

        assertThat(response.uuid()).isNotNull();
        assertThat(response.name()).isEqualTo("Desserts");
        assertThat(response.displayOrder()).isEqualTo(8);
        assertThat(response.active()).isTrue();
    }

    @Test
    void returnsOnlyRepositoryProvidedActiveSortedCategories() {
        Category first = category("Burger", 1, true);
        Category second = category("Pizza", 2, true);
        when(repository.findAllByActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAscNameAsc())
                .thenReturn(List.of(first, second));

        assertThat(service.getPublicCategories()).extracting(CategoryResponse::name)
                .containsExactly("Burger", "Pizza");
    }

    @Test
    void softDeletesAndDisablesCategory() {
        UUID uuid = UUID.randomUUID();
        Category category = category("Burger", 1, true);
        when(repository.findByUuidAndDeletedAtIsNull(uuid)).thenReturn(Optional.of(category));

        service.softDelete(uuid);

        assertThat(category.isActive()).isFalse();
        assertThat(category.isDeleted()).isTrue();
        verify(repository).save(category);
    }

    @Test
    void hidesInactiveCategoryDetails() {
        UUID uuid = UUID.randomUUID();
        Category category = category("Hidden", 1, false);
        when(repository.findByUuidAndDeletedAtIsNull(uuid)).thenReturn(Optional.of(category));

        assertThatThrownBy(() -> service.getPublicCategory(uuid))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private Category category(String name, int order, boolean active) {
        Category category = new Category();
        category.setUuid(UUID.randomUUID());
        category.setName(name);
        category.setDisplayOrder(order);
        category.setActive(active);
        return category;
    }
}
