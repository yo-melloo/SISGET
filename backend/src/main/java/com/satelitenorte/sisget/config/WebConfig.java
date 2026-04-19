package com.satelitenorte.sisget.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Desativado em favor da configuração centralizada no SecurityConfig
        // para evitar conflitos no Spring Security 6.
    }
}
