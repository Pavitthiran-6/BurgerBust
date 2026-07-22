package com.burgerburst.controller;

import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.AdminReportService;
import com.burgerburst.service.ReportFile;
import com.burgerburst.service.ReportFormat;
import com.burgerburst.service.ReportType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin Reports")
public class AdminReportController {

    private final AdminReportService reportService;
    private final Clock clock;

    @GetMapping("/{type}")
    @Operation(summary = "Export sales, product, customer, inventory, or payment data as CSV or XLSX")
    public ResponseEntity<byte[]> export(
            @PathVariable ReportType type,
            @RequestParam(defaultValue = "CSV") ReportFormat format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        Instant safeTo = to == null ? clock.instant() : to;
        Instant safeFrom = from == null ? safeTo.minus(30, ChronoUnit.DAYS) : from;
        ReportFile file = reportService.export(type, format, safeFrom, safeTo);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(file.contentType()))
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.filename() + "\"")
                .body(file.content());
    }
}
