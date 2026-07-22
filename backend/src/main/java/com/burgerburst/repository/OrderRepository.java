package com.burgerburst.repository;

import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.OrderStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    Page<CustomerOrder> findByUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userUuid, Pageable pageable);
    Optional<CustomerOrder> findByUuidAndUserUuidAndDeletedAtIsNull(UUID uuid, UUID userUuid);
    Optional<CustomerOrder> findByUuidAndDeletedAtIsNull(UUID uuid);
    boolean existsByUserUuidAndDeletedAtIsNull(UUID userUuid);
    long countByStatusAndDeletedAtIsNull(OrderStatus status);

    @EntityGraph(attributePaths = "user")
    @Query("""
            select distinct order from CustomerOrder order join order.user user
            where order.deletedAt is null
              and (:status is null or order.status = :status)
              and (:search = ''
                   or lower(order.orderNumber) like lower(concat('%', :search, '%'))
                   or lower(user.fullName) like lower(concat('%', :search, '%'))
                   or lower(user.email) like lower(concat('%', :search, '%')))
            order by order.createdAt desc
            """)
    Page<CustomerOrder> searchAdmin(
            @Param("status") OrderStatus status,
            @Param("search") String search,
            Pageable pageable);
}
