package com.burgerburst;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.config.CommerceProperties;
import com.burgerburst.config.ProductionProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties({ApplicationProperties.class, CommerceProperties.class, ProductionProperties.class})
public class BurgerBurstApplication {

    public static void main(String[] args) {
        SpringApplication.run(BurgerBurstApplication.class, args);
    }
}
