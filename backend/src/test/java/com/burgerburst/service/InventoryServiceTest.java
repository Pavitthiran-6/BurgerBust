package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.inventory.InventoryResponse;
import com.burgerburst.dto.inventory.InventoryUpdateRequest;
import com.burgerburst.dto.inventory.StockUpdateRequest;
import com.burgerburst.dto.admin.StockAdjustmentRequest;
import com.burgerburst.entity.Category;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.InventoryHistory;
import com.burgerburst.entity.Product;
import com.burgerburst.repository.InventoryHistoryRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.ProductRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryHistoryRepository historyRepository;
    @Mock private ProductRepository productRepository;

    private InventoryService service;
    private Inventory inventory;
    private UUID productUuid;

    @BeforeEach
    void setUp() {
        service = new InventoryService(inventoryRepository, historyRepository, productRepository);
        productUuid = UUID.randomUUID();
        Category category = new Category();
        category.setName("Burger");
        Product product = new Product();
        product.setUuid(productUuid);
        product.setName("Classic Burger");
        product.setCategory(category);
        product.setAvailable(true);
        inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setStockQuantity(20);
        inventory.setLowStockThreshold(5);
        inventory.setVisible(true);
    }

    @Test
    void reportsLowAndOutOfStockState() {
        inventory.setStockQuantity(3);
        when(inventoryRepository.findAllByDeletedAtIsNullOrderByProductNameAsc()).thenReturn(List.of(inventory));

        InventoryResponse response = service.getInventory().getFirst();

        assertThat(response.lowStock()).isTrue();
        assertThat(response.outOfStock()).isFalse();
    }

    @Test
    void stockUpdateAutomaticallyHidesOutOfStockProductAndRecordsHistory() {
        UUID adminUuid = UUID.randomUUID();
        when(inventoryRepository.findByProductUuidAndDeletedAtIsNull(productUuid)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(inventory)).thenReturn(inventory);

        InventoryResponse response = service.setStock(
                productUuid, new StockUpdateRequest(0, "Sold out"), adminUuid);

        assertThat(response.outOfStock()).isTrue();
        assertThat(inventory.getProduct().isAvailable()).isFalse();
        verify(productRepository).save(inventory.getProduct());
        ArgumentCaptor<InventoryHistory> history = ArgumentCaptor.forClass(InventoryHistory.class);
        verify(historyRepository).save(history.capture());
        assertThat(history.getValue().getPreviousQuantity()).isEqualTo(20);
        assertThat(history.getValue().getNewQuantity()).isZero();
        assertThat(history.getValue().getChangedBy()).isEqualTo(adminUuid);
    }

    @Test
    void fullInventoryUpdateRestoresProductWhenStockIsVisible() {
        UUID adminUuid = UUID.randomUUID();
        inventory.setStockQuantity(0);
        inventory.getProduct().setAvailable(false);
        when(inventoryRepository.findByProductUuidAndDeletedAtIsNull(productUuid)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(inventory)).thenReturn(inventory);

        InventoryResponse response = service.update(
                productUuid, new InventoryUpdateRequest(15, 4, true, "Restocked"), adminUuid);

        assertThat(response.stockQuantity()).isEqualTo(15);
        assertThat(response.lowStockThreshold()).isEqualTo(4);
        assertThat(inventory.getProduct().isAvailable()).isTrue();
        verify(historyRepository).save(any(InventoryHistory.class));
    }

    @Test
    void atomicAdjustmentAddsStockAndRecordsAuditHistory() {
        UUID adminUuid = UUID.randomUUID();
        when(inventoryRepository.findForUpdateByProductUuidAndDeletedAtIsNull(productUuid))
                .thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(inventory)).thenReturn(inventory);

        InventoryResponse response = service.adjust(
                productUuid, new StockAdjustmentRequest(7, "Supplier delivery"), adminUuid);

        assertThat(response.stockQuantity()).isEqualTo(27);
        ArgumentCaptor<InventoryHistory> history = ArgumentCaptor.forClass(InventoryHistory.class);
        verify(historyRepository).save(history.capture());
        assertThat(history.getValue().getPreviousQuantity()).isEqualTo(20);
        assertThat(history.getValue().getNewQuantity()).isEqualTo(27);
        assertThat(history.getValue().getReason()).isEqualTo("Supplier delivery");
    }

    @Test
    void atomicAdjustmentRejectsNegativeResult() {
        when(inventoryRepository.findForUpdateByProductUuidAndDeletedAtIsNull(productUuid))
                .thenReturn(Optional.of(inventory));

        assertThatThrownBy(() -> service.adjust(
                productUuid, new StockAdjustmentRequest(-21, "Correction"), UUID.randomUUID()))
                .hasMessageContaining("cannot make stock negative");
    }
}
