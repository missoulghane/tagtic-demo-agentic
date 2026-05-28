package com.ibm.demo.tagtic.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI tagticOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("TAGTIC — Image Annotation API")
                        .description("REST API for managing annotation projects, forms, images and annotations.")
                        .version("1.0.0"));
    }
}
