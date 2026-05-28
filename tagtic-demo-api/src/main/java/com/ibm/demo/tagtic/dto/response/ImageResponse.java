package com.ibm.demo.tagtic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageResponse {
    private UUID id;
    private UUID projectId;
    private String s3Bucket;
    private String s3Key;
    private Map<String, Object> metadata;
    private Instant createdAt;
}
