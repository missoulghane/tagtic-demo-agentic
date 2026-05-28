package com.ibm.demo.tagtic.dto.response;

import com.ibm.demo.tagtic.entity.FieldType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormFieldResponse {
    private UUID id;
    private UUID formId;
    private String name;
    private String label;
    private FieldType type;
    private Boolean required;
    private Integer orderIndex;
    private String defaultValue;
    private String jsonMappingKey;
    private Map<String, Object> validationRules;
}
