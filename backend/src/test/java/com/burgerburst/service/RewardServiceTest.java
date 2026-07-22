package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.entity.RewardAccount;
import com.burgerburst.entity.RewardTransaction;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.repository.RewardAccountRepository;
import com.burgerburst.repository.RewardTransactionRepository;
import com.burgerburst.repository.UserRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RewardServiceTest {

    @Mock private RewardAccountRepository accountRepository;
    @Mock private RewardTransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;

    private RewardService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new RewardService(accountRepository, transactionRepository, userRepository,
                new CommerceProperties(new BigDecimal("0.01"), 2, new BigDecimal("0.50"), 20));
        user = new User();
        user.setUuid(UUID.randomUUID());
    }

    @Test
    void createsEmptyAccountOnFirstRead() {
        when(userRepository.findByUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(user));
        when(accountRepository.save(any(RewardAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var summary = service.getSummary(user.getUuid());

        assertThat(summary.balance()).isZero();
        assertThat(summary.monetaryValue()).isEqualByComparingTo("0.00");
        verify(accountRepository).save(any(RewardAccount.class));
    }

    @Test
    void earnsConfiguredPoints() {
        RewardAccount account = account(10);
        when(accountRepository.findByUserUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(account));
        when(accountRepository.save(any(RewardAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(RewardTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        int earned = service.earn(user.getUuid(), new BigDecimal("12.90"), UUID.randomUUID());

        assertThat(earned).isEqualTo(24);
        assertThat(account.getBalance()).isEqualTo(34);
        assertThat(account.getTotalEarned()).isEqualTo(24);
    }

    @Test
    void redeemsPointsAndWritesLedger() {
        RewardAccount account = account(100);
        when(accountRepository.findForUpdateByUserUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(account));
        when(accountRepository.save(any(RewardAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(RewardTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.redeem(user.getUuid(), 40, UUID.randomUUID());

        assertThat(account.getBalance()).isEqualTo(60);
        assertThat(account.getTotalRedeemed()).isEqualTo(40);
        verify(transactionRepository).save(any(RewardTransaction.class));
    }

    @Test
    void rejectsInsufficientBalance() {
        RewardAccount account = account(10);
        when(accountRepository.findForUpdateByUserUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> service.redeem(user.getUuid(), 11, UUID.randomUUID()))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("Insufficient");
    }

    private RewardAccount account(int balance) {
        RewardAccount account = new RewardAccount();
        account.setUser(user);
        account.setBalance(balance);
        return account;
    }
}
