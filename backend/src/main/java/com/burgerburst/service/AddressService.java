package com.burgerburst.service;

import com.burgerburst.dto.address.AddressRequest;
import com.burgerburst.dto.address.AddressResponse;
import com.burgerburst.entity.User;
import com.burgerburst.entity.UserAddress;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.UserAddressRepository;
import com.burgerburst.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AddressService {

    private static final int MAX_ADDRESSES = 5;

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> list(UUID userUuid) {
        return addresses(userUuid).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AddressResponse create(UUID userUuid, AddressRequest request) {
        if (addressRepository.countByUserUuidAndDeletedAtIsNull(userUuid) >= MAX_ADDRESSES) {
            throw new BusinessRuleException(
                    "A maximum of 5 delivery addresses can be saved", HttpStatus.UNPROCESSABLE_ENTITY);
        }
        if (addresses(userUuid).stream().anyMatch(address -> sameLocation(address, request))) {
            throw new BusinessRuleException("This delivery address is already saved", HttpStatus.CONFLICT);
        }

        User user = userRepository.findByUuidAndDeletedAtIsNull(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean makeDefault = request.defaultAddress()
                || addressRepository.countByUserUuidAndDeletedAtIsNull(userUuid) == 0;
        if (makeDefault) {
            clearDefault(userUuid);
        }

        UserAddress address = new UserAddress();
        address.setUuid(UUID.randomUUID());
        address.setUser(user);
        apply(address, request);
        address.setDefaultAddress(makeDefault);
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse setDefault(UUID userUuid, UUID addressUuid) {
        UserAddress selected = find(userUuid, addressUuid);
        clearDefault(userUuid);
        selected.setDefaultAddress(true);
        return toResponse(addressRepository.save(selected));
    }

    @Transactional
    public void delete(UUID userUuid, UUID addressUuid) {
        UserAddress address = find(userUuid, addressUuid);
        boolean wasDefault = address.isDefaultAddress();
        address.setDefaultAddress(false);
        address.markDeleted();
        addressRepository.save(address);

        if (wasDefault) {
            addresses(userUuid).stream().findFirst().ifPresent(next -> {
                next.setDefaultAddress(true);
                addressRepository.save(next);
            });
        }
    }

    private UserAddress find(UUID userUuid, UUID addressUuid) {
        return addressRepository.findByUuidAndUserUuidAndDeletedAtIsNull(addressUuid, userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery address not found"));
    }

    private List<UserAddress> addresses(UUID userUuid) {
        return addressRepository
                .findAllByUserUuidAndDeletedAtIsNullOrderByDefaultAddressDescCreatedAtAsc(userUuid);
    }

    private void clearDefault(UUID userUuid) {
        List<UserAddress> defaults = addresses(userUuid).stream()
                .filter(UserAddress::isDefaultAddress)
                .toList();
        defaults.forEach(address -> address.setDefaultAddress(false));
        if (!defaults.isEmpty()) {
            addressRepository.saveAll(defaults);
            addressRepository.flush();
        }
    }

    private boolean sameLocation(UserAddress address, AddressRequest request) {
        return address.getAddressLine1().equalsIgnoreCase(request.addressLine1().strip())
                && address.getPostalCode().equalsIgnoreCase(request.postalCode().strip());
    }

    private void apply(UserAddress address, AddressRequest request) {
        address.setLabel(request.label().strip());
        address.setTag(request.tag().strip());
        address.setRecipientName(request.recipientName().strip());
        address.setPhone(request.phone().strip());
        address.setAddressLine1(request.addressLine1().strip());
        address.setAddressLine2(trimToNull(request.addressLine2()));
        address.setCity(request.city().strip());
        address.setState(request.state().strip());
        address.setPostalCode(request.postalCode().strip());
        address.setDeliveryInstructions(trimToNull(request.deliveryInstructions()));
    }

    private AddressResponse toResponse(UserAddress address) {
        return new AddressResponse(
                address.getUuid(), address.getLabel(), address.getTag(), address.getRecipientName(),
                address.getPhone(), address.getAddressLine1(), address.getAddressLine2(), address.getCity(),
                address.getState(), address.getPostalCode(), address.getDeliveryInstructions(),
                address.isDefaultAddress(), address.getCreatedAt(), address.getUpdatedAt());
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
