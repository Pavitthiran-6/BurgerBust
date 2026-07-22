package com.burgerburst.service;

import com.burgerburst.dto.product.ProductRequest;
import com.burgerburst.dto.product.ProductResponse;
import com.burgerburst.dto.admin.BulkProductDeleteRequest;
import com.burgerburst.dto.admin.BulkProductUpdateRequest;
import com.burgerburst.entity.Category;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.InventoryChangeType;
import com.burgerburst.entity.InventoryHistory;
import com.burgerburst.entity.Product;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.CategoryRepository;
import com.burgerburst.repository.InventoryHistoryRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.response.PageResponse;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Set<String> SORTABLE_FIELDS = Set.of("name", "price", "rating", "createdAt", "updatedAt");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(
            String search,
            UUID categoryUuid,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean veg,
            Boolean featured,
            Boolean recommended,
            Boolean popular,
            int page,
            int size,
            String sortBy,
            Sort.Direction direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String safeSort = SORTABLE_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSort));
        Page<ProductResponse> result = productRepository
                .findAll(publicSpecification(
                        search, categoryUuid, minPrice, maxPrice, veg, featured, recommended, popular), pageable)
                .map(this::toResponse);
        return PageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID uuid) {
        Product product = findActive(uuid);
        if (!isPublic(product)) {
            throw new ResourceNotFoundException("Product not found");
        }
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAdminProducts(String search, int page, int size) {
        String normalized = search == null || search.isBlank() ? null : search.strip().toLowerCase(Locale.ROOT);
        Specification<Product> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.isNull(root.get("deletedAt")));
            if (normalized != null) {
                String pattern = "%" + normalized + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("name")), pattern),
                        builder.like(builder.lower(root.get("description")), pattern)));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        return PageResponse.from(productRepository.findAll(
                        specification,
                        PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                                Sort.by(Sort.Direction.DESC, "updatedAt")))
                .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getHighlighted(String field) {
        Specification<Product> specification = publicSpecification(
                null, null, null, null, null,
                "featured".equals(field) ? true : null,
                "recommended".equals(field) ? true : null,
                "popular".equals(field) ? true : null);
        return productRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "rating"))
                .stream().limit(20).map(this::toResponse).toList();
    }

    @Transactional
    public ProductResponse create(ProductRequest request, UUID adminUuid) {
        validateUniqueName(request.name(), null);
        Category category = findEnabledCategory(request.categoryUuid());
        Product product = new Product();
        product.setUuid(UUID.randomUUID());
        apply(product, request, category);
        product.setAvailable(false);
        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setStockQuantity(0);
        inventory.setLowStockThreshold(5);
        inventory.setVisible(true);
        Inventory savedInventory = inventoryRepository.save(inventory);
        saveHistory(savedInventory, 0, 0, InventoryChangeType.CREATED, "Product created", adminUuid);
        return toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse update(UUID uuid, ProductRequest request) {
        Product product = findActive(uuid);
        validateUniqueName(request.name(), product.getName());
        apply(product, request, findEnabledCategory(request.categoryUuid()));
        inventoryRepository.findByProductUuidAndDeletedAtIsNull(uuid).ifPresent(inventory -> {
            if (inventory.isOutOfStock() || !inventory.isVisible()) {
                product.setAvailable(false);
            }
        });
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void softDelete(UUID uuid) {
        Product product = findActive(uuid);
        product.setAvailable(false);
        product.setVisible(false);
        product.markDeleted();
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse restore(UUID uuid) {
        Product product = productRepository.findByUuid(uuid)
                .filter(Product::isDeleted)
                .orElseThrow(() -> new ResourceNotFoundException("Deleted product not found"));
        product.setDeletedAt(null);
        product.setVisible(true);
        product.setAvailable(inventoryRepository.findByProductUuidAndDeletedAtIsNull(uuid)
                .map(inventory -> inventory.isVisible() && !inventory.isOutOfStock())
                .orElse(false));
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public List<ProductResponse> bulkUpdate(BulkProductUpdateRequest request) {
        if (request.available() == null && request.visible() == null && request.featured() == null
                && request.recommended() == null && request.popular() == null && request.categoryId() == null) {
            throw new IllegalArgumentException("At least one bulk-update field is required");
        }
        List<UUID> uniqueIds = request.productIds().stream().distinct().toList();
        List<Product> products = productRepository.findAllByUuidInAndDeletedAtIsNull(uniqueIds);
        if (products.size() != uniqueIds.size()) {
            throw new ResourceNotFoundException("One or more products were not found");
        }
        Category category = request.categoryId() == null ? null : findEnabledCategory(request.categoryId());
        for (Product product : products) {
            if (category != null) product.setCategory(category);
            if (request.visible() != null) {
                product.setVisible(request.visible());
                if (!request.visible()) product.setAvailable(false);
            }
            if (request.available() != null) {
                boolean hasStock = inventoryRepository.findByProductUuidAndDeletedAtIsNull(product.getUuid())
                        .map(inventory -> inventory.isVisible() && !inventory.isOutOfStock()).orElse(false);
                product.setAvailable(request.available() && hasStock && product.isVisible()
                        && product.getCategory().isActive());
            }
            if (request.featured() != null) product.setFeatured(request.featured());
            if (request.recommended() != null) product.setRecommended(request.recommended());
            if (request.popular() != null) product.setPopular(request.popular());
        }
        return productRepository.saveAll(products).stream().map(this::toResponse).toList();
    }

    @Transactional
    public int bulkDelete(BulkProductDeleteRequest request) {
        List<UUID> uniqueIds = request.productIds().stream().distinct().toList();
        List<Product> products = productRepository.findAllByUuidInAndDeletedAtIsNull(uniqueIds);
        if (products.size() != uniqueIds.size()) {
            throw new ResourceNotFoundException("One or more products were not found");
        }
        products.forEach(product -> {
            product.setAvailable(false);
            product.setVisible(false);
            product.markDeleted();
        });
        productRepository.saveAll(products);
        return products.size();
    }

    private Specification<Product> publicSpecification(
            String search,
            UUID categoryUuid,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean veg,
            Boolean featured,
            Boolean recommended,
            Boolean popular) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.isNull(root.get("deletedAt")));
            predicates.add(builder.isTrue(root.get("available")));
            predicates.add(builder.isTrue(root.get("visible")));
            predicates.add(builder.isNull(root.get("category").get("deletedAt")));
            predicates.add(builder.isTrue(root.get("category").get("active")));
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.strip().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("name")), pattern),
                        builder.like(builder.lower(root.get("description")), pattern)));
            }
            if (categoryUuid != null) predicates.add(builder.equal(root.get("category").get("uuid"), categoryUuid));
            if (minPrice != null) predicates.add(builder.greaterThanOrEqualTo(root.get("price"), minPrice));
            if (maxPrice != null) predicates.add(builder.lessThanOrEqualTo(root.get("price"), maxPrice));
            if (veg != null) predicates.add(builder.equal(root.get("veg"), veg));
            if (featured != null) predicates.add(builder.equal(root.get("featured"), featured));
            if (recommended != null) predicates.add(builder.equal(root.get("recommended"), recommended));
            if (popular != null) predicates.add(builder.equal(root.get("popular"), popular));
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private boolean isPublic(Product product) {
        return product.isAvailable() && product.isVisible() && product.getCategory().isActive()
                && !product.getCategory().isDeleted();
    }

    private Product findActive(UUID uuid) {
        return productRepository.findByUuidAndDeletedAtIsNull(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private Category findEnabledCategory(UUID uuid) {
        return categoryRepository.findByUuidAndDeletedAtIsNull(uuid)
                .filter(Category::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active category not found"));
    }

    private void validateUniqueName(String name, String currentName) {
        String normalized = name.strip();
        if ((currentName == null || !currentName.equalsIgnoreCase(normalized))
                && productRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(normalized)) {
            throw new IllegalArgumentException("Product name already exists");
        }
    }

    private void apply(Product product, ProductRequest request, Category category) {
        product.setName(request.name().strip());
        product.setDescription(trimToNull(request.description()));
        product.setPrice(request.price());
        product.setOfferPrice(request.offerPrice());
        product.setImageUrl(trimToNull(request.imageUrl()));
        product.setCategory(category);
        product.setAvailable(request.available());
        product.setVisible(request.visible());
        product.setFeatured(request.featured());
        product.setRecommended(request.recommended());
        product.setBestSeller(request.bestseller());
        product.setPopular(request.popular());
        product.setRating(request.rating());
        product.setReviewCount(request.reviewCount());
        product.setPreparationTime(request.preparationTime());
        product.setCalories(request.calories());
        product.setVeg(request.veg());
    }

    private ProductResponse toResponse(Product product) {
        BigDecimal effectivePrice = product.getOfferPrice() == null ? product.getPrice() : product.getOfferPrice();
        return new ProductResponse(
                product.getUuid(), product.getName(), product.getDescription(), product.getPrice(),
                product.getOfferPrice(), effectivePrice, product.getImageUrl(), product.getCategory().getUuid(),
                product.getCategory().getName(), product.isAvailable(), product.isVisible(), product.isFeatured(),
                product.isRecommended(), product.isBestSeller(), product.isPopular(), product.getRating(),
                product.getReviewCount(), product.getPreparationTime(), product.getCalories(), product.isVeg(),
                product.getCreatedAt(), product.getUpdatedAt());
    }

    private void saveHistory(
            Inventory inventory,
            int previousQuantity,
            int newQuantity,
            InventoryChangeType type,
            String reason,
            UUID changedBy) {
        InventoryHistory history = new InventoryHistory();
        history.setInventory(inventory);
        history.setPreviousQuantity(previousQuantity);
        history.setNewQuantity(newQuantity);
        history.setChangeType(type);
        history.setReason(reason);
        history.setChangedBy(changedBy);
        inventoryHistoryRepository.save(history);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
