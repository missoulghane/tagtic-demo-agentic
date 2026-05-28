package com.ibm.demo.tagtic.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class AnnotationFieldValueRequest {

    @NotNull(message = "formFieldId is required")
    private UUID formFieldId;

    private String value;
}
