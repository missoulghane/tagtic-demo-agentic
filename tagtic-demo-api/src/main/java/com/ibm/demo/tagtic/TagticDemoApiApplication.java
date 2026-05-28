package com.ibm.demo.tagtic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class TagticDemoApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TagticDemoApiApplication.class, args);
    }
}
