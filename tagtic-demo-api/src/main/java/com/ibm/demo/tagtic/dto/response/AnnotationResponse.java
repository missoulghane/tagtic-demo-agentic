package com.ibm.demo.tagtic.dto.response;

import com.ibm.demo.tagtic.entity.AnnotationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationResponse {
    private UUID id;
    private UUID projectId;
    private UUID imageId;
    private String annotatedBy;
    private Instant annotatedAt;
    private AnnotationStatus status;
    private List<AnnotationFieldValueResponse> fields;
}
