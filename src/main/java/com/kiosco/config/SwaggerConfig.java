package com.kiosco.config;

import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public SpringDocUtils springDocUtils() {
        return SpringDocUtils.getConfig();
    }
}
