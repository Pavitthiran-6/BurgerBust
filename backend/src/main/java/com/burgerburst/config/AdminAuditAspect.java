package com.burgerburst.config;

import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.AdminAuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class AdminAuditAspect {

    private final AdminAuditService auditService;

    @Around("@within(com.burgerburst.security.AdminOnly) || @annotation(com.burgerburst.security.AdminOnly)")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes == null ? null : attributes.getRequest();
        if (request == null || isReadOnly(request.getMethod())) return joinPoint.proceed();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = authentication != null && authentication.getPrincipal() instanceof UserPrincipal user
                ? user : null;
        long started = System.nanoTime();
        try {
            Object result = joinPoint.proceed();
            auditService.record(
                    principal == null ? null : principal.uuid(), principal == null ? null : principal.email(),
                    request.getMethod(), request.getRequestURI(), "SUCCESS",
                    joinPoint.getSignature().toShortString(), MDC.get("requestId"), elapsed(started));
            return result;
        } catch (Throwable throwable) {
            auditService.record(
                    principal == null ? null : principal.uuid(), principal == null ? null : principal.email(),
                    request.getMethod(), request.getRequestURI(), "FAILURE",
                    throwable.getClass().getSimpleName() + ": " + throwable.getMessage(),
                    MDC.get("requestId"), elapsed(started));
            throw throwable;
        }
    }

    private boolean isReadOnly(String method) {
        return "GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method);
    }

    private long elapsed(long started) {
        return (System.nanoTime() - started) / 1_000_000;
    }
}
