package com.burgerburst.repository;

import com.burgerburst.entity.UserAddress;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findAllByUserUuidAndDeletedAtIsNullOrderByDefaultAddressDescCreatedAtAsc(UUID userUuid);

    Optional<UserAddress> findByUuidAndUserUuidAndDeletedAtIsNull(UUID uuid, UUID userUuid);

    long countByUserUuidAndDeletedAtIsNull(UUID userUuid);
}
