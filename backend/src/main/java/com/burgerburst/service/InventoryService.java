package com.burgerburst.service;

import com.burgerburst.dto.inventory.InventoryResponse;
import com.burgerburst.dto.inventory.InventoryUpdateRequest;
import com.burgerburst.dto.inventory.StockUpdateRequest;
import com.burgerburst.dto.admin.StockAdjustmentRequest;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.InventoryChangeType;
import com.burgerburst.entity.InventoryHistory;
import com.burgerburst.entity.Product;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.repository.InventoryHistoryRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.ProductRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventory() {
        return inventoryRepository.findAllByDeletedAtIsNullOrderByProductNameAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public InventoryResponse update(UUID productUuid, InventoryUpdateRequest request, UUID adminUuid) {
        Inventory inventory = find(productUuid);
        int previous = inventory.getStockQuantity();
        inventory.setStockQuantity(request.stockQuantity());
        inventory.setLowStockThreshold(request.lowStockThreshold());
        inventory.setVisible(request.visible());
        synchronizeProduct(inventory);
        Inventory saved = inventoryRepository.save(inventory);
        saveHistory(saved, previous, request.stockQuantity(), InventoryChangeType.UPDATED, request.reason(), adminUuid);
        publishStockAlert(saved);
        return toResponse(saved);
    }

    @Transactional
    public InventoryResponse setStock(UUID productUuid, StockUpdateRequest request, UUID adminUuid) {
        Inventory inventory = find(productUuid);
        int previous = inventory.getStockQuantity();
        inventory.setStockQuantity(request.quantity());
        synchronizeProduct(inventory);
        Inventory saved = inventoryRepository.save(inventory);
        saveHistory(saved, previous, request.quantity(), InventoryChangeType.STOCK_SET, request.reason(), adminUuid);
        publishStockAlert(saved);
        return toResponse(saved);
    }

    @Transactional
    public InventoryResponse adjust(UUID productUuid, StockAdjustmentRequest request, UUID adminUuid) {
        Inventory inventory = inventoryRepository.findForUpdateByProductUuidAndDeletedAtIsNull(productUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        int previous = inventory.getStockQuantity();
        final int next;
        try {
            next = Math.addExact(previous, request.adjustment());
        } catch (ArithmeticException exception) {
            throw new BusinessRuleException("Inventory adjustment is outside the supported range", HttpStatus.UNPROCESSABLE_ENTITY);
        }
        if (next < 0) {
            throw new BusinessRuleException("Inventory adjustment cannot make stock negative", HttpStatus.UNPROCESSABLE_ENTITY);
        }
        inventory.setStockQuantity(next);
        synchronizeProduct(inventory);
        Inventory saved = inventoryRepository.save(inventory);
        saveHistory(saved, previous, next, InventoryChangeType.ADJUSTMENT, request.reason(), adminUuid);
        publishStockAlert(saved);
        return toResponse(saved);
    }

    private Inventory find(UUID productUuid) {
        return inventoryRepository.findByProductUuidAndDeletedAtIsNull(productUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
    }

    private void synchronizeProduct(Inventory inventory) {
        Product product = inventory.getProduct();
        product.setAvailable(inventory.isVisible() && !inventory.isOutOfStock());
        productRepository.save(product);
    }

    private void saveHistory(
            Inventory inventory,
            int previous,
            int current,
            InventoryChangeType type,
            String reason,
            UUID adminUuid) {
        InventoryHistory history = new InventoryHistory();
        history.setInventory(inventory);
        history.setPreviousQuantity(previous);
        history.setNewQuantity(current);
        history.setChangeType(type);
        history.setReason(reason == null || reason.isBlank() ? null : reason.strip());
        history.setChangedBy(adminUuid);
        inventoryHistoryRepository.save(history);
    }

    private void publishStockAlert(Inventory inventory) {
        if (inventory.isOutOfStock()) {
            log.warn("Product out of stock productUuid={}", inventory.getProduct().getUuid());
        } else if (inventory.isLowStock()) {
            log.warn("Product low stock productUuid={} quantity={}",
                    inventory.getProduct().getUuid(), inventory.getStockQuantity());
        }
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getProduct().getUuid(), inventory.getProduct().getName(),
                inventory.getProduct().getCategory().getName(), inventory.getStockQuantity(),
                inventory.getLowStockThreshold(), inventory.isLowStock(), inventory.isOutOfStock(),
                inventory.isVisible(), inventory.getUpdatedAt());
    }
}
