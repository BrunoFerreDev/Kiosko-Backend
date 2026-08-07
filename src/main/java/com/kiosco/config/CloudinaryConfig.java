package com.kiosco.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dwgtakywz");
        config.put("api_key", "355437916445728");
        config.put("api_secret", "A7fBmaV8LlMnT9dvUZWdWI7hk_4");
        return new Cloudinary(config);
    }
}
