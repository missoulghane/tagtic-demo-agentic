package com.ibm.demo.tagtic.dto.request;

import com.ibm.demo.tagtic.entity.FieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class AddFieldRequest {

    @NotBlank(message = "Field name is required")
    private String name;

    private String label;

    @NotNull(message = "Field type is required")
    private FieldType type;

    private Boolean required = false;

    private Integer orderIndex;

    private String defaultValue;

    private String jsonMappingKey;

    private Map<String, Object> validationRules;
}
