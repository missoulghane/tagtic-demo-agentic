package com.ibm.demo.tagtic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class AddImageRequest {

    @NotBlank(message = "S3 bucket is required")
    private String s3Bucket;

    @NotBlank(message = "S3 key is required")
    private String s3Key;

    private Map<String, Object> metadata;
}
