package com.ibm.demo.tagtic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrefilledAnnotationFormResponse {
    private UUID imageId;
    private List<PrefilledFieldResponse> fields;
}
