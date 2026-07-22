package com.burgerburst.service;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.dto.reward.RewardHistoryResponse;
import com.burgerburst.dto.reward.RewardSummaryResponse;
import com.burgerburst.entity.RewardAccount;
import com.burgerburst.entity.RewardTransaction;
import com.burgerburst.entity.RewardTransactionType;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.RewardAccountRepository;
import com.burgerburst.repository.RewardTransactionRepository;
import com.burgerburst.repository.UserRepository;
import com.burgerburst.response.PageResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardAccountRepository accountRepository;
    private final RewardTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CommerceProperties commerceProperties;

    @Transactional
    public RewardSummaryResponse getSummary(UUID userUuid) {
        return toSummary(getOrCreate(userUuid));
    }

    @Transactional(readOnly = true)
    public PageResponse<RewardHistoryResponse> getHistory(UUID userUuid, int page, int size) {
        return PageResponse.from(transactionRepository
                .findByRewardAccountUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(
                        userUuid, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)))
                .map(this::toHistory));
    }

    @Transactional
    public void redeem(UUID userUuid, int points, UUID orderUuid) {
        if (points <= 0) return;
        RewardAccount account = accountRepository.findForUpdateByUserUuidAndDeletedAtIsNull(userUuid)
                .orElseThrow(() -> new BusinessRuleException("Insufficient reward points", HttpStatus.UNPROCESSABLE_ENTITY));
        if (account.getBalance() < points) {
            throw new BusinessRuleException("Insufficient reward points", HttpStatus.UNPROCESSABLE_ENTITY);
        }
        account.setBalance(account.getBalance() - points);
        account.setTotalRedeemed(account.getTotalRedeemed() + points);
        accountRepository.save(account);
        record(account, RewardTransactionType.REDEEM, -points, orderUuid, "Points redeemed for order");
    }

    @Transactional
    public int earn(UUID userUuid, BigDecimal eligibleAmount, UUID orderUuid) {
        int points = eligibleAmount.setScale(0, RoundingMode.DOWN).intValue()
                * commerceProperties.rewardPointsPerCurrencyUnit();
        if (points <= 0) return 0;
        RewardAccount account = getOrCreate(userUuid);
        account.setBalance(account.getBalance() + points);
        account.setTotalEarned(account.getTotalEarned() + points);
        accountRepository.save(account);
        record(account, RewardTransactionType.EARN, points, orderUuid, "Points earned from delivered order");
        return points;
    }

    @Transactional
    public void refund(UUID userUuid, int points, UUID orderUuid) {
        if (points <= 0) return;
        RewardAccount account = getOrCreate(userUuid);
        account.setBalance(account.getBalance() + points);
        account.setTotalRedeemed(Math.max(0, account.getTotalRedeemed() - points));
        accountRepository.save(account);
        record(account, RewardTransactionType.REFUND, points, orderUuid, "Redeemed points returned after cancellation");
    }

    @Transactional(readOnly = true)
    public int balance(UUID userUuid) {
        return accountRepository.findByUserUuidAndDeletedAtIsNull(userUuid).map(RewardAccount::getBalance).orElse(0);
    }

    private RewardAccount getOrCreate(UUID userUuid) {
        return accountRepository.findByUserUuidAndDeletedAtIsNull(userUuid).orElseGet(() -> {
            User user = userRepository.findByUuidAndDeletedAtIsNull(userUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            RewardAccount account = new RewardAccount();
            account.setUser(user);
            return accountRepository.save(account);
        });
    }

    private void record(
            RewardAccount account, RewardTransactionType type, int points, UUID orderUuid, String description) {
        RewardTransaction transaction = new RewardTransaction();
        transaction.setRewardAccount(account);
        transaction.setTransactionType(type);
        transaction.setPoints(points);
        transaction.setBalanceAfter(account.getBalance());
        transaction.setOrderUuid(orderUuid);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }

    private RewardSummaryResponse toSummary(RewardAccount account) {
        BigDecimal monetaryValue = commerceProperties.rewardPointValue()
                .multiply(BigDecimal.valueOf(account.getBalance())).setScale(2, RoundingMode.HALF_UP);
        return new RewardSummaryResponse(
                account.getBalance(), account.getTotalEarned(), account.getTotalRedeemed(),
                commerceProperties.rewardPointValue(), monetaryValue);
    }

    private RewardHistoryResponse toHistory(RewardTransaction transaction) {
        return new RewardHistoryResponse(
                transaction.getUuid(), transaction.getTransactionType(), transaction.getPoints(),
                transaction.getBalanceAfter(), transaction.getOrderUuid(), transaction.getDescription(),
                transaction.getCreatedAt());
    }
}
