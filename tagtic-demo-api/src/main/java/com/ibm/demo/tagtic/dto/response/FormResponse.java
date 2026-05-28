package com.ibm.demo.tagtic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormResponse {
    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private Integer version;
    private String createdBy;
    private Instant createdAt;
}
