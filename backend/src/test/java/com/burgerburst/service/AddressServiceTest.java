package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.address.AddressRequest;
import com.burgerburst.entity.User;
import com.burgerburst.entity.UserAddress;
import com.burgerburst.repository.UserAddressRepository;
import com.burgerburst.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock private UserAddressRepository addressRepository;
    @Mock private UserRepository userRepository;

    private AddressService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new AddressService(addressRepository, userRepository);
        user = new User();
        user.setUuid(UUID.randomUUID());
    }

    @Test
    void firstSavedAddressBecomesDefault() {
        when(addressRepository.countByUserUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(0L);
        when(addressRepository.findAllByUserUuidAndDeletedAtIsNullOrderByDefaultAddressDescCreatedAtAsc(user.getUuid()))
                .thenReturn(List.of());
        when(userRepository.findByUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(user));
        when(addressRepository.save(any(UserAddress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var saved = service.create(user.getUuid(), request());

        assertThat(saved.id()).isNotNull();
        assertThat(saved.defaultAddress()).isTrue();
        assertThat(saved.addressLine1()).isEqualTo("12 Cartoon Street");
    }

    @Test
    void deletingDefaultPromotesNextSavedAddress() {
        UserAddress current = address(true);
        UserAddress next = address(false);
        when(addressRepository.findByUuidAndUserUuidAndDeletedAtIsNull(current.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(current));
        when(addressRepository.findAllByUserUuidAndDeletedAtIsNullOrderByDefaultAddressDescCreatedAtAsc(user.getUuid()))
                .thenReturn(List.of(next));

        service.delete(user.getUuid(), current.getUuid());

        assertThat(current.isDeleted()).isTrue();
        assertThat(next.isDefaultAddress()).isTrue();
        verify(addressRepository).save(next);
    }

    private AddressRequest request() {
        return new AddressRequest(
                "Home", "HOME BASE", "Test Hero", "+919876543210", "12 Cartoon Street", null,
                "Chennai", "Tamil Nadu", "600001", "Leave at the door", false);
    }

    private UserAddress address(boolean defaultAddress) {
        UserAddress address = new UserAddress();
        address.setUuid(UUID.randomUUID());
        address.setUser(user);
        address.setDefaultAddress(defaultAddress);
        return address;
    }
}
