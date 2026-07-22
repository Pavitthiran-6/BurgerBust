package com.burgerburst.otp;

import com.burgerburst.config.ApplicationProperties;
import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class OtpGenerator {

    private final SecureRandom secureRandom = new SecureRandom();
    private final int length;

    public OtpGenerator(ApplicationProperties properties) {
        this.length = properties.otp().length();
        if (length < 4 || length > 9) {
            throw new IllegalArgumentException("OTP length must be between 4 and 9 digits");
        }
    }

    public String generate() {
        int bound = (int) Math.pow(10, length);
        int value = secureRandom.nextInt(bound);
        return String.format("%0" + length + "d", value);
    }
}
