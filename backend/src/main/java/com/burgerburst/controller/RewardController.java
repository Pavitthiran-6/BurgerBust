package com.burgerburst.controller;

import com.burgerburst.dto.reward.RewardHistoryResponse;
import com.burgerburst.dto.reward.RewardSummaryResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.security.AuthenticatedUser;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@AuthenticatedUser
@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
@Tag(name = "Rewards")
public class RewardController {

    private final RewardService rewardService;

    @GetMapping
    @Operation(summary = "Get reward balance and lifetime totals")
    public ResponseEntity<ApiResponse<RewardSummaryResponse>> getRewards(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Rewards retrieved", rewardService.getSummary(principal.uuid())));
    }

    @GetMapping("/history")
    @Operation(summary = "Get paginated reward ledger history")
    public ResponseEntity<ApiResponse<PageResponse<RewardHistoryResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Reward history retrieved", rewardService.getHistory(principal.uuid(), page, size)));
    }
}
