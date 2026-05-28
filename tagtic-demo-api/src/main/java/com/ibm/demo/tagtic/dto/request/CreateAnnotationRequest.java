package com.ibm.demo.tagtic.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateAnnotationRequest {

    private String annotatedBy;

    @NotNull(message = "Fields list is required")
    private List<AnnotationFieldValueRequest> fields;
}
