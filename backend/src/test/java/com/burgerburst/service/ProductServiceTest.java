package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.product.ProductRequest;
import com.burgerburst.dto.product.ProductResponse;
import com.burgerburst.entity.Category;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.InventoryHistory;
import com.burgerburst.entity.Product;
import com.burgerburst.repository.CategoryRepository;
import com.burgerburst.repository.InventoryHistoryRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.response.PageResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryHistoryRepository historyRepository;

    private ProductService service;
    private Category category;

    @BeforeEach
    void setUp() {
        service = new ProductService(productRepository, categoryRepository, inventoryRepository, historyRepository);
        category = new Category();
        category.setUuid(UUID.randomUUID());
        category.setName("Burger");
        category.setActive(true);
    }

    @Test
    void returnsPaginatedPublicProducts() {
        Product product = product();
        when(productRepository.findAll(
                org.mockito.ArgumentMatchers.<Specification<Product>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product)));

        PageResponse<ProductResponse> response = service.getProducts(
                null, null, null, null, null, null, null, null,
                0, 20, "createdAt", Sort.Direction.DESC);

        assertThat(response.content()).hasSize(1);
        assertThat(response.content().getFirst().name()).isEqualTo("Classic Burger");
        assertThat(response.content().getFirst().effectivePrice()).isEqualByComparingTo("7.99");
    }

    @Test
    void createsProductWithInitialInventoryAndHistory() {
        UUID adminUuid = UUID.randomUUID();
        when(categoryRepository.findByUuidAndDeletedAtIsNull(category.getUuid())).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = service.create(request(), adminUuid);

        assertThat(response.uuid()).isNotNull();
        assertThat(response.available()).isFalse();
        ArgumentCaptor<Inventory> inventoryCaptor = ArgumentCaptor.forClass(Inventory.class);
        verify(inventoryRepository).save(inventoryCaptor.capture());
        assertThat(inventoryCaptor.getValue().getStockQuantity()).isZero();
        ArgumentCaptor<InventoryHistory> historyCaptor = ArgumentCaptor.forClass(InventoryHistory.class);
        verify(historyRepository).save(historyCaptor.capture());
        assertThat(historyCaptor.getValue().getChangedBy()).isEqualTo(adminUuid);
    }

    @Test
    void softDeleteHidesAndDisablesProduct() {
        UUID uuid = UUID.randomUUID();
        Product product = product();
        when(productRepository.findByUuidAndDeletedAtIsNull(uuid)).thenReturn(Optional.of(product));

        service.softDelete(uuid);

        assertThat(product.isDeleted()).isTrue();
        assertThat(product.isVisible()).isFalse();
        assertThat(product.isAvailable()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    void restoresProductOnlyWhenInventoryHasStock() {
        UUID uuid = UUID.randomUUID();
        Product product = product();
        product.setDeletedAt(Instant.now());
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setStockQuantity(12);
        inventory.setVisible(true);
        when(productRepository.findByUuid(uuid)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductUuidAndDeletedAtIsNull(uuid)).thenReturn(Optional.of(inventory));
        when(productRepository.save(product)).thenReturn(product);

        ProductResponse response = service.restore(uuid);

        assertThat(product.isDeleted()).isFalse();
        assertThat(response.available()).isTrue();
        assertThat(response.visible()).isTrue();
    }

    private Product product() {
        Product product = new Product();
        product.setUuid(UUID.randomUUID());
        product.setName("Classic Burger");
        product.setDescription("Signature burger");
        product.setPrice(BigDecimal.valueOf(8.99));
        product.setOfferPrice(BigDecimal.valueOf(7.99));
        product.setCategory(category);
        product.setAvailable(true);
        product.setVisible(true);
        product.setRating(BigDecimal.valueOf(4.8));
        product.setPreparationTime(10);
        return product;
    }

    private ProductRequest request() {
        return new ProductRequest(
                "Classic Burger", "Signature burger", BigDecimal.valueOf(8.99),
                BigDecimal.valueOf(7.99), "/burger.png", category.getUuid(), true, true,
                true, true, true, true, BigDecimal.valueOf(4.8), 100, 10, 650, false);
    }
}
